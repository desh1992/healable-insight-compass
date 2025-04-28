
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/components/ui/sonner";

// Define the user roles
export type UserRole = 'physician' | 'caseManager' | 'admin' | 'analyst';

// Define user information type
export interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatar?: string;
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

// Mock user data for demo purposes
const MOCK_USERS: Record<string, UserInfo> = {
  'dr.smith@healable.com': {
    id: '1',
    name: 'Dr. Sarah Smith',
    email: 'dr.smith@healable.com',
    role: 'physician',
    department: 'Cardiology',
    avatar: ''
  },
  'case.jones@healable.com': {
    id: '2',
    name: 'Alex Jones',
    email: 'case.jones@healable.com',
    role: 'caseManager',
    department: 'Patient Care',
    avatar: ''
  },
  'admin@healable.com': {
    id: '3',
    name: 'Admin User',
    email: 'admin@healable.com',
    role: 'admin',
    avatar: ''
  },
  'analyst@healable.com': {
    id: '4',
    name: 'Data Analyst',
    email: 'analyst@healable.com',
    role: 'analyst',
    department: 'Operations',
    avatar: ''
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [ethicsAgreed, setEthicsAgreed] = useState(false);
  const navigate = useNavigate();

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    // This is a mock implementation - in a real app, you would call an API
    return new Promise((resolve) => {
      setTimeout(() => {
        // Check if user exists (in a real app this would be handled by your backend)
        const user = MOCK_USERS[email.toLowerCase()];
        
        if (user && user.role === role && password === 'password') {
          setUserInfo(user);
          setIsAuthenticated(true);
          toast.success("Login successful");
          resolve(true);
        } else {
          toast.error("Invalid credentials or role mismatch");
          resolve(false);
        }
      }, 800);
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserInfo(null);
    setEthicsAgreed(false);
    navigate('/login');
  };

  const agreeToEthics = () => {
    setEthicsAgreed(true);
  };

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
