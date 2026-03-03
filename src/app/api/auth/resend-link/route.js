import { NextResponse } from "next/server.js";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, redirectTo } = body || {};
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Supabase admin client not configured" }, { status: 500 });
    }
    const params = {
      type: "signup",
      email,
      options: {
        redirectTo:
          redirectTo ||
          process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL ||
          (typeof window !== "undefined" ? window.location.origin : ""),
      },
    };
    const { data, error } = await supabaseAdmin.auth.admin.generateLink(params);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const url =
      data?.properties?.action_link ||
      data?.properties?.confirmation_token ||
      null;
    return NextResponse.json({ actionLink: url });
  } catch (e) {
    return NextResponse.json(
      { error: `Internal Server Error: ${e.message}` },
      { status: 500 }
    );
  }
}
