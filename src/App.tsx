import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useGlobalShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { KeyboardShortcutsDialog } from "@/components/ui/keyboard-shortcuts-dialog";
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import PatientProfile from "./pages/PatientProfile";
import NewVisit from "./pages/NewVisit";
import Appointments from "./pages/Appointments";
import Prescription from "./pages/Prescription";
import LabOrder from "./pages/LabOrder";
import Inpatient from "./pages/Inpatient";
import LabResults from "./pages/LabResults";
import Billing from "./pages/Billing";
import Reports from "./pages/Reports";
import Radiology from "./pages/Radiology";
import Settings from "./pages/Settings";
import PatientPortal from "./pages/PatientPortal";
import NotFound from "./pages/NotFound";
import { AppLayout } from "./components/AppLayout";

const queryClient = new QueryClient();

function RoutesContent() {
  useGlobalShortcuts();
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    const handleShowShortcuts = () => setShowShortcuts(true);
    window.addEventListener("show-shortcuts", handleShowShortcuts);
    return () => window.removeEventListener("show-shortcuts", handleShowShortcuts);
  }, []);

  return (
    <>
      <KeyboardShortcutsDialog open={showShortcuts} onOpenChange={setShowShortcuts} />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/patients" element={<AppLayout><Patients /></AppLayout>} />
        <Route path="/patient/:id" element={<AppLayout><PatientProfile /></AppLayout>} />
        <Route path="/new-visit" element={<AppLayout><NewVisit /></AppLayout>} />
        <Route path="/appointments" element={<AppLayout><Appointments /></AppLayout>} />
        <Route path="/prescription" element={<AppLayout><Prescription /></AppLayout>} />
        <Route path="/lab-order" element={<AppLayout><LabOrder /></AppLayout>} />
        <Route path="/inpatient" element={<AppLayout><Inpatient /></AppLayout>} />
        <Route path="/lab-results" element={<AppLayout><LabResults /></AppLayout>} />
        <Route path="/billing" element={<AppLayout><Billing /></AppLayout>} />
        <Route path="/reports" element={<AppLayout><Reports /></AppLayout>} />
        <Route path="/radiology" element={<AppLayout><Radiology /></AppLayout>} />
        <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
        <Route path="/patient-portal" element={<AppLayout><PatientPortal /></AppLayout>} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
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
