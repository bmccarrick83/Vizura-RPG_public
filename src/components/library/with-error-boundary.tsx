'use client';

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export function WithErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return class ErrorBoundary extends Component<
    P & ErrorBoundaryProps,
    ErrorBoundaryState
  > {
    constructor(props: P & ErrorBoundaryProps) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
      return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
      console.error('Uncaught error:', error, errorInfo);
    }

    render() {
      if (this.state.hasError) {
        return (
          <div className="container mx-auto my-8">
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription>
                <p>
                  We encountered an error while loading this part of the
                  application.
                </p>
                {this.state.error && (
                  <pre className="mt-4 whitespace-pre-wrap rounded-md bg-destructive/10 p-4 text-xs font-mono">
                    {this.state.error.message}
                  </pre>
                )}
              </AlertDescription>
            </Alert>
          </div>
        );
      }

      return <WrappedComponent {...this.props} />;
    }
  };
}
