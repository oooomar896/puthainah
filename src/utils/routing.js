/**
 * Routing utility wrapper for Next.js
 * Provides compatibility layer for components that might be used in both
 * React Router and Next.js contexts
 */

"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

/**
 * Next.js compatible Link component wrapper
 * Use this instead of react-router-dom Link when in Next.js context
 */
export const AppLink = ({ to, href, children, className, onClick, ...props }) => {
  const linkHref = href || to || "#";
  
  // Handle onClick with scroll to top if needed
  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
    // Scroll to top on navigation (optional)
    if (props.scrollToTop !== false) {
      window.scrollTo(0, 0);
    }
  };

  return (
    <Link href={linkHref} className={className} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
};

/**
 * Next.js compatible useNavigate hook
 * Provides similar API to react-router-dom useNavigate
 */
export const useAppNavigate = () => {
  const router = useRouter();

  return useCallback((to, options = {}) => {
    if (typeof to === "string") {
      if (options?.replace) {
        router.replace(to);
      } else {
        router.push(to);
      }
    } else if (to && typeof to === "object") {
      const path = to.pathname + (to.search || "");
      if (options?.replace || to.replace) {
        router.replace(path);
      } else {
        router.push(path);
      }
    }
  }, [router]);
};

/**
 * Next.js compatible useLocation hook
 * Provides similar API to react-router-dom useLocation
 */
export const useAppLocation = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return {
    pathname,
    search: searchParams.toString() ? `?${searchParams.toString()}` : "",
    hash: "",
    state: null,
  };
};

/**
 * Next.js compatible useParams hook
 * Note: In Next.js, use params() from next/navigation directly
 */
export { useParams } from "next/navigation";

