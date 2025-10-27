import { ErrorBoundary } from '@/components/ErrorBoundary';
import { KeyboardShortcutsDialog } from '@/components/ui/keyboard-shortcuts-dialog';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useGlobalShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Fragment, useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import { AppLayout } from './components/AppLayout';
import { routers } from './constants/Navigator';
// RouterLayout was removed — use direct <Route> inside <Routes> because
// React Router requires direct <Route> children (or fragments).

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
      <Routes>
        <Route path='/' element={<Login />} />
        <Fragment>
          {routers.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={<AppLayout>{element}</AppLayout>}
            />
          ))}
        </Fragment>
        <Route path='*' element={<NotFound />} />
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
