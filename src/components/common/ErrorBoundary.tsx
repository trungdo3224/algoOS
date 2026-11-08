import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Button from '../ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[algoOS ErrorBoundary] Caught render error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-50/70 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-zinc-200/90 p-8 text-center space-y-4">
            <div className="w-12 h-12 mx-auto bg-rose-50 border border-rose-200/80 rounded-xl flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-zinc-950">Runtime Exception Encountered</h2>
              <p className="text-xs text-zinc-500 mt-1">
                An unexpected state disrupted UI rendering. You can retry the current view or return to your dashboard.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-zinc-950 rounded-lg text-left border border-zinc-800">
                <p className="text-[11px] font-mono text-zinc-300 break-words">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={this.handleReset}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={this.handleReload}
              >
                Reload
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={this.handleGoHome}
                leftIcon={<Home className="w-3.5 h-3.5" />}
              >
                Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
