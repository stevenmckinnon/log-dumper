import { Component, ReactNode, ErrorInfo } from 'react';
import { Logger } from '../logger';

export interface ErrorBoundaryProps {
  children: ReactNode;
  logger: Logger;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class LoggerErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { logger, onError } = this.props;
    
    // Log the error with component stack
    logger.logError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    } as Record<string, unknown>);

    // Call optional error handler
    onError?.(error, errorInfo);
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      if (typeof fallback === 'function') {
        return fallback(error, this.resetErrorBoundary);
      }
      
      if (fallback) {
        return fallback;
      }

      // Default fallback UI
      return (
        <div
          style={{
            padding: '20px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#991b1b',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <h2 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>Something went wrong</h2>
          <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#dc2626' }}>
            {error.message}
          </p>
          <button
            onClick={this.resetErrorBoundary}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Try again
          </button>
        </div>
      );
    }

    return children;
  }
}

