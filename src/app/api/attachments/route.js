"use server";

import { NextResponse } from "next/server.js";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ message: "Supabase admin not configured" }, { status: 500 });
    }
    let key = null;
    const { data, error } = await supabaseAdmin.rpc("create_attachment_group_key");
    if (!error && data) {
      key = data;
    } else {
      const generated = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const { data: inserted, error: insertErr } = await supabaseAdmin
        .from("attachment_groups")
        .insert({ group_key: generated })
        .select("group_key")
        .single();
      if (insertErr || !inserted?.group_key) {
        return NextResponse.json({ message: "Failed to create group key" }, { status: 500 });
      }
      key = inserted.group_key;
    }
    return NextResponse.json(key, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: "Unexpected error", details: String(e?.message || e) }, { status: 500 });
  }
}
