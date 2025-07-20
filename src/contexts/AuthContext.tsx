
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  isAuthenticated: boolean;
  email: string | null;
  login: (password: string, email?: string) => Promise<boolean>;
  logout: () => void;
  setUserEmail: (email: string) => void;
  user: any | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MASTER_PASSWORD = "xN$Z3m*Pu9!q67VMEkDyYhBp2WAfsRt#XLbgUcJzFo81^rCnQa@e4+svK!THdM%iL5wNzE_jX^9&RGUu#ybVm$PqoYCZtlMBhf7nADJrx%S*83EWKgT+p3HRdkA$_zFNjvVBwX95q!4YeTruXKJ*Q^gmLhAZ8os1MF^RW2&uUEPqNDJbGh6LVz";

// This array can be extended with single-use passwords
const VALID_PASSWORDS = [MASTER_PASSWORD];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    // Check for legacy auth first
    const authStatus = localStorage.getItem('memduo_auth');
    const storedEmail = localStorage.getItem('memduo_email');
    
    if (authStatus === 'authenticated') {
      setIsAuthenticated(true);
      setEmail(storedEmail);
    }

    // Set up Supabase auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setIsAuthenticated(true);
          setUser(session.user);
          setEmail(session.user.email || null);
          localStorage.setItem('memduo_auth', 'authenticated');
          localStorage.setItem('memduo_email', session.user.email || '');
        } else if (event === 'SIGNED_OUT') {
          // Only clear if not using legacy auth
          const legacyAuth = localStorage.getItem('memduo_auth');
          if (legacyAuth !== 'authenticated') {
            setIsAuthenticated(false);
            setUser(null);
            setEmail(null);
            localStorage.removeItem('memduo_auth');
            localStorage.removeItem('memduo_email');
          }
        }
      }
    );

    // Check for existing Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsAuthenticated(true);
        setUser(session.user);
        setEmail(session.user.email || null);
        localStorage.setItem('memduo_auth', 'authenticated');
        localStorage.setItem('memduo_email', session.user.email || '');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (password: string, userEmail?: string): Promise<boolean> => {
    // Try legacy password first
    if (VALID_PASSWORDS.includes(password)) {
      setIsAuthenticated(true);
      localStorage.setItem('memduo_auth', 'authenticated');
      if (userEmail) {
        setEmail(userEmail);
        localStorage.setItem('memduo_email', userEmail);
      }
      return true;
    }

    // Try Supabase authentication if email provided
    if (userEmail) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: userEmail,
          password: password,
        });

        if (error) {
          return false;
        }

        if (data.user) {
          setIsAuthenticated(true);
          setUser(data.user);
          setEmail(data.user.email || null);
          localStorage.setItem('memduo_auth', 'authenticated');
          localStorage.setItem('memduo_email', data.user.email || '');
          return true;
        }
      } catch (err) {
        console.error('Supabase login error:', err);
      }
    }

    return false;
  };

  const setUserEmail = (userEmail: string) => {
    setEmail(userEmail);
    localStorage.setItem('memduo_email', userEmail);
  };

  const logout = async () => {
    // Sign out from Supabase if user is logged in there
    if (user) {
      await supabase.auth.signOut();
    }
    
    setIsAuthenticated(false);
    setUser(null);
    setEmail(null);
    localStorage.removeItem('memduo_auth');
    localStorage.removeItem('memduo_email');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, email, login, logout, setUserEmail, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
