import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const EthicsAgreementRoute: React.FC = () => {
  const { hasAgreedToEthics } = useAuth();
  const location = useLocation();

  if (!hasAgreedToEthics) {
    // Redirect to ethics agreement page, but save the intended destination
    return <Navigate to="/ethics-agreement" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default EthicsAgreementRoute;
