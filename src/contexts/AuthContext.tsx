
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MASTER_PASSWORD = "xN$Z3m*Pu9!q67VMEkDyYhBp2WAfsRt#XLbgUcJzFo81^rCnQa@e4+svK!THdM%iL5wNzE_jX^9&RGUu#ybVm$PqoYCZtlMBhf7nADJrx%S*83EWKgT+p3HRdkA$_zFNjvVBwX95q!4YeTruXKJ*Q^gmLhAZ8os1MF^RW2&uUEPqNDJbGh6LVz";

// This array can be extended with single-use passwords
const VALID_PASSWORDS = [MASTER_PASSWORD];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authStatus = localStorage.getItem('memduo_auth');
    setIsAuthenticated(authStatus === 'authenticated');
  }, []);

  const login = (password: string): boolean => {
    if (VALID_PASSWORDS.includes(password)) {
      setIsAuthenticated(true);
      localStorage.setItem('memduo_auth', 'authenticated');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('memduo_auth');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
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
