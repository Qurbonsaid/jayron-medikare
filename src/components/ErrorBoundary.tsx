import { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

// Functional component for translated content
function ErrorContent({ error }: { error?: Error }) {
  const { t } = useTranslation('common');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-destructive/5 via-background to-destructive/10 flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="w-16 h-16 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-destructive">500</h1>
          <h2 className="text-2xl font-semibold">{t('errorBoundary.title')}</h2>
          <p className="text-muted-foreground">
            {t('errorBoundary.description')}
          </p>
        </div>

        <div className="flex gap-3 justify-center pt-4">
          <Button
            onClick={() => window.location.href = "/"}
            variant="outline"
          >
            {t('goHome')}
          </Button>
          <Button onClick={() => window.location.reload()}>
            {t('errorBoundary.reload')}
          </Button>
        </div>

        {process.env.NODE_ENV === "development" && error && (
          <div className="mt-8 p-4 bg-muted rounded-lg text-left">
            <p className="text-xs font-mono text-destructive break-all">
              {error.toString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorContent error={this.state.error} />;
    }

    return this.props.children;
  }
}
