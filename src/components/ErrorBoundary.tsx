import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='min-h-screen bg-gradient-to-br from-destructive/5 via-background to-destructive/10 flex items-center justify-center p-4'>
          <div className='text-center space-y-6 max-w-md'>
            <div className='w-32 h-32 mx-auto mb-8 rounded-full bg-destructive/10 flex items-center justify-center'>
              <AlertTriangle className='w-16 h-16 text-destructive' />
            </div>

            <div className='space-y-2'>
              <h1 className='text-6xl font-bold text-destructive'>500</h1>
              <h2 className='text-2xl font-semibold'>Хатолик юз берди</h2>
              <p className='text-muted-foreground'>
                Илтимос, кейинроқ қайта уриниб кўринг
              </p>
            </div>

            <div className='flex gap-3 justify-center pt-4'>
              <Button
                onClick={() => (window.location.href = '/')}
                variant='outline'
              >
                Бош саҳифага
              </Button>
              <Button onClick={() => window.location.reload()}>
                Қайта юклаш
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className='mt-8 p-4 bg-muted rounded-lg text-left'>
                <p className='text-xs font-mono text-destructive break-all'>
                  {this.state.error.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
