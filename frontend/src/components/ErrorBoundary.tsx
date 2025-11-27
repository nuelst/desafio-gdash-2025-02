import { AlertCircle } from 'lucide-react';
import { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <CardTitle>Algo deu errado</CardTitle>
              </div>
              <CardDescription>
                Ocorreu um erro inesperado. Por favor, recarregue a página.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Detalhes do erro</AlertTitle>
                  <AlertDescription>
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm font-medium">
                        Ver mensagem de erro
                      </summary>
                      <pre className="mt-2 text-xs bg-destructive/10 p-2 rounded overflow-auto">
                        {this.state.error.message}
                      </pre>
                    </details>
                  </AlertDescription>
                </Alert>
              )}
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
                size="lg"
              >
                Recarregar Página
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

