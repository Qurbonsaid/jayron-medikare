import { ErrorBoundary } from '@/components/ErrorBoundary';
import { KeyboardShortcutsDialog } from '@/components/ui/keyboard-shortcuts-dialog';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useGlobalShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import store from './app/store';
import { AppLayout } from './components/AppLayout';
import { routers } from './constants/Navigator';
import { PrivateRoute } from './hooks/Router/PrivateRouter';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

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

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          {routers.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={<AppLayout>{element}</AppLayout>}
            />
          ))}
        </Route>

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
