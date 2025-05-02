import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/contexts/AuthContext';
import AuthGuard from '@/components/guards/AuthGuard';
import EthicsAgreementRoute from '@/components/EthicsAgreementRoute';

// Pages
import Dashboard from '@/pages/Dashboard';
import PatientRecordsPage from '@/pages/PatientRecordsPage';
import PatientRecord from '@/pages/PatientRecord';
import NewPatient from '@/pages/NewPatient';
import LoginPage from '@/pages/LoginPage';
import LiveNoteCapturePage from '@/pages/LiveNoteCapturePage';
import EthicsAgreement from '@/pages/EthicsAgreement';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              
              <Route element={<AuthGuard />}>
                {/* Ethics Agreement Page */}
                <Route path="/ethics-agreement" element={<EthicsAgreement />} />
                
                {/* Protected Routes (require both auth and ethics agreement) */}
                <Route element={<EthicsAgreementRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/patients" element={<PatientRecordsPage />} />
                  <Route path="/patient/:patientId" element={<PatientRecord />} />
                  <Route path="/new-patient" element={<NewPatient />} />
                  <Route path="/live-note-capture" element={<LiveNoteCapturePage />} />
                </Route>
              </Route>
              
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
