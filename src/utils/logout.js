import { supabase } from "@/lib/supabaseClient";
import { logout } from "@/redux/slices/authSlice";
import { useAuthStore } from "@/store";
import { safeReplace } from "@/utils/safeNavigate";

export const appLogout = async (dispatch, router) => {
  try {
    if (supabase?.auth?.signOut) {
      await supabase.auth.signOut().catch(() => {});
    }
  } catch (e) { void e; }
  try {
    const { logout: storeLogout } = useAuthStore.getState();
    storeLogout();
  } catch (e) { void e; }
  try {
    dispatch(logout());
  } catch (e) { void e; }
  try {
    safeReplace(router, "/login");
  } catch (e) { void e; }
};
