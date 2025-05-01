import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/components/ui/sonner";

// Define the user roles
export type UserRole = 'physician' | 'caseManager' | 'admin' | 'analyst';

// Define user information type
export interface UserInfo {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  access_token: string;
  token_type: string;
}

// Define the auth context type
interface AuthContextType {
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
  ethicsAgreed: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  agreeToEthics: () => void;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [ethicsAgreed, setEthicsAgreed] = useState(false);
  const navigate = useNavigate();

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
          role,
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

      // Store token in localStorage for persistence
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('userInfo', JSON.stringify(userInfo));

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
    // Clear stored data
    localStorage.removeItem('access_token');
    localStorage.removeItem('userInfo');
    
    // Reset state
    setIsAuthenticated(false);
    setUserInfo(null);
    setEthicsAgreed(false);
    navigate('/login');
  };

  const agreeToEthics = () => {
    setEthicsAgreed(true);
  };

  // Check for existing session on mount
  React.useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    const storedUserInfo = localStorage.getItem('userInfo');
    
    if (storedToken && storedUserInfo) {
      try {
        const userInfo = JSON.parse(storedUserInfo);
        setUserInfo(userInfo);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user info:', error);
        logout();
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userInfo, 
      ethicsAgreed,
      login, 
      logout, 
      agreeToEthics 
    }}>
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
