import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from "@/components/ui/sonner";
import { 
  getAccessToken, 
  setAccessToken, 
  getUserInfo, 
  setUserInfo, 
  clearAuthStorage,
  StoredUserInfo,
  setEthicsAgreed as setStoredEthicsAgreed,
  getEthicsAgreed as getStoredEthicsAgreed
} from '@/utils/storage';

// Define the user roles
export type UserRole = 'physician' | 'caseManager' | 'admin' | 'analyst';

interface UserInfo {
  name: string;
  role: string;
  email: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
  hasAgreedToEthics: boolean;
  login: (email: string, password: string) => Promise<void>;
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

  useEffect(() => {
    // Check local storage for auth state
    const storedAuth = localStorage.getItem('isAuthenticated');
    const storedEthics = localStorage.getItem('hasAgreedToEthics');
    const storedUserInfo = localStorage.getItem('userInfo');

    if (storedAuth === 'true') {
      setIsAuthenticated(true);
      if (storedUserInfo) {
        setUserInfo(JSON.parse(storedUserInfo));
      }
    }

    if (storedEthics === 'true') {
      setHasAgreedToEthics(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Mock login - in real app, this would make an API call
    const mockUserInfo = {
      name: 'healable-insights',
      role: 'doctor',
      email: email
    };

    setIsAuthenticated(true);
    setUserInfo(mockUserInfo);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userInfo', JSON.stringify(mockUserInfo));

    // If user hasn't agreed to ethics, redirect them there
    if (!hasAgreedToEthics) {
      navigate('/ethics-agreement');
    } else {
      // Otherwise, send them to their intended destination or dashboard
      const intendedPath = location.state?.from?.pathname || '/dashboard';
      navigate(intendedPath);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserInfo(null);
    setHasAgreedToEthics(false);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('hasAgreedToEthics');
    navigate('/login');
  };

  const handleSetHasAgreedToEthics = (agreed: boolean) => {
    setHasAgreedToEthics(agreed);
    localStorage.setItem('hasAgreedToEthics', agreed.toString());
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
