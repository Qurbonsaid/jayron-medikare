import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/patient/:id" element={<PatientProfile />} />
          <Route path="/new-visit" element={<NewVisit />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/prescription" element={<Prescription />} />
          <Route path="/lab-order" element={<LabOrder />} />
          <Route path="/inpatient" element={<Inpatient />} />
          <Route path="/lab-results" element={<LabResults />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/radiology" element={<Radiology />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/patient-portal" element={<PatientPortal />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
