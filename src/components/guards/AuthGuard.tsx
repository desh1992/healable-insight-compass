import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getAccessToken, getUserInfo } from '@/utils/storage';

const AuthGuard: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Check for stored auth state
  const storedToken = getAccessToken();
  const storedUserInfo = getUserInfo();
  const isStoredAuthenticated = !!(storedToken && storedUserInfo);

  if (!isAuthenticated && !isStoredAuthenticated) {
    // Only redirect to login if there's no stored auth state
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default AuthGuard; 