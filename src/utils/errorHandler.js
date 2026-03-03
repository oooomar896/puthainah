/**
 * Utility functions for error handling
 */

/**
 * Extract error message from various error formats
 * @param {Error|Object} error - Error object
 * @param {string} defaultMessage - Default message if error message not found
 * @returns {string} Error message
 */
export const getErrorMessage = (error, defaultMessage = "حدث خطأ غير متوقع") => {
  if (!error) return defaultMessage;

  // Handle RTK Query error format
  if (error?.data?.message) {
    return error.data.message;
  }

  // Handle RTK Query error format (alternative)
  if (error?.data?.Message) {
    return error.data.Message;
  }

  // Handle Supabase error format
  if (error?.message) {
    return error.message;
  }

  // Handle string errors
  if (typeof error === "string") {
    return error;
  }

  // Handle error object with statusText
  if (error?.statusText) {
    return error.statusText;
  }

  // Handle error object with error property
  if (error?.error) {
    return getErrorMessage(error.error, defaultMessage);
  }

  return defaultMessage;
};

/**
 * Check if error is a network error
 * @param {Error|Object} error - Error object
 * @returns {boolean}
 */
export const isNetworkError = (error) => {
  if (!error) return false;

  const errorMessage = getErrorMessage(error, "").toLowerCase();

  return (
    errorMessage.includes("network") ||
    errorMessage.includes("fetch") ||
    errorMessage.includes("connection") ||
    errorMessage.includes("timeout") ||
    error?.status === "FETCH_ERROR" ||
    error?.status === "TIMEOUT_ERROR"
  );
};

/**
 * Check if error is an authentication error
 * @param {Error|Object} error - Error object
 * @returns {boolean}
 */
export const isAuthError = (error) => {
  if (!error) return false;

  return (
    error?.status === 401 ||
    error?.status === "UNAUTHORIZED" ||
    error?.code === "PGRST301" ||
    getErrorMessage(error, "").toLowerCase().includes("unauthorized") ||
    getErrorMessage(error, "").toLowerCase().includes("authentication")
  );
};

/**
 * Check if error is a permission error (RLS)
 * @param {Error|Object} error - Error object
 * @returns {boolean}
 */
export const isPermissionError = (error) => {
  if (!error) return false;

  return (
    error?.code === "PGRST116" ||
    error?.status === 406 ||
    getErrorMessage(error, "").toLowerCase().includes("permission") ||
    getErrorMessage(error, "").toLowerCase().includes("policy") ||
    getErrorMessage(error, "").toLowerCase().includes("row level security")
  );
};

/**
 * Format error for display
 * @param {Error|Object} error - Error object
 * @param {string} defaultMessage - Default message
 * @returns {Object} Formatted error object
 */
export const formatError = (error, defaultMessage = "حدث خطأ غير متوقع") => {
  const message = getErrorMessage(error, defaultMessage);
  const isNetwork = isNetworkError(error);
  const isAuth = isAuthError(error);
  const isPermission = isPermissionError(error);

  return {
    message,
    isNetwork,
    isAuth,
    isPermission,
    originalError: error,
  };
};

