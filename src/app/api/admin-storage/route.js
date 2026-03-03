import { NextResponse } from "next/server.js";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseUrl } from "@/utils/env";

function getServiceClient() {
  const url = getSupabaseUrl();
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE ||
    "";
  if (!url || !key) {
    return { supabase: null, error: "Missing Supabase service role configuration" };
  }
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return { supabase, error: null };
}

export async function POST(req) {
  try {
    const { supabase, error: initError } = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: initError }, { status: 500 });
    }
    const body = await req.json();
    const { bucket, public: isPublic = true } = body || {};
    if (!bucket) {
      return NextResponse.json({ error: "Missing bucket name" }, { status: 400 });
    }
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = (buckets || []).some((b) => b.name === bucket);
    if (!exists) {
      const { error } = await supabase.storage.createBucket(bucket, {
        public: !!isPublic,
        fileSizeLimit: 5242880,
      });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
