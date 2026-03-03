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
  console.error("Missing env: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  db: { schema: "public" },
});

function normalize(s) {
  return String(s || "").trim().toLowerCase();
}

async function getPlatformIds() {
  const names = PLATFORM_SERVICES.map((s) => s.name_ar);
  const { data, error } = await supabase
    .from("services")
    .select("id,name_ar,name_en")
    .in("name_ar", names);
  if (error) throw new Error(error.message);
  const map = {};
  for (const row of data || []) {
    map[row.name_ar] = row.id;
  }
  return map;
}

function mapOldToPlatform(row) {
  const ar = normalize(row.name_ar);
  const en = normalize(row.name_en);
  if (ar.includes("جدوى") || en.includes("feasibility") || en.includes("study")) return "دراسة مشاريع";
  if (ar.includes("هوية") || en.includes("brand")) return "إستشارة";
  if (ar.includes("هندسية") || en.includes("engineering")) return "إستشارة";
  if (ar.includes("قانون") || en.includes("legal")) return "إستشارة";
  if (ar.includes("صيانة") || en.includes("maint")) return "عقود صيانه";
  if (ar.includes("إدارة") || en.includes("management")) return "إدارة مشاريع";
  if (ar.includes("تدريب") || en.includes("training")) return "تدريب";
  if (ar.includes("توريد") || en.includes("supply")) return "خدمة توريد";
  if (ar.includes("تنفيذ") || en.includes("exec")) return "خدمة تنفيذ";
  if (ar.includes("إشراف") || en.includes("supervision")) return "إشراف مشاريع";
  return "إستشارة";
}

async function migrate() {
  const platformIdByName = await getPlatformIds();
  const { data: all, error } = await supabase
    .from("services")
    .select("id,name_ar,name_en,is_active,base_price,created_at");
  if (error) throw new Error(error.message);

  const platformNames = new Set(PLATFORM_SERVICES.map((s) => s.name_ar));
  const toMigrate = (all || []).filter((r) => !platformNames.has(r.name_ar));

  for (const old of toMigrate) {
    const targetNameAr = mapOldToPlatform(old);
    const targetId = platformIdByName[targetNameAr];
    if (!targetId) {
      console.warn("Missing platform target id for", targetNameAr);
      continue;
    }
    const upReq = await supabase
      .from("requests")
      .update({ service_id: targetId, updated_at: new Date().toISOString() })
      .eq("service_id", old.id);
    if (upReq.error) {
      console.error("Update requests failed for", old.id, upReq.error.message);
      continue;
    }
    const del = await supabase.from("services").delete().eq("id", old.id);
    if (del.error) {
      console.error("Delete old service failed for", old.id, del.error.message);
      continue;
    }
    console.log("Migrated", old.name_ar, "->", targetNameAr, "and deleted", old.id);
  }
}

async function main() {
  await migrate();
  const { data } = await supabase
    .from("services")
    .select("id,name_ar,name_en,base_price,is_active")
    .order("created_at", { ascending: true });
  console.table(
    (data || []).map((s) => ({
      id: s.id,
      name_ar: s.name_ar,
      name_en: s.name_en,
      base_price: s.base_price,
      is_active: s.is_active !== false,
    }))
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
