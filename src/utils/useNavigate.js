/**
 * Unified navigate hook for Next.js App Router
 */
"use client";

import { useRouter } from "next/navigation";

export function useNavigate() {
  const router = useRouter();
  return (to, options = {}) => {
    try {
      if (typeof to === "string") {
        options.replace ? router.replace(to) : router.push(to);
      } else if (to && typeof to === "object") {
        const href = to.pathname + (to.search || "");
        options.replace ? router.replace(href) : router.push(href);
      }
    } catch {
      const href =
        typeof to === "string" ? to : to?.pathname + (to?.search || "");
      if (typeof window !== "undefined" && href) {
        options.replace ? window.history.replaceState(null, "", href) : window.history.pushState(null, "", href);
        window.dispatchEvent(new PopStateEvent("popstate"));
      }
    }
  };
}
