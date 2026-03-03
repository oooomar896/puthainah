
import { NextResponse } from "next/server.js";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
    if (!supabaseAdmin) {
        return NextResponse.json({ status: "Null Admin Client" });
    }

    const { data, error } = await supabaseAdmin.storage.listBuckets();

    return NextResponse.json({
        status: error ? "Error" : "Success",
        buckets: data ? data.map(b => b.name) : [],
        error: error ? error.message : null,
        usedKeySuffix: process.env.SERVICE_ROLE_KEY_OVERRIDE?.substring(process.env.SERVICE_ROLE_KEY_OVERRIDE?.length - 10)
    });
}
