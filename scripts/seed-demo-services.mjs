import { createClient } from "@supabase/supabase-js";
import { PLATFORM_SERVICES } from "../src/constants/servicesData.js";

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  "";
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  "";

if (!url || !serviceRoleKey) {
  console.error(
    "Missing env: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required"
  );
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  db: { schema: "public" },
});

const demoServices = PLATFORM_SERVICES.map(s => ({
  name_ar: s.name_ar,
  name_en: s.name_en,
  base_price: 0,
  image_url: null,
  is_active: true,
}));

async function main() {
  // Reset services: delete all then insert the 8 platform services
  await supabase.from("services").delete().neq("id", null);

  // Try inserting; accommodate schema differences (price vs base_price)
  // Insert with name_ar, name_en, image_url, is_active, price if column exists
  const { data, error } = await supabase
    .from("services")
    .insert(
      demoServices.map((s) => ({
        name_ar: s.name_ar,
        name_en: s.name_en,
        image_url: s.image_url,
        is_active: s.is_active,
        base_price: s.base_price ?? 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))
    )
    .select("id,name_ar,name_en");

  if (error) {
    console.error("Seed insert error:", error.message);
    process.exit(1);
  }
  console.log(`Reset and seeded ${data?.length || demoServices.length} platform services successfully.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
