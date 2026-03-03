/**
 * Unified search params hook that works with both React Router and Next.js
 */
"use client";

export function useSearchParams() {
  const isBrowser = typeof window !== "undefined";
  const sp = isBrowser ? new URLSearchParams(window.location.search) : null;
  return {
    get: (key) => (sp ? sp.get(key) : null),
    getAll: (key) => (sp ? sp.getAll(key) : []),
    has: (key) => (sp ? sp.has(key) : false),
    toString: () => (sp ? sp.toString() : ""),
  };
}

