import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Loggers } from "../utils/logger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * and displays a fallback UI instead of crashing the app
 */
export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error for debugging
    Loggers.database.error("Component caught error:", error, { componentStack: errorInfo.componentStack });

    this.setState({
      error,
      errorInfo: errorInfo.componentStack || null,
    });

    // Also log to console for development
    console.error("ErrorBoundary caught an error:", error);
    console.error("Component stack:", errorInfo.componentStack);
  }

  private handleRetry = () => {
    Loggers.database.info("User clicked retry");
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleReload = () => {
    Loggers.database.info("User clicked reload");
    // Trigger a full app reload
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error fallback UI
      return (
        <View style={styles.container}>
          <View style={styles.errorCard}>
            <Ionicons name="warning" size={64} color="#EF4444" />

            <Text style={styles.title}>Oops! Something went wrong</Text>

            <Text style={styles.message}>
              {this.state.error?.message || "An unknown error occurred"}
            </Text>

            {__DEV__ && this.state.errorInfo && (
              <View style={styles.devInfo}>
                <Text style={styles.devTitle}>Development Info:</Text>
                <Text style={styles.stackTrace}>
                  {this.state.error?.stack || "No stack trace available"}
                </Text>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.retryButton]}
                onPress={this.handleRetry}
              >
                <Text style={styles.buttonText}>Retry</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.reloadButton]}
                onPress={this.handleReload}
              >
                <Text style={styles.buttonText}>Reload App</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 20,
  },
  errorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    maxWidth: 400,
    width: "100%",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 16,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },
  devInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    width: "100%",
  },
  devTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 4,
  },
  stackTrace: {
    fontSize: 10,
    color: "#9CA3AF",
    fontFamily: __DEV__ ? "monospace" : undefined,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 24,
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
  },
  retryButton: {
    backgroundColor: "#7C3AED",
  },
  reloadButton: {
    backgroundColor: "#6B7280",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

/**
 * Higher-order component to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
): React.ComponentType<P> {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

/**
 * Hook to programmatically trigger error boundary reset
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const triggerError = (err: Error) => {
    setError(err);
  };

  const resetError = () => {
    setError(null);
  };

  if (error) {
    throw error;
  }

  return { triggerError, resetError };
}

