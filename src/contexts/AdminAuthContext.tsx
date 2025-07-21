import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AdminAuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdminStatus = async (userId: string) => {
    try {
      console.log('Checking admin status for user:', userId);
      const { data, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no record exists
      
      console.log('Admin check result:', { data, error });
      
      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
      
      const isAdmin = !!data;
      console.log('User is admin:', isAdmin);
      return isAdmin;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Check if user is admin
          setTimeout(async () => {
            const adminStatus = await checkAdminStatus(session.user.id);
            setIsAdmin(adminStatus);
            setLoading(false);
          }, 0);
        } else {
          setIsAdmin(false);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkAdminStatus(session.user.id).then((adminStatus) => {
          setIsAdmin(adminStatus);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setLoading(false);
        return { error };
      }

      if (data.user) {
        const adminStatus = await checkAdminStatus(data.user.id);
        if (!adminStatus) {
          await supabase.auth.signOut();
          setLoading(false);
          return { error: { message: 'Access denied. Admin privileges required.' } };
        }
        
        // Redirect to admin dashboard after successful login
        window.location.href = '/admin';
      }

      return { error: null };
    } catch (error) {
      setLoading(false);
      return { error };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  const value = {
    user,
    session,
    isAuthenticated: !!user && isAdmin,
    isAdmin,
    login,
    logout,
    loading,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};