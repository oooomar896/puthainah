import { createClient } from "@supabase/supabase-js";

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  "";
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  "";

if (!url || !serviceRoleKey) {
  console.error("Missing env: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  db: { schema: "public" },
});

async function main() {
  const { data, error } = await supabase
    .from("services")
    .select("id,name_ar,name_en,base_price,is_active,created_at")
    .order("created_at", { ascending: true });
  if (error) {
    console.error("Query error:", error.message);
    process.exit(1);
  }
  const summary = {
    count: Array.isArray(data) ? data.length : 0,
    active: (data || []).filter((s) => s.is_active !== false).length,
  };
  console.log("Services summary:", summary);
  console.log("Services rows:");
  console.table(
    (data || []).map((s) => ({
      id: s.id,
      name_ar: s.name_ar,
      name_en: s.name_en,
      base_price: typeof s.base_price === "number" ? Number(s.base_price) : null,
      is_active: s.is_active !== false,
      created_at: s.created_at,
    }))
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
