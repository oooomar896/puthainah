import { NextResponse } from "next/server.js";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req) {
  try {
    const body = await req.json();
    const { id } = body || {};
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    if (!supabaseAdmin) return NextResponse.json({ error: "Supabase admin not configured" }, { status: 500 });

    const { data: reqRow, error } = await supabaseAdmin
      .from("requests")
      .select(`
        *,
        requester:requesters!requests_requester_id_fkey(id,name,full_name),
        service:services(id,name_ar,name_en,description,base_price),
        status:lookup_values!requests_status_id_fkey(id,name_ar,name_en,code),
        city:cities(id,name_ar,name_en)
      `)
      .eq("id", id)
      .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!reqRow) return NextResponse.json({ data: null });

    const groupKey = reqRow.attachments_group_key || null;
    let attachments = [];
    if (groupKey) {
      const { data: group } = await supabaseAdmin
        .from("attachment_groups")
        .select("id,group_key")
        .eq("group_key", groupKey)
        .maybeSingle();
      if (group?.id) {
        const { data: files } = await supabaseAdmin
          .from("attachments")
          .select("id,file_path,file_name,content_type,size_bytes,request_phase_lookup_id,created_at")
          .eq("group_id", group.id);
        attachments = (files || []).map((f) => ({
          id: f.id,
          fileUrl: f.file_path,
          fileName: f.file_name,
          contentType: f.content_type,
          sizeBytes: f.size_bytes,
          requestPhaseLookupId: f.request_phase_lookup_id,
          created_at: f.created_at,
        }));
      }
    }

    const service = reqRow.service || {};
    const data = {
      ...reqRow,
      service: {
        id: service.id,
        name_ar: service.name_ar,
        name_en: service.name_en,
        description: service.description,
        base_price: service.base_price,
        price: typeof service.base_price === "number" ? Number(service.base_price) : null,
      },
      requestStatus: reqRow.status
        ? {
          id: reqRow.status.id,
          nameAr: reqRow.status.name_ar,
          nameEn: reqRow.status.name_en,
          code: reqRow.status.code,
        }
        : null,
      attachments,
    };

    return NextResponse.json({ data });
  } catch (e) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
