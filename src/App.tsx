
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "@/contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import EthicsAgreementRoute from "./components/EthicsAgreementRoute";

import LoginPage from "./pages/LoginPage";
import EthicsAgreement from "./pages/EthicsAgreement";
import Dashboard from "./pages/Dashboard";
import PatientRecord from "./pages/PatientRecord";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/ethics-agreement" element={
              <PrivateRoute>
                <EthicsAgreement />
              </PrivateRoute>
            } />
            <Route path="/dashboard" element={
              <EthicsAgreementRoute>
                <Dashboard />
              </EthicsAgreementRoute>
            } />
            <Route path="/patient/:patientId" element={
              <EthicsAgreementRoute>
                <PatientRecord />
              </EthicsAgreementRoute>
            } />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
