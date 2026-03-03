"use client";

import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { supabase } from "@/lib/supabaseClient";
import { setCredentials, logout } from "@/redux/slices/authSlice";
import { detectUserRole } from "@/utils/roleDetection";
import LoadingPage from "@/views/LoadingPage";

export default function AuthInitializer({ children }) {
  const dispatch = useDispatch();
  const { token, role } = useSelector((state) => state.auth);
  const [isInitializing, setIsInitializing] = useState(true);
  const loadingStates = useRef({ auth: false, role: false });

  useEffect(() => {
    console.log("[AuthInitializer] Effect triggered", { token, role });

    // Safety timeout to prevent infinite loading (reduced to 5 seconds)
    const timeoutId = setTimeout(() => {
      if (isInitializing) {
        console.warn("[AuthInitializer] Safety timeout reached. Forcing app mount.");
        setIsInitializing(false);
      }
    }, 5000);

    const initializeAuth = async () => {
      if (!supabase) {
        console.warn("[AuthInitializer] Supabase client missing");
        setIsInitializing(false);
        return;
      }

      try {
        console.log("[AuthInitializer] Fetching session...");
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("[AuthInitializer] Session error:", error);
          setIsInitializing(false);
          return;
        }

        if (session?.user) {
          console.log("[AuthInitializer] Session found for user:", session.user.id);
          if (!role || !token) {
            console.log("[AuthInitializer] Detecting role for user...");
            try {
              const userRole = await detectUserRole(session.user, session);
              console.log("[AuthInitializer] Detected role:", userRole);
              if (userRole) {
                dispatch(setCredentials({
                  token: session.access_token,
                  refreshToken: session.refresh_token || null,
                  role: userRole,
                  userId: session.user.id,
                }));
              }
            } catch (err) {
              console.error("[AuthInitializer] Role detection error:", err);
            }
          } else {
            console.log("[AuthInitializer] Role already exists in Redux:", role);
          }
        } else {
          console.log("[AuthInitializer] No session found");
          if (token || role) {
            dispatch(logout());
          }
        }
      } catch (err) {
        console.error("[AuthInitializer] General init error:", err);
      } finally {
        console.log("[AuthInitializer] Initialization complete");
        setIsInitializing(false);
        loadingStates.current.auth = true;
      }
    };

    if (!loadingStates.current.auth) {
      initializeAuth();
    } else {
      // Already ran once, but dependencies changed (maybe after login)
      // We don't want to show LoadingPage again if we already have a basic auth state
      setIsInitializing(false);
    }

    let subscription = null;
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("[AuthInitializer] Auth state changed:", event);
        if (event === "SIGNED_OUT" || !session) {
          dispatch(logout());
        } else if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session) {
          try {
            const userRole = await detectUserRole(session.user, session);
            if (userRole) {
              dispatch(setCredentials({
                token: session.access_token,
                refreshToken: session.refresh_token || null,
                role: userRole,
                userId: session.user.id,
              }));
            }
          } catch (err) {
            console.error("[AuthInitializer] Stream role error:", err);
          }
        }
      });
      subscription = data.subscription;
    }

    return () => {
      clearTimeout(timeoutId);
      if (subscription) subscription.unsubscribe();
    };
  }, [dispatch, token, role]);

  if (isInitializing) {
    return <LoadingPage message="جاري تهيئة البيانات..." />;
  }

  return children;
}
