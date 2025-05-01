
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface EthicsAgreementRouteProps {
  children: ReactNode;
}

const EthicsAgreementRoute = ({ children }: EthicsAgreementRouteProps) => {
  const { isAuthenticated, ethicsAgreed } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!ethicsAgreed) {
    return <Navigate to="/ethics-agreement" replace />;
  }

  return <>{children}</>;
};

export default EthicsAgreementRoute;
