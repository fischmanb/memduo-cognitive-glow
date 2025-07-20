
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from "@/lib/api";

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
    // Check for existing MemDuo token
    const token = localStorage.getItem("memduo_token");
    const storedEmail = localStorage.getItem("memduo_email");
    
    if (token && storedEmail) {
      // Verify token by fetching user info
      apiClient.getCurrentUser()
        .then((userData) => {
          setUser(userData);
          setIsAuthenticated(true);
          setEmail(userData.email || storedEmail);
        })
        .catch(() => {
          // Token is invalid, clear it
          localStorage.removeItem("memduo_token");
          localStorage.removeItem("memduo_email");
          setIsAuthenticated(false);
          setUser(null);
          setEmail(null);
        });
    }

    // Check for legacy auth (keep for compatibility)
    const legacyAuthStatus = localStorage.getItem('memduo_auth');
    if (legacyAuthStatus === 'authenticated' && storedEmail && !token) {
      setIsAuthenticated(true);
      setEmail(storedEmail);
    }
  }, []);

  const login = async (password: string, userEmail?: string): Promise<boolean> => {
    try {
      console.log("Login attempt:", { userEmail, hasPassword: !!password });
      
      // Try legacy password first (for compatibility)
      if (VALID_PASSWORDS.includes(password)) {
        console.log("Using legacy password authentication");
        setIsAuthenticated(true);
        localStorage.setItem('memduo_auth', 'authenticated');
        if (userEmail) {
          setEmail(userEmail);
          localStorage.setItem('memduo_email', userEmail);
        }
        return true;
      }

      // Use MemDuo FastAPI backend for authentication
      if (userEmail && password) {
        console.log("Attempting FastAPI backend login");
        const response = await apiClient.login({
          email: userEmail,
          password: password
        });

        console.log("FastAPI login response:", response);

        // Store the JWT token
        localStorage.setItem("memduo_token", response.access_token);
        localStorage.setItem("memduo_email", userEmail);
        
        // Fetch user details
        try {
          const userData = await apiClient.getCurrentUser();
          console.log("User data fetched:", userData);
          setUser(userData);
        } catch (err) {
          console.log("Could not fetch user data, using basic info");
          // If we can't fetch user data, just use basic info
          setUser({ email: userEmail });
        }
        
        setIsAuthenticated(true);
        setEmail(userEmail);
        
        // Redirect to existing MemDuo frontend with token
        const existingAppUrl = `http://3.144.130.186:3000?token=${response.access_token}`;
        window.location.href = existingAppUrl;
        
        return true;
      }

      console.log("No valid login path found");
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const setUserEmail = (userEmail: string) => {
    setEmail(userEmail);
    localStorage.setItem('memduo_email', userEmail);
  };

  const logout = async () => {
    setIsAuthenticated(false);
    setUser(null);
    setEmail(null);
    
    // Clear MemDuo tokens
    localStorage.removeItem("memduo_token");
    localStorage.removeItem("memduo_email");
    
    // Clear legacy tokens
    localStorage.removeItem('memduo_auth');
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
