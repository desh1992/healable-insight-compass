import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from "@/components/ui/sonner";
import { 
  getAccessToken, 
  setAccessToken as setStoredAccessToken, 
  getUserInfo, 
  setUserInfo as setStoredUserInfo, 
  clearAuthStorage,
  StoredUserInfo,
  setEthicsAgreed,
  getEthicsAgreed
} from '@/utils/storage';

// Define the user roles
export type UserRole = 'physician' | 'caseManager' | 'admin' | 'analyst';

interface UserInfo {
  userId: string;
  name: string;
  role: string;
  email: string;
  department?: string;
  access_token: string;
  token_type: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
  hasAgreedToEthics: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  setHasAgreedToEthics: (agreed: boolean) => void;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasAgreedToEthics, setHasAgreedToEthics] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuthState = () => {
      const storedToken = getAccessToken();
      const storedUserInfo = getUserInfo();
      const storedEthicsAgreed = getEthicsAgreed();

      // If we have both token and user info, set authenticated state
      if (storedToken && storedUserInfo) {
        setIsAuthenticated(true);
        setUserInfo(storedUserInfo);
      }

      // Set ethics agreement state
      if (storedEthicsAgreed) {
        setHasAgreedToEthics(true);
      }
    };

    initializeAuthState();
  }, []); // Only run on mount

  // Handle routing based on auth state
  useEffect(() => {
    const handleAuthRouting = () => {
      const currentPath = location.pathname;
      
      if (isAuthenticated) {
        if (!hasAgreedToEthics && currentPath !== '/ethics-agreement') {
          // If authenticated but hasn't agreed to ethics, redirect to ethics page
          navigate('/ethics-agreement', { state: { from: location }, replace: true });
        }
      } else if (currentPath !== '/login') {
        // If not authenticated and not on login page, redirect to login
        navigate('/login', { state: { from: location }, replace: true });
      }
    };

    handleAuthRouting();
  }, [isAuthenticated, hasAgreedToEthics, location.pathname, navigate]);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      const response = await fetch('https://healable-insights-backend-f8567b9c5516.herokuapp.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          role
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.detail || "Login failed. Please check your credentials.");
        return false;
      }

      const data = await response.json();
      
      // Store the user info and token
      const userInfo: UserInfo = {
        userId: data.userId,
        name: data.name,
        email: data.email,
        role: data.role,
        department: data.department || '',
        access_token: data.access_token,
        token_type: data.token_type,
      };

      // Store token and user info in localStorage for persistence
      setStoredAccessToken(data.access_token);
      setStoredUserInfo(userInfo);

      // Update React state
      setUserInfo(userInfo);
      setIsAuthenticated(true);

      toast.success("Login successful");
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error("An error occurred during login. Please try again.");
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserInfo(null);
    setHasAgreedToEthics(false);
    clearAuthStorage();
    navigate('/login', { replace: true });
  };

  const handleSetHasAgreedToEthics = (agreed: boolean) => {
    setHasAgreedToEthics(agreed);
    setEthicsAgreed(agreed);
    
    // After agreeing to ethics, navigate to intended destination or dashboard
    const intendedPath = location.state?.from?.pathname || '/dashboard';
    navigate(intendedPath, { replace: true });
  };

  const value: AuthContextType = {
    isAuthenticated,
    userInfo,
    hasAgreedToEthics,
    login,
    logout,
    setHasAgreedToEthics: handleSetHasAgreedToEthics
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
