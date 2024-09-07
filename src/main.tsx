import "./globals.css";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import MapBuilder from "./MapBuilder";
import React, { ErrorInfo } from "react";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return <div>Error</div>;
    }

    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <Foo shouldThrow={true} />
    </ErrorBoundary>
    <MapBuilder />
  </StrictMode>,
);

function Foo(props: { shouldThrow: boolean }) {
  if (props.shouldThrow) {
    throw new Error("Foo");
  } else {
    return <div>Foo</div>;
  }
}
