import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface PublicGuardProps {
  children: React.ReactNode;
}

export const PublicGuard: React.FC<PublicGuardProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      // If user is already authenticated, redirect to dashboard
      // or to the returnUrl if it exists in the query params
      const params = new URLSearchParams(location.search);
      const returnUrl = params.get('returnUrl');
      navigate(returnUrl || '/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}; 