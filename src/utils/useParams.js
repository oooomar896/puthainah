/**
 * Unified params hook that works in Next.js and plain browser
 */
"use client";
import { useParams as useNextParams } from "next/navigation";

export function useParams() {
  try {
    const params = useNextParams();
    if (params && typeof params === "object") return params;
  } catch {
    // ignore
  }
  const isBrowser = typeof window !== "undefined";
  if (!isBrowser) return {};
  const pathname = window.location.pathname || "/";
  const segments = pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1] || "";
  const prev = segments[segments.length - 2] || "";
  const isEditLike = ["edit", "details", "view"].includes(last.toLowerCase());
  const candidate = isEditLike ? prev : last;
  if (candidate && /^[A-Za-z0-9-_]+$/.test(candidate)) {
    return { id: candidate };
  }
  return {};
}
