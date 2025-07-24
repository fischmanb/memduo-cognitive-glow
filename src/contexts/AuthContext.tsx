
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { apiClient } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  email: string | null;
  
  isBackendAuth: boolean;
  backendUser: any | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  setBackendAuth: (authenticated: boolean, user: any | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

console.log('🔧 AuthContext: Context created');

export const useAuth = () => {
  console.log('🔧 useAuth: Hook called');
  const context = useContext(AuthContext);
  console.log('🔧 useAuth: Context value:', context ? 'defined' : 'undefined');
  if (context === undefined) {
    console.error('🔧 useAuth: Context is undefined - AuthProvider not found in component tree');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  console.log('🔧 AuthProvider: Component initializing...');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  
  const [isBackendAuth, setIsBackendAuthState] = useState(false);
  const [backendUser, setBackendUser] = useState<any | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    // Check for existing session
    const initializeAuth = async () => {
      try {
        // PRIORITY 1: Check for backend authentication first
        const backendToken = localStorage.getItem('memduo_token');
        const backendAuth = localStorage.getItem('memduo_backend_auth') === 'true';
        const userEmail = localStorage.getItem('memduo_user_email');
        const userData = localStorage.getItem('memduo_user_data');
        
        if (backendAuth && backendToken && isMounted) {
          console.log('🔐 Found existing backend auth - using it');
          setIsBackendAuthState(true);
          setEmail(userEmail || '');
          if (userData) {
            try {
              setBackendUser(JSON.parse(userData));
            } catch (e) {
              console.error('Failed to parse user data:', e);
            }
          }
          setIsAuthenticated(true);
          setIsLoading(false);
          // Skip Supabase entirely when we have backend auth
          return;
        }
        
        // PRIORITY 2: Only check Supabase if no backend auth
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (isMounted) {
            setIsLoading(false);
          }
          return;
        }

        if (session?.user && isMounted) {
          console.log('🔐 Found existing Supabase session');
          setUser(session.user);
          setIsAuthenticated(true);
          setEmail(session.user.email || null);
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Only listen to Supabase auth if no backend auth exists
    const setupSupabaseListener = () => {
      const hasBackendAuth = localStorage.getItem('memduo_backend_auth') === 'true';
      if (hasBackendAuth) {
        console.log('🔒 Backend auth active - skipping Supabase listener');
        return { data: { subscription: { unsubscribe: () => {} } } };
      }

      return supabase.auth.onAuthStateChange((event, session) => {
        console.log('Supabase auth state changed:', event, session?.user?.email || 'no user');
        
        if (!isMounted) return;
        
        // Double-check backend auth hasn't been set since listener was created
        const currentBackendAuth = localStorage.getItem('memduo_backend_auth') === 'true';
        if (currentBackendAuth) {
          console.log('🔒 Backend auth now active - ignoring Supabase event');
          return;
        }
        
        if (session?.user) {
          setUser(session.user);
          setEmail(session.user.email || null);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setEmail(null);
        }
        
        setIsLoading(false);
      });
    };

    const { data: { subscription } } = setupSupabaseListener();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Step 1: Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Supabase login error:', error);
        return false;
      }

      if (data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        setEmail(data.user.email || null);
        
        // Step 2: Authenticate with backend to get token
        console.log('🔄 Getting backend token after Supabase login...');
        try {
          const loginResponse = await apiClient.login({
            email,
            password
          });

          if (loginResponse.access_token) {
            // Store backend token and user data
            localStorage.setItem('memduo_token', loginResponse.access_token);
            localStorage.setItem('memduo_backend_auth', 'true');
            localStorage.setItem('memduo_user_email', email);
            if (loginResponse.user) {
              localStorage.setItem('memduo_user_data', JSON.stringify(loginResponse.user));
            }

            // Set backend auth state
            setIsBackendAuthState(true);
            setBackendUser(loginResponse.user || null);
            console.log('✅ Backend authentication successful after Supabase login');
          }
        } catch (backendAuthError) {
          console.error('❌ Backend authentication failed after Supabase login:', backendAuthError);
          // Continue anyway - user has Supabase account
        }
        
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
      
      // Step 1: Register with backend first
      console.log('🔄 Registering with backend...');
      try {
        await apiClient.register({
          email,
          password,
          first_name: firstName,
          last_name: lastName
        });
        console.log('✅ Backend registration successful');
      } catch (backendError) {
        console.log('⚠️ Backend registration failed, continuing with Supabase...');
        // Continue anyway - user might already exist in backend
      }
      
      // Step 2: Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });

      if (error) {
        console.error('Supabase registration error:', error);
        return false;
      }

      if (data.user) {
        // Step 3: Authenticate with backend to get token
        console.log('🔄 Getting backend token after registration...');
        try {
          const loginResponse = await apiClient.login({
            email,
            password
          });

          if (loginResponse.access_token) {
            // Store backend token and user data
            localStorage.setItem('memduo_token', loginResponse.access_token);
            localStorage.setItem('memduo_backend_auth', 'true');
            localStorage.setItem('memduo_user_email', email);
            if (loginResponse.user) {
              localStorage.setItem('memduo_user_data', JSON.stringify(loginResponse.user));
            }

            // Set backend auth state
            setIsBackendAuthState(true);
            setBackendUser(loginResponse.user || null);
            console.log('✅ Backend authentication successful after registration');
          }
        } catch (backendAuthError) {
          console.error('❌ Backend authentication failed after registration:', backendAuthError);
          // Continue anyway - user has Supabase account
        }
        
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
      
      // Clear all auth state
      localStorage.removeItem('memduo_token');
      localStorage.removeItem('memduo_backend_auth');
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
    console.log('🔧 setBackendAuth called:', { authenticated, user: user?.email || 'no user' });
    setIsBackendAuthState(authenticated);
    setBackendUser(user);
    if (authenticated) {
      setIsAuthenticated(true);
      setEmail(user?.email || localStorage.getItem('memduo_user_email') || null);
    } else {
      // Only clear auth if we're not authenticated via Supabase either
      if (!user) {
        setIsAuthenticated(false);
        setEmail(null);
      }
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    email,
    isBackendAuth,
    backendUser,
    login,
    logout,
    register,
    resetPassword,
    setBackendAuth,
  };

  console.log('🔧 AuthProvider: Rendering with value:', { isAuthenticated, isLoading, email });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
