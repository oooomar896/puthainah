import { NextResponse } from "next/server.js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers.js";
import { supabaseAdmin } from "@/lib/supabase";

async function getUserRole() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return null;
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          void 0;
        }
      },
    },
  });
  const { data } = await supabase.auth.getUser();
  const user = data?.user || null;
  const metaRole = user?.user_metadata?.role || null;
  if (metaRole) return metaRole.charAt(0).toUpperCase() + metaRole.slice(1).toLowerCase();
  if (user?.id && supabaseAdmin) {
    const { data: u } = await supabaseAdmin.from("users").select("role").eq("id", user.id).maybeSingle();
    const tblRole = u?.role || null;
    if (tblRole) return tblRole.charAt(0).toUpperCase() + tblRole.slice(1).toLowerCase();
  }
  return null;
}

async function assertAdmin() {
  const role = await getUserRole();
  if (role !== "Admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

function buildMatch(query, match) {
  let q = query;
  if (match && typeof match === "object") {
    Object.entries(match).forEach(([k, v]) => {
      q = q.eq(k, v);
    });
  }
  return q;
}

export async function GET(request) {
  try {
    const forbidden = await assertAdmin();
    if (forbidden) return forbidden;
    if (!supabaseAdmin) return NextResponse.json({ error: "Admin client not configured" }, { status: 500 });
    const { searchParams } = new URL(request.url);
    const table = searchParams.get("table");
    const select = searchParams.get("select") || "*";
    const matchParam = searchParams.get("match");
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const orderBy = searchParams.get("orderBy");
    const orderAsc = (searchParams.get("orderAsc") || "true") === "true";
    if (!table) return NextResponse.json({ error: "Missing table" }, { status: 400 });
    let q = supabaseAdmin.from(table).select(select);
    const match = matchParam ? JSON.parse(matchParam) : null;
    q = buildMatch(q, match);
    if (orderBy) q = q.order(orderBy, { ascending: orderAsc });
    if (limit) q = q.limit(limit);
    const { data, error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data });
  } catch (_) {
    return NextResponse.json({ error: _.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const forbidden = await assertAdmin();
    if (forbidden) return forbidden;
    if (!supabaseAdmin) return NextResponse.json({ error: "Admin client not configured" }, { status: 500 });
    const body = await request.json();
    const { table, values } = body || {};
    if (!table || !values || typeof values !== "object") return NextResponse.json({ error: "Missing table or values" }, { status: 400 });
    const { data, error } = await supabaseAdmin.from(table).insert(values).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data }, { status: 201 });
  } catch (_) {
    return NextResponse.json({ error: _.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const forbidden = await assertAdmin();
    if (forbidden) return forbidden;
    if (!supabaseAdmin) return NextResponse.json({ error: "Admin client not configured" }, { status: 500 });
    const body = await request.json();
    const { table, id, match, values } = body || {};
    if (!table || !values || typeof values !== "object") return NextResponse.json({ error: "Missing table or values" }, { status: 400 });
    let q = supabaseAdmin.from(table).update(values);
    if (id) q = q.eq("id", id);
    q = buildMatch(q, match);
    const { data, error } = await q.select();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data });
  } catch (_) {
    return NextResponse.json({ error: _.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const forbidden = await assertAdmin();
    if (forbidden) return forbidden;
    if (!supabaseAdmin) return NextResponse.json({ error: "Admin client not configured" }, { status: 500 });
    const body = await request.json();
    const { table, id, match } = body || {};
    if (!table) return NextResponse.json({ error: "Missing table" }, { status: 400 });
    let q = supabaseAdmin.from(table).delete();
    if (id) q = q.eq("id", id);
    q = buildMatch(q, match);
    const { data, error } = await q.select();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data });
  } catch (_) {
    return NextResponse.json({ error: _.message }, { status: 500 });
  }
}
