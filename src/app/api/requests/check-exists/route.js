import { NextResponse } from "next/server.js";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req) {
  try {
    const body = await req.json();
    const { id } = body || {};
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Supabase admin not configured" }, { status: 500 });
    }
    const { data, error } = await supabaseAdmin
      .from("requests")
      .select("id")
      .eq("id", id)
      .maybeSingle();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ exists: !!data });
  } catch (e) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
