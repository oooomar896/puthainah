/**
 * Unified location hook that works with both React Router and Next.js
 * This allows components to work in both environments
 */
"use client";

export function useLocation() {
  const isBrowser = typeof window !== "undefined";
  const pathname = isBrowser ? window.location.pathname || "/" : "/";
  return {
    pathname,
    search: isBrowser ? window.location.search : "",
    hash: isBrowser ? window.location.hash : "",
    state: null,
    key: "",
  };
}

