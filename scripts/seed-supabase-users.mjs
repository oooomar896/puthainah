import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

function loadDotEnvFallback() {
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        const value = trimmed.slice(eq + 1).trim();
        // Always overwrite to ensure we have the latest from .env
        if (key) {
          process.env[key] = value;
        }
      }
    }
  } catch {
    // ignore
  }
}

loadDotEnvFallback();

const url =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing Supabase URL or Service Role Key in environment.");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const users = [
  {
    email: "rafrs2030@gmail.com",
    password: "Admin@123",
    role: "Admin",
    displayName: "Admin User",
  },
  {
    email: "oooomar11223300@gmail.com",
    password: "Test@123",
    role: "Provider",
    displayName: "Provider User",
  },
  {
    email: "oooomar896@gmail.com",
    password: "Test@123",
    role: "Requester",
    displayName: "Requester User",
  },
];

async function findUserByEmail(email) {
  const { data, error } = await admin
    .from("users")
    .select("id, email, role")
    .eq("email", email)
    .maybeSingle();
  if (error) return null;
  return data || null;
}

async function ensureRoleTables(uid, role, displayName) {
  const baseName = displayName || "User";
  if (role === "Admin") {
    await admin.from("admins").upsert({ user_id: uid, display_name: baseName }, { onConflict: "user_id" });
    return;
  }
  if (role === "Provider") {
    await admin
      .from("providers")
      .upsert({ user_id: uid, name: baseName, entity_type_id: 1 }, { onConflict: "user_id" });
    return;
  }
  if (role === "Requester") {
    await admin
      .from("requesters")
      .upsert({ user_id: uid, name: baseName, entity_type_id: 1 }, { onConflict: "user_id" });
  }
}

async function createOrUpdateUser({ email, password, role, displayName }) {
  // First, check if user exists in auth.users
  // Since we don't have direct access to list users by email via admin.auth without search, 
  // we can try to create and catch error, or just rely on our public.users table if it's synced.
  // But let's assume we want to be robust.
  
  // We'll try to create. If it says email taken, we'll try to update.
  
  let uid;
  let created = false;

  const { data: createData, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role, full_name: displayName },
  });

  if (createError) {
     // If user already exists, we need to find their ID.
     // Unfortunately admin.auth.admin.createUser doesn't return ID if exists.
     // We can try to list users and filter (expensive) or rely on public.users
     
     // Let's try to find in public.users first
     const existingPublic = await findUserByEmail(email);
     if (existingPublic) {
         uid = existingPublic.id;
     } else {
         // Fallback: list users and find by email
         const { data: { users }, error: listError } = await admin.auth.admin.listUsers();
         if (listError) {
             throw new Error(`Failed to list users to find ${email}: ${listError.message}`);
         }
         const found = users.find(u => u.email === email);
         if (found) {
             uid = found.id;
         } else {
             throw new Error(`User ${email} exists (per create error) but could not be found in list. Create error: ${createError.message}`);
         }
     }
  } else {
      uid = createData.user?.id;
      created = true;
  }

  if (!uid) {
    throw new Error(`User ID missing for ${email}`);
  }

  // Ensure public.users role and role tables are in sync
  await admin.from("users").upsert({ id: uid, email, role }, { onConflict: "id" });
  await ensureRoleTables(uid, role, displayName);

  return { id: uid, email, role, created };
}

async function main() {
  const results = [];
  for (const u of users) {
    try {
      const res = await createOrUpdateUser(u);
      results.push({ email: res.email, role: res.role, created: res.created });
    } catch (e) {
      results.push({ email: u.email, role: u.role, error: e.message });
    }
  }
  console.log(
    JSON.stringify(
      { seeded: results.filter((r) => r.created).length, results },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(e?.message || e);
  process.exit(1);
});
