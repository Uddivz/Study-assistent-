import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Render error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="panel error" role="alert">
          <p>Something went wrong while showing this study set.</p>
          <button type="button" onClick={() => window.location.reload()}>
            Reload the app
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}