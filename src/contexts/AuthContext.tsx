
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { apiClient } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  email: string | null;
  isDemoMode: boolean;
  isBackendAuth: boolean;
  backendUser: any | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  setBackendAuth: (authenticated: boolean, user: any | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isBackendAuth, setIsBackendAuthState] = useState(false);
  const [backendUser, setBackendUser] = useState<any | null>(null);

  useEffect(() => {
    // Check for existing session
    const getSession = async () => {
      try {
        // Check for demo mode
        const demoMode = localStorage.getItem('memduo_demo_mode');
        const demoEmail = localStorage.getItem('memduo_demo_email');
        
        if (demoMode === 'true') {
          setIsDemoMode(true);
          setIsAuthenticated(true);
          setEmail(demoEmail || 'demo@memduo.com');
          setIsLoading(false);
          return;
        }

        // Check for backend authentication
        const backendAuth = localStorage.getItem('memduo_backend_auth');
        const backendToken = localStorage.getItem('memduo_token');
        const backendEmail = localStorage.getItem('memduo_user_email');
        const backendUserData = localStorage.getItem('memduo_user_data');
        
        if (backendAuth === 'true' && backendToken) {
          try {
            // Verify token is still valid by calling a protected endpoint
            await apiClient.getCurrentUser();
            
            setIsBackendAuthState(true);
            setIsAuthenticated(true);
            setEmail(backendEmail);
            
            if (backendUserData) {
              setBackendUser(JSON.parse(backendUserData));
            }
            setIsLoading(false);
            return;
          } catch (error) {
            console.error('Backend token validation failed:', error);
            // Clear invalid backend auth
            localStorage.removeItem('memduo_backend_auth');
            localStorage.removeItem('memduo_token');
            localStorage.removeItem('memduo_user_email');
            localStorage.removeItem('memduo_user_data');
          }
        }
        
        // Check for real Supabase session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
          setEmail(session.user.email || null);
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      
      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
        setEmail(session.user.email || null);
      } else {
        setUser(null);
        if (!isDemoMode && !isBackendAuth) {
          setIsAuthenticated(false);
          setEmail(null);
        }
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [isDemoMode, isBackendAuth]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        return false;
      }

      if (data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        setEmail(data.user.email || null);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });

      if (error) {
        console.error('Registration error:', error);
        return false;
      }

      if (data.user) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Clear demo mode
      localStorage.removeItem('memduo_demo_mode');
      localStorage.removeItem('memduo_demo_email');
      
      // Clear backend auth
      localStorage.removeItem('memduo_backend_auth');
      localStorage.removeItem('memduo_token');
      localStorage.removeItem('memduo_user_email');
      localStorage.removeItem('memduo_user_data');
      
      // Clear Supabase auth state
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error('Logout error:', error);
      }
      
      // Reset all auth states
      setUser(null);
      setIsAuthenticated(false);
      setEmail(null);
      setIsDemoMode(false);
      setIsBackendAuthState(false);
      setBackendUser(null);
      
      // Force redirect to root to go back to access gate
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('Password reset error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      return false;
    }
  };

  const setBackendAuth = (authenticated: boolean, user: any | null) => {
    setIsBackendAuthState(authenticated);
    setBackendUser(user);
    if (authenticated) {
      setIsAuthenticated(true);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    email,
    isDemoMode,
    isBackendAuth,
    backendUser,
    login,
    logout,
    register,
    resetPassword,
    setBackendAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
