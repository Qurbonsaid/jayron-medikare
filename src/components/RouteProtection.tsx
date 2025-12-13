import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRouteActions } from '@/hooks/RBS';
import { AlertTriangle } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface RouteProtectionProps {
  children: React.ReactNode;
  path: string;
}

/**
 * Route Protection Component
 * Dynamically checks if user has read access to a route
 * Shows permission denied page if user doesn't have access
 */
const RouteProtection: React.FC<RouteProtectionProps> = ({
  children,
  path,
}) => {
  const navigate = useNavigate();
  const { canRead, isLoading } = useRouteActions(path);

  // While loading permissions, show loading state
  if (isLoading) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-muted-foreground'>Юкланмоқда...</p>
        </div>
      </div>
    );
  }

  // If user doesn't have read access, show permission denied page
  if (!canRead) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center p-4'>
        <Card className='p-8 max-w-md w-full text-center'>
          <AlertTriangle className='w-12 h-12 text-warning mx-auto mb-4' />
          <h2 className='text-xl font-bold mb-2'>Рухсат йўқ</h2>
          <p className='text-muted-foreground mb-6'>
            Сизда ушбу саҳифани кўриш учун рухсат йўқ.
          </p>
          <Button onClick={() => navigate('/patients')} className='w-full'>
            Орқага қайтиш
          </Button>
        </Card>
      </div>
    );
  }

  // If user has read access, render children
  return <>{children}</>;
};

export default RouteProtection;
