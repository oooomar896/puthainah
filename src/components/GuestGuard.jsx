'use client';

import { useSelector } from "react-redux";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const GuestGuard = ({ children }) => {
  const { token, role } = useSelector((state) => state.auth);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [redirectPath, setRedirectPath] = useState(null);

  useEffect(() => {
    if (token && role) {
      // تحديد مسار التوجيه حسب الدور
      let path = null;
      if (role === "Admin") {
        path = "/admin";
      } else if (role === "Provider") {
        path = "/provider";
      } else if (role === "Requester") {
        path = "/profile";
      }

      if (path && pathname !== path) {
        // Loop detection: If 'from' param matches the path we want to redirect to, 
        // it implies server kicked us back. Don't redirect.
        const from = searchParams.get("from");
        if (from === path) {
          // Optional: You might want to dispatch logout here to clear the stale token
          // but for now, just staying on the page breaks the loop.
          return;
        }

        setRedirectPath(path);
        setShouldRedirect(true);
      }
    }
  }, [token, role, pathname, searchParams]);

  useEffect(() => {
    if (shouldRedirect && redirectPath) {
      router.replace(redirectPath);
    }
  }, [shouldRedirect, redirectPath, router]);

  // ✅ لو مفيش توكن نسمح له يشوف الصفحة
  return children;
};

export default GuestGuard;

