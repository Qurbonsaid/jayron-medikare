import { ErrorBoundary } from '@/components/ErrorBoundary';
import { KeyboardShortcutsDialog } from '@/components/ui/keyboard-shortcuts-dialog';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { PrivateRoute } from '@/hooks/Router/PrivateRouter';
import { useGlobalShortcuts } from '@/hooks/use-keyboard-shortcuts';
import Login from '@/pages/Login/Login';
import NotFound from '@/pages/NotFound';
import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import store from './app/store';
import { AppLayout } from './components/AppLayout';
import { routers } from './constants/router';

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
        {/* Redirect defaults to patients */}
        <Route path='/dashboard' element={<Navigate to={'/patients'} />} />
        <Route path='/' element={<Navigate to={'/patients'} />} />

        {/* Public route - Login */}
        <Route path='/login' element={<Login />} />

        {/* Protected Routes with authentication & authorization */}
        <Route element={<PrivateRoute />}>
          {routers.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={<AppLayout>{element}</AppLayout>}
            />
          ))}
        </Route>

        {/* Catch-all for undefined routes */}
        <Route path='*' element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => (
  <ErrorBoundary>
    <Provider store={store}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <RoutesContent />
        </BrowserRouter>
      </TooltipProvider>
    </Provider>
  </ErrorBoundary>
);

export default App;
