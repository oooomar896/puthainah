import { NextResponse } from "next/server.js";
import { supabaseAdmin } from "@/lib/supabase";
/**
 * Create Moyasar Invoice and return redirect URL
 * Body: { amount:number, currency?:string, description?:string, requestId?:string, userId?:string, supportedSources?:string[] }
 */
export async function POST(request) {
  try {
    const secretRaw = process.env.MOYASAR_SECRET_KEY || "";
    const secretKey = (secretRaw || "").trim();

    if (!secretKey) {
      return NextResponse.json(
        { error: "Moyasar secret key is missing in environment" },
        { status: 500 }
      );
    }
    if (secretKey.startsWith("pk_")) {
      return NextResponse.json(
        { error: "Invalid Moyasar secret key: publishable key provided. Use a key starting with sk_." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      amount,
      currency = "SAR",
      description = "Service Request Payment",
      requestId,
      userId,
      supportedSources = ["creditcard", "mada", "applepay"],
    } = body || {};
    const callbackUrl = (process.env.NEXT_PUBLIC_MOYASAR_CALLBACK_URL || "").trim() || `${(process.env.NEXT_PUBLIC_APP_BASE_URL || "").replace(/\/$/, "")}/moyasar/callback`;

    if (!amount || isNaN(Number(amount))) {
      return NextResponse.json(
        { error: "Invalid amount provided" },
        { status: 400 }
      );
    }

    const minorAmount = Math.round(Number(amount) * 100);
    const payload = {
      amount: minorAmount,
      currency,
      description: requestId ? `${description} (#${requestId})` : description,
      callback_url: callbackUrl,
      supported_sources: supportedSources,
    };

    const auth = Buffer.from(`${secretKey}:`).toString("base64");
    const res = await fetch("https://api.moyasar.com/v1/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: data?.message || "Failed to create invoice", details: data },
        { status: res.status || 500 }
      );
    }

    const invoiceUrl = data?.url || data?.invoice_url || null;
    let paymentRecordId = null;

    // Create pending payment record in DB if possible
    if (supabaseAdmin && requestId && userId) {
      const insertRes = await supabaseAdmin
        .from("payments")
        .insert({
          request_id: requestId,
          user_id: userId,
          amount: Number(amount),
          currency,
          stripe_payment_intent_id: data?.id || null, // store invoice id temporarily
          status: "pending",
          payment_method: "moyasar",
          payment_status: "pending",
        })
        .select("id")
        .single();

      if (!insertRes.error && insertRes.data?.id) {
        paymentRecordId = insertRes.data.id;
      }
    }

    return NextResponse.json({
      invoiceId: data?.id || null,
      invoiceUrl,
      status: data?.status || "created",
      paymentId: paymentRecordId,
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message}` },
      { status: 500 }
    );
  }
}
