import React from "react";
import { Button } from "@/components/ui/button";

interface State {
  error: Error | null;
  info: { componentStack: string } | null;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error, info: null };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ error, info: { componentStack: info.componentStack } });
    // You could also log to a remote error service here
    // console.error(error, info.componentStack);
  }

  render() {
    const { error, info } = this.state;
    if (!error) return this.props.children as React.ReactElement;

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-3xl w-full bg-white border border-border rounded p-6">
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="text-sm text-muted-foreground mb-4">
            An unexpected error occurred. You can reload the page or copy the error details and share
            them for debugging.
          </p>

          <div className="mb-4">
            <div className="text-sm font-medium">Error:</div>
            <pre className="text-xs mt-2 p-3 bg-slate-50 border rounded overflow-auto">{error?.message}</pre>
          </div>

          {info?.componentStack && (
            <div className="mb-4">
              <div className="text-sm font-medium">Component stack:</div>
              <pre className="text-xs mt-2 p-3 bg-slate-50 border rounded overflow-auto">{info.componentStack}</pre>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={() => window.location.reload()}>Reload</Button>
            <Button variant="outline" onClick={() => {
              const payload = `Error: ${error?.message}\n\nStack:\n${info?.componentStack ?? "(no stack)"}`;
              void navigator.clipboard?.writeText(payload);
            }}>Copy Details</Button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
