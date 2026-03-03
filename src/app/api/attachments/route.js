"use server";

import { NextResponse } from "next/server.js";
import { supabaseAdmin, validateSupabaseAdminKey } from "@/lib/supabase";

export async function POST(request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ message: "Supabase admin not configured" }, { status: 500 });
    }
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
    console.log(`Using Key Start: ${key ? key.substring(0, 10) + "..." : "MISSING"}`);

    // Validate the key quickly to return a clear error when misconfigured
    const validation = await validateSupabaseAdminKey();
    if (!validation.ok) {
      console.error("Supabase key validation failed:", validation.message);
      return NextResponse.json({ message: "Supabase service key invalid or misconfigured", details: validation.message }, { status: 500 });
    }

    const url = new URL(request.url);
    const groupKey = url.searchParams.get("groupKey");
    console.log(`API POST /api/attachments - groupKey: ${groupKey}`);

    let form;
    try {
      form = await request.formData();
    } catch (err) {
      console.error("Error parsing formData:", err);
      return NextResponse.json({ message: "Invalid form data", details: err.message }, { status: 400 });
    }

    const files = form.getAll("files");
    const requestPhaseCodeRaw = form.get("requestPhaseLookupId");
    console.log(`Files count: ${files?.length || 0}, Phase: ${requestPhaseCodeRaw}`);

    if (!groupKey) {
      return NextResponse.json({ message: "Missing groupKey" }, { status: 400 });
    }
    if (!files || files.length === 0) {
      return NextResponse.json({ message: "No files provided" }, { status: 400 });
    }

    const { data: group, error: fetchGroupErr } = await supabaseAdmin
      .from("attachment_groups")
      .select("id,group_key")
      .eq("group_key", groupKey)
      .maybeSingle();

    if (fetchGroupErr) {
      console.error("Error fetching group:", fetchGroupErr);
    }

    let groupId = group?.id || null;
    console.log(`Found groupId: ${groupId}`);

    if (!groupId) {
      console.log(`Creating new group for key: ${groupKey}`);
      const { data: created, error: createErr } = await supabaseAdmin
        .from("attachment_groups")
        .insert({ group_key: groupKey })
        .select("id")
        .single();

      if (createErr || !created?.id) {
        console.error("Failed to create group:", createErr);
        const details = createErr?.message || String(createErr);
        if ((details || "").toLowerCase().includes("invalid api key") || (details || "").toLowerCase().includes("invalid service key")) {
          return NextResponse.json({ message: "Supabase service key invalid", details }, { status: 500 });
        }
        return NextResponse.json({ message: "Failed to create attachment group", details }, { status: 500 });
      }
      groupId = created.id;
      console.log(`Created groupId: ${groupId}`);
    }

    let requestPhaseLookupId = null;
    if (requestPhaseCodeRaw) {
      if (!isNaN(requestPhaseCodeRaw)) {
        requestPhaseLookupId = parseInt(requestPhaseCodeRaw);
      } else {
        // Fallback for code-based strings
        const { data: phase } = await supabaseAdmin
          .from("lookup_values")
          .select("id")
          .eq("code", String(requestPhaseCodeRaw))
          .maybeSingle();
        requestPhaseLookupId = phase?.id || null;
      }
    }
    console.log(`Resolved Phase ID: ${requestPhaseLookupId}`);

    const uploaded = [];
    console.log(`Processing ${files.length} files for group ${groupKey}`);

    for (const file of files) {
      console.log(`Uploading file: ${file.name} (${file.size} bytes)`);
      const arrayBuffer = await file.arrayBuffer();
      const bytes = Buffer.from(arrayBuffer);
      const ext = file.name.split(".").pop();
      const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const path = `attachments/${groupId}/${unique}.${ext}`;

      const { data: storageRes, error: storageErr } = await supabaseAdmin.storage
        .from("attachments")
        .upload(path, bytes, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });

      if (storageErr) {
        console.error("Storage upload error:", storageErr);
        return NextResponse.json({ message: "Storage upload failed", details: storageErr.message }, { status: 500 });
      }

      console.log(`Saved to storage: ${storageRes.path}. Inserting into DB...`);

      const { error: insertErr } = await supabaseAdmin
        .from("attachments")
        .insert({
          group_id: groupId,
          file_path: storageRes?.path || path,
          file_name: file.name,
          content_type: file.type || null,
          size_bytes: file.size || null,
          request_phase_lookup_id: requestPhaseLookupId,
        });

      if (insertErr) {
        console.error("Database insert error:", insertErr);
        return NextResponse.json({ message: "Database insert failed", details: insertErr.message }, { status: 500 });
      }

      uploaded.push({ path: storageRes?.path || path, name: file.name });
    }

    console.log(`Successfully uploaded ${uploaded.length} files.`);
    return NextResponse.json({ ok: true, uploaded }, { status: 200 });
  } catch (e) {
    console.error("API Attachments Error:", e);
    return NextResponse.json({ message: "Unexpected error", details: String(e?.message || e) }, { status: 500 });
  }
}
