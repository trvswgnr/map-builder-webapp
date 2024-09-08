import React, { ErrorInfo } from "react";

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: string | null }
> {
  public constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  public static getDerivedStateFromError(e: unknown) {
    const error = e instanceof Error ? e.message : "Unknown error";
    return { error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error: error.message });
  }

  public override render() {
    if (this.state.error) {
      return (
        <div>Whoops! Looks like something went wrong: {this.state.error}</div>
      );
    }
    return this.props.children;
  }
}
