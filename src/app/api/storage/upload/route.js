import { NextResponse } from "next/server.js";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Supabase admin not configured" }, { status: 500 });
    }
    const form = await req.formData();
    const file = form.get("file");
    const requestedBucket = form.get("bucket");
    const folder = form.get("folder") || "services";
    const bucket = requestedBucket || process.env.NEXT_PUBLIC_SUPABASE_IMAGES_BUCKET || "attachments";

    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json({ error: "Invalid file" }, { status: 400 });
    }

    const fileNameFromForm = form.get("filename");
    const nameBase =
      (fileNameFromForm && String(fileNameFromForm).replace(/[^a-zA-Z0-9._-]/g, "")) ||
      `upload-${Date.now()}`;
    const extFromType = (file.type || "").split("/").pop() || "png";
    const objectPath = `${folder}/${nameBase}.${extFromType}`;

    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const exists = (buckets || []).some((b) => b.name === bucket);
    if (!exists) {
      const { error: createErr } = await supabaseAdmin.storage.createBucket(bucket, {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024,
      });
      if (createErr) {
        return NextResponse.json({ error: createErr.message }, { status: 400 });
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadErr } = await supabaseAdmin.storage.from(bucket).upload(objectPath, buffer, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "application/octet-stream",
    });
    if (uploadErr) {
      return NextResponse.json({ error: uploadErr.message }, { status: 400 });
    }

    const { data: pub } = supabaseAdmin.storage.from(bucket).getPublicUrl(objectPath);
    return NextResponse.json({ url: pub?.publicUrl || null, path: objectPath, bucket }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
