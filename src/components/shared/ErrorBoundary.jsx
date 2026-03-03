"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";

class ErrorBoundaryClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(_error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={() => this.setState({ hasError: false, error: null, errorInfo: null })}
        />
      );
    }

    return this.props.children;
  }
}

function ErrorFallback({ error, errorInfo, resetError }) {
  const { t } = useTranslation();
  const router = useRouter();

  const handleGoHome = () => {
    resetError();
    router.push("/");
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {t("error.boundary.title") || "حدث خطأ غير متوقع"}
        </h1>

        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {t("error.boundary.message") ||
            "نعتذر، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى أو العودة للصفحة الرئيسية."}
        </p>

        {process.env.NODE_ENV === "development" && error && (
          <div className="mb-6 text-left bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <p className="text-sm font-mono text-red-800 dark:text-red-200 break-all">
              {error.toString()}
            </p>
            {errorInfo && (
              <details className="mt-2">
                <summary className="text-sm font-semibold text-red-800 dark:text-red-200 cursor-pointer">
                  Stack Trace
                </summary>
                <pre className="mt-2 text-xs text-red-700 dark:text-red-300 overflow-auto max-h-60">
                  {errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleGoHome}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {t("error.boundary.goHome") || "العودة للصفحة الرئيسية"}
          </button>
          <button
            onClick={handleReload}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            {t("error.boundary.reload") || "إعادة تحميل الصفحة"}
          </button>
          <button
            onClick={resetError}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            {t("error.boundary.tryAgain") || "المحاولة مرة أخرى"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Wrapper component to use hooks
export default function ErrorBoundary({ children }) {
  return <ErrorBoundaryClass>{children}</ErrorBoundaryClass>;
}

