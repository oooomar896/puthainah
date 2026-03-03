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
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function isMatch(row, svc) {
  const arRow = normalize(row.name_ar);
  const enRow = normalize(row.name_en);
  const arSvc = normalize(svc.name_ar);
  const enSvc = normalize(svc.name_en);
  return (
    arRow === arSvc ||
    enRow === enSvc ||
    arRow.includes(arSvc) ||
    arSvc.includes(arRow) ||
    enRow.includes(enSvc) ||
    enSvc.includes(enRow)
  );
}

function pickCanonical(rows) {
  const sorted = [...rows].sort((a, b) => {
    const ap = typeof a.base_price === "number";
    const bp = typeof b.base_price === "number";
    if (ap !== bp) return bp ? 1 : -1;
    const aa = a.is_active !== false;
    const ba = b.is_active !== false;
    if (aa !== ba) return ba ? 1 : -1;
    const at = new Date(a.created_at || 0).getTime();
    const bt = new Date(b.created_at || 0).getTime();
    return at - bt;
  });
  return sorted[0];
}

async function main() {
  const { data, error } = await supabase
    .from("services")
    .select("id,name_ar,name_en,base_price,is_active,created_at")
    .order("created_at", { ascending: true });
  if (error) {
    console.error("Query error:", error.message);
    process.exit(1);
  }
  const rows = Array.isArray(data) ? data : [];

  const groups = PLATFORM_SERVICES.map((svc) => {
    const matches = rows.filter((r) => isMatch(r, svc));
    return { svc, matches };
  });

  const actions = [];
  for (const g of groups) {
    if (g.matches.length <= 1) continue;
    const canonical = pickCanonical(g.matches);
    const duplicates = g.matches.filter((m) => m.id !== canonical.id);
    for (const dup of duplicates) {
      actions.push({ svc: g.svc, canonical, dup });
    }
  }

  for (const act of actions) {
    const { canonical, dup } = act;
    const upRes = await supabase
      .from("requests")
      .update({ service_id: canonical.id, updated_at: new Date().toISOString() })
      .eq("service_id", dup.id);
    if (upRes.error) {
      console.error("Update requests error:", upRes.error.message, "dup:", dup.id);
      continue;
    }
    const disableRes = await supabase
      .from("services")
      .update({ is_active: false, name_en: (dup.name_en || "") })
      .eq("id", dup.id);
    if (disableRes.error) {
      console.error("Disable service error:", disableRes.error.message, "dup:", dup.id);
      continue;
    }
    console.log("Merged duplicate", dup.id, "into", canonical.id, "and disabled duplicate");
  }

  const { data: finalRows } = await supabase
    .from("services")
    .select("id,name_ar,name_en,base_price,is_active,created_at")
    .order("created_at", { ascending: true });
  console.table(
    (finalRows || []).map((s) => ({
      id: s.id,
      name_ar: s.name_ar,
      name_en: s.name_en,
      base_price: typeof s.base_price === "number" ? Number(s.base_price) : null,
      is_active: s.is_active !== false,
    }))
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
