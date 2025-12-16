import React from 'react';
import { Card } from '../ui/card';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';

const CantRead = () => {
  const navigate = useNavigate();
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
};

export default CantRead;
