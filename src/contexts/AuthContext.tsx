
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  email: string | null;
  login: (password: string, email?: string) => boolean;
  logout: () => void;
  setUserEmail: (email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MASTER_PASSWORD = "xN$Z3m*Pu9!q67VMEkDyYhBp2WAfsRt#XLbgUcJzFo81^rCnQa@e4+svK!THdM%iL5wNzE_jX^9&RGUu#ybVm$PqoYCZtlMBhf7nADJrx%S*83EWKgT+p3HRdkA$_zFNjvVBwX95q!4YeTruXKJ*Q^gmLhAZ8os1MF^RW2&uUEPqNDJbGh6LVz";

// This array can be extended with single-use passwords
const VALID_PASSWORDS = [MASTER_PASSWORD];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const authStatus = localStorage.getItem('memduo_auth');
    const storedEmail = localStorage.getItem('memduo_email');
    setIsAuthenticated(authStatus === 'authenticated');
    setEmail(storedEmail);
  }, []);

  const login = (password: string, userEmail?: string): boolean => {
    if (VALID_PASSWORDS.includes(password)) {
      setIsAuthenticated(true);
      localStorage.setItem('memduo_auth', 'authenticated');
      if (userEmail) {
        setEmail(userEmail);
        localStorage.setItem('memduo_email', userEmail);
      }
      return true;
    }
    return false;
  };

  const setUserEmail = (userEmail: string) => {
    setEmail(userEmail);
    localStorage.setItem('memduo_email', userEmail);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setEmail(null);
    localStorage.removeItem('memduo_auth');
    localStorage.removeItem('memduo_email');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, email, login, logout, setUserEmail }}>
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
