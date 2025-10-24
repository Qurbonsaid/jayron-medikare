import { ErrorBoundary } from '@/components/ErrorBoundary';
import { KeyboardShortcutsDialog } from '@/components/ui/keyboard-shortcuts-dialog';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useGlobalShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import Appointments from './pages/Appointments';
import Billing from './pages/Billing';
import Dashboard from './pages/Dashboard';
import Inpatient from './pages/Inpatient';
import LabOrder from './pages/LabOrder';
import LabResults from './pages/LabResults';
import Login from './pages/Login';
import NewVisit from './pages/NewVisit';
import NotFound from './pages/NotFound';
import PatientPortal from './pages/PatientPortal';
import PatientProfile from './pages/PatientProfile';
import Patients from './pages/Patients';
import Prescription from './pages/Prescription';
import Radiology from './pages/Radiology';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

const queryClient = new QueryClient();

function RoutesContent() {
  useGlobalShortcuts();
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    const handleShowShortcuts = () => setShowShortcuts(true);
    window.addEventListener('show-shortcuts', handleShowShortcuts);
    return () =>
      window.removeEventListener('show-shortcuts', handleShowShortcuts);
  }, []);

  return (
    <>
      <KeyboardShortcutsDialog
        open={showShortcuts}
        onOpenChange={setShowShortcuts}
      />
      <AppLayout>
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/patients' element={<Patients />} />
          <Route path='/patient/:id' element={<PatientProfile />} />
          <Route path='/new-visit' element={<NewVisit />} />
          <Route path='/appointments' element={<Appointments />} />
          <Route path='/prescription' element={<Prescription />} />
          <Route path='/lab-order' element={<LabOrder />} />
          <Route path='/inpatient' element={<Inpatient />} />
          <Route path='/lab-results' element={<LabResults />} />
          <Route path='/billing' element={<Billing />} />
          <Route path='/reports' element={<Reports />} />
          <Route path='/radiology' element={<Radiology />} />
          <Route path='/settings' element={<Settings />} />
          <Route path='/patient-portal' element={<PatientPortal />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
      </AppLayout>
    </>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <RoutesContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
