import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getAccessToken, getUserInfo } from '@/utils/storage';

export const PublicGuard: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  // Check for stored auth state
  const storedToken = getAccessToken();
  const storedUserInfo = getUserInfo();
  const isStoredAuthenticated = !!(storedToken && storedUserInfo);

  if (isAuthenticated || isStoredAuthenticated) {
    // If user is already authenticated, redirect to dashboard
    // or to the returnUrl if it exists in the query params
    const params = new URLSearchParams(location.search);
    const returnUrl = params.get('returnUrl');
    return <Navigate to={returnUrl || '/dashboard'} replace />;
  }

  return <Outlet />;
}; 