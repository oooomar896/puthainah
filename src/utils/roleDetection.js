import { supabase } from "@/lib/supabaseClient";

/**
 * Normalize role value (Admin, admin, ADMIN -> Admin)
 */
export const normalizeRole = (role) => {
  if (!role) return null;
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
};

/**
 * Get role from user_metadata or JWT token
 */
export const getRoleFromMetadata = (user, session) => {
  let role = user.user_metadata?.role || null;

  // Ignore invalid values
  if (role === "authenticated" || role === "anon") {
    role = null;
  }

  // Try to get role from JWT token
  if (!role && session?.access_token) {
    try {
      const tokenParts = session.access_token.split(".");
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        const jwtRole = payload.user_metadata?.role;
        if (
          jwtRole &&
          jwtRole !== "authenticated" &&
          jwtRole !== "anon"
        ) {
          role = jwtRole;
        }
      }
    } catch {
      // Ignore decoding error
    }
  }

  return role ? normalizeRole(role) : null;
};

/**
 * Get role from users table
 */
export const getRoleFromUsersTable = async (userId) => {
  if (!supabase) return null;
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching user role:", error);
      return null;
    }

    if (user?.role) {
      return normalizeRole(user.role);
    }

    return null;
  } catch (err) {
    console.error("Unexpected error in getRoleFromUsersTable:", err);
    return null;
  }
};

/**
 * Fallback: Detect role by membership in requesters/providers/admins tables
 */
export const getRoleByMembership = async (userId) => {
  if (!supabase) return null;
  try {
    const [{ data: req }, { data: prov }, { data: adm }] = await Promise.all([
      supabase.from("requesters").select("user_id").eq("user_id", userId).maybeSingle(),
      supabase.from("providers").select("user_id").eq("user_id", userId).maybeSingle(),
      supabase.from("admins").select("user_id").eq("user_id", userId).maybeSingle(),
    ]);
    if (adm?.user_id) return "Admin";
    if (prov?.user_id) return "Provider";
    if (req?.user_id) return "Requester";
    return null;
  } catch (e) {
    console.error("Error in getRoleByMembership:", e);
    return null;
  }
};

/**
 * Detect user role (Main function)
 * Priority 1: 'users' table in Supabase
 * Priority 2: user_metadata or JWT (fallback)
 */
export const detectUserRole = async (user, session) => {
  if (!user) return null;

  // Use a timeout to prevent infinite loading if DB is unresponsive
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Role detection timeout")), 5000)
  );

  const detectionPromise = (async () => {
    try {
      // Priority 1: Check users table
      let role = await getRoleFromUsersTable(user.id);
      if (role) return role;

      // Fallback: Membership in specific tables
      role = await getRoleByMembership(user.id);
      if (role) return role;

      // Priority 2: Check metadata/JWT
      role = getRoleFromMetadata(user, session);
      if (role) return role;

      return "Requester"; // Default fallback
    } catch (err) {
      console.error("Error in detectUserRole internal:", err);
      return "Requester";
    }
  })();

  try {
    return await Promise.race([detectionPromise, timeoutPromise]);
  } catch (error) {
    console.warn("Role detection timed out, falling back to Requester");
    return "Requester";
  }
};


