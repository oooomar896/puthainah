import { NextResponse } from "next/server.js";
import { supabaseAdmin } from "@/lib/supabase";
import { PLATFORM_SERVICES } from "@/constants/servicesData";

export async function POST() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Supabase admin not configured" }, { status: 500 });
    }
    await supabaseAdmin.from("services").delete().neq("id", null);
    const rows = PLATFORM_SERVICES.map((s) => ({
      name_ar: s.name_ar,
      name_en: s.name_en,
      description: s.description_ar,
      base_price: 0,
      is_active: true,
      image_url: null,
    }));
    const { data, error } = await supabaseAdmin.from("services").insert(rows).select("id,name_ar,name_en");
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ inserted: data?.length || 0, services: data });
  } catch (e) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
