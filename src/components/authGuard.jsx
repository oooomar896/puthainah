'use client';

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { logout } from "@/lib/redux/slices/authSlice";

const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp < Date.now() / 1000;
  } catch {
    return true;
  }
};

const AuthGuard = ({ allowedRoles, children }) => {
  const { token, role } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (token && isTokenExpired(token)) {
      dispatch(logout());
      setShouldRedirect(true);
    }
  }, [token, dispatch]);

  useEffect(() => {
    if (shouldRedirect || !token) {
      if (
        allowedRoles.includes("Requester") &&
        !pathname.includes("profile") &&
        !pathname.includes("request-service") &&
        !pathname.includes("requests") &&
        !pathname.includes("request") &&
        !pathname.includes("projects")
      ) {
        return;
      }
      router.push("/login");
    }
  }, [shouldRedirect, token, pathname, router, allowedRoles]);

  if (shouldRedirect || !token) {
    if (
      allowedRoles.includes("Requester") &&
      !pathname.includes("profile") &&
      !pathname.includes("request-service") &&
      !pathname.includes("requests") &&
      !pathname.includes("request") &&
      !pathname.includes("projects")
    ) {
      return children;
    }
    return null; // Will redirect via useEffect
  }

  if (!allowedRoles.includes(role)) {
    dispatch(logout());
    router.push("/login");
    return null;
  }

  return children;
};

export default AuthGuard;

