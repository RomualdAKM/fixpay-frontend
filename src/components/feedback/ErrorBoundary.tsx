"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

import { Button } from "@/components/ui/Button";

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional custom fallback; receives a reset callback. */
  fallback?: (reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Global error boundary. Catches render/runtime errors in the tree below and
 * shows a recoverable fallback instead of a blank screen. Data-fetching errors
 * are handled inline (see `InlineError`); this is the last-resort net.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Kept intentionally minimal; a real telemetry sink is out of scope here.
    if (process.env.NODE_ENV !== "production") {
      console.error("ErrorBoundary caught:", error, info.componentStack);
    }
  }

  private reset = (): void => {
    this.setState({ hasError: false });
  };

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback(this.reset);

    return (
      <div className="bg-bg flex min-h-dvh flex-col items-center justify-center gap-5 px-6 text-center">
        <div>
          <h1 className="text-text text-[19px] font-bold">
            Une erreur est survenue
          </h1>
          <p className="text-text-secondary mt-2 max-w-[320px] text-[14px] leading-[20px]">
            Quelque chose s&apos;est mal passé de notre côté. Réessayez, vos
            données sont en sécurité.
          </p>
        </div>
        <div className="w-full max-w-[240px]">
          <Button variant="primary" onClick={this.reset}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }
}
