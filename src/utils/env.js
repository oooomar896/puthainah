/**
 * Environment variables helper
 * Supports both Vite (import.meta.env) and Next.js (process.env)
 */

/**
 * Get environment variable value
 * @param {string} key - Environment variable key
 * @param {string} defaultValue - Default value if not found
 * @returns {string} Environment variable value
 */
export const getEnv = (key, defaultValue = "") => {
  // Next.js uses process.env
  if (typeof process !== "undefined" && process.env) {
    const nextKey = key.replace("VITE_", "NEXT_PUBLIC_");
    if (process.env[nextKey]) {
      return process.env[nextKey];
    }
    if (process.env[key]) {
      return process.env[key];
    }
  }

  // Vite uses import.meta.env
  if (typeof import.meta !== "undefined" && import.meta.env) {
    if (import.meta.env[key]) {
      return import.meta.env[key];
    }
  }

  return defaultValue;
};

/**
 * Get Supabase URL
 */
export const getSupabaseUrl = () => {
  return (
    getEnv("NEXT_PUBLIC_SUPABASE_URL") || getEnv("VITE_SUPABASE_URL") || ""
  );
};

/**
 * Get Supabase Anon Key
 */
export const getSupabaseAnonKey = () => {
  return (
    getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY") ||
    getEnv("VITE_SUPABASE_ANON_KEY") ||
    ""
  );
};

/**
 * Get App Base URL
 */
export const getAppBaseUrl = () => {
  const url =
    getEnv("NEXT_PUBLIC_APP_BASE_URL") ||
    getEnv("VITE_APP_BASE_URL") ||
    (typeof window !== "undefined" ? window.location.origin : "") ||
    "";
  return url.endsWith("/") ? url : `${url}/`;
};

/**
 * Get Stripe Publishable Key
 */
export const getStripePublishableKey = () => {
  return (
    getEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY") ||
    getEnv("VITE_STRIPE_PUBLISHABLE_KEY") ||
    ""
  );
};

/**
 * Get Moyasar Publishable Key
 */
export const getMoyasarPublishableKey = () => {
  return (
    getEnv("NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY") ||
    getEnv("VITE_MOYASAR_PUBLISHABLE_KEY") ||
    ""
  );
};

/**
 * Get Moyasar Account ID (optional)
 */
export const getMoyasarAccountId = () => {
  return (
    getEnv("NEXT_PUBLIC_MOYASAR_ACCOUNT_ID") ||
    getEnv("VITE_MOYASAR_ACCOUNT_ID") ||
    ""
  );
};

/**
 * Get Callback URL for payment redirects
 */
export const getMoyasarCallbackUrl = () => {
  const raw = getEnv("NEXT_PUBLIC_MOYASAR_CALLBACK_URL") || getAppBaseUrl() || "";
  if (!raw) return "";
  const hasCallback = /\/moyasar\/callback\/?$/.test(raw);
  if (hasCallback) return raw;
  const trimmed = raw.replace(/\/+$/, "");
  return `${trimmed}/moyasar/callback`;
};
