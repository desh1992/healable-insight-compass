
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
  },
  // Add a catch-all demo account that accepts any email with @healable.com
  'test@healable.com': {
    id: '5',
    name: 'Test User',
    email: 'test@healable.com',
    role: 'admin', // Default role that will be overridden
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
        // Check if the password is correct (for demo, accept "password")
        if (password !== 'password') {
          toast.error("Invalid password. Use 'password' for demo");
          resolve(false);
          return;
        }
        
        const emailLower = email.toLowerCase();
        
        // Check if email ends with @healable.com
        if (!emailLower.endsWith('@healable.com')) {
          toast.error("Please use an email ending with @healable.com");
          resolve(false);
          return;
        }

        // Find specific user or use generic demo user
        let user = MOCK_USERS[emailLower];
        
        // If specific user doesn't exist, but email has @healable.com domain,
        // create a dynamic user with the selected role
        if (!user) {
          user = {
            id: '999',
            name: emailLower.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            email: emailLower,
            role: role,
            department: role === 'physician' ? 'General Practice' : 
                       role === 'caseManager' ? 'Care Coordination' : 
                       role === 'analyst' ? 'Data Analytics' : 'Administration'
          };
        } else if (user.role !== role) {
          // If user exists but selected role doesn't match
          toast.error(`Selected role doesn't match the user's role. Please choose ${user.role} role`);
          resolve(false);
          return;
        }
        
        setUserInfo(user);
        setIsAuthenticated(true);
        toast.success("Login successful");
        resolve(true);
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
