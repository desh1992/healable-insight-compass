
import React, { createContext, useState, useContext, useEffect } from "react";

interface UserInfo {
  name: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
  hasAcceptedEthics: boolean;
  login: (email: string, password: string, role?: string) => Promise<boolean>;
  logout: () => void;
  acceptEthics: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [hasAcceptedEthics, setHasAcceptedEthics] = useState<boolean>(false);

  useEffect(() => {
    // Check for existing auth on load
    const savedAuth = localStorage.getItem("auth");
    const savedEthics = localStorage.getItem("ethics");
    
    if (savedAuth) {
      const authData = JSON.parse(savedAuth);
      setIsAuthenticated(true);
      setUserInfo(authData.userInfo);
    }
    
    if (savedEthics === "true") {
      setHasAcceptedEthics(true);
    }
  }, []);

  const login = async (email: string, password: string, role?: string): Promise<boolean> => {
    // This would normally call an API endpoint
    // Mock login for demo purposes
    return new Promise((resolve) => {
      setTimeout(() => {
        // Hard-coded test credentials
        if (email && password) {
          // Create user info based on email and role
          const userInfo = {
            name: email.split('@')[0].split('.').map(part => 
              part.charAt(0).toUpperCase() + part.slice(1)
            ).join(' '),
            role: role || "Physician" // Default to Physician if no role is selected
          };
          
          setIsAuthenticated(true);
          setUserInfo(userInfo);
          
          // Save to localStorage
          localStorage.setItem("auth", JSON.stringify({
            isAuthenticated: true,
            userInfo
          }));
          
          resolve(true);
        } else {
          resolve(false);
        }
      }, 1000);
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserInfo(null);
    setHasAcceptedEthics(false);
    localStorage.removeItem("auth");
    localStorage.removeItem("ethics");
  };

  const acceptEthics = () => {
    setHasAcceptedEthics(true);
    localStorage.setItem("ethics", "true");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userInfo,
        hasAcceptedEthics,
        login,
        logout,
        acceptEthics,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
