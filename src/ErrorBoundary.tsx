import React, { ErrorInfo } from "react";

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: string | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(e: unknown) {
    const error = e instanceof Error ? e.message : "Unknown error";
    return { error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error: error.message });
  }

  override render() {
    if (this.state.error) {
      return (
        <div>Whoops! Looks like something went wrong: {this.state.error}</div>
      );
    }
    return this.props.children;
  }
}
