import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

const tryTable = async (table) => {
  const res = await supabase.from(table).select("*").range(0, 0);
  return !res.error;
};

const ensureService = async (svc) => {
  const { data } = await supabase
    .from("services")
    .select("id,name_en")
    .ilike("name_en", svc.name_en)
    .maybeSingle();
  if (data?.id) return data.id;
  const { data: inserted, error } = await supabase
    .from("services")
    .insert({
      name_ar: svc.name_ar,
      name_en: svc.name_en,
      price: svc.price ?? null,
      image_url: svc.image_url || null,
      is_active: svc.is_active ?? true,
    })
    .select("id")
    .single();
  if (error) throw error;
  return inserted.id;
};

const ensureRequester = async (rq) => {
  const { data } = await supabase
    .from("requesters")
    .select("id,name")
    .ilike("name", rq.name)
    .maybeSingle();
  if (data?.id) return data.id;
  const { data: inserted, error } = await supabase
    .from("requesters")
    .insert({
      name: rq.name,
      email: rq.email || null,
    })
    .select("id")
    .single();
  if (error) throw error;
  return inserted.id;
};

const ensureProvider = async (pv) => {
  const { data } = await supabase
    .from("providers")
    .select("id,name")
    .ilike("name", pv.name)
    .maybeSingle();
  if (data?.id) return data.id;
  const { data: inserted, error } = await supabase
    .from("providers")
    .insert({
      name: pv.name,
      specialization: pv.specialization || null,
      avg_rate: pv.avg_rate || null,
    })
    .select("id")
    .single();
  if (error) throw error;
  return inserted.id;
};

const ensurePartner = async (p) => {
  const { data } = await supabase
    .from("partners")
    .select("id,name")
    .ilike("name", p.name)
    .maybeSingle();
  if (data?.id) return data.id;
  const { data: inserted, error } = await supabase
    .from("partners")
    .insert({
      name: p.name,
      logo_url: p.logo_url || null,
      website_url: p.website_url || null,
      description: p.description || null,
      is_active: p.is_active ?? true,
    })
    .select("id")
    .single();
  if (error) throw error;
  return inserted.id;
};

const ensureCustomer = async (c) => {
  const { data } = await supabase
    .from("customers")
    .select("id,name")
    .ilike("name", c.name)
    .maybeSingle();
  if (data?.id) return data.id;
  const { data: inserted, error } = await supabase
    .from("customers")
    .insert({
      name: c.name,
      logo_url: c.logo_url || null,
      description: c.description || null,
    })
    .select("id")
    .single();
  if (error) throw error;
  return inserted.id;
};

const ensureFaq = async (f) => {
  const { data } = await supabase
    .from("faq_questions")
    .select("id,question_en")
    .ilike("question_en", f.question_en)
    .maybeSingle();
  if (data?.id) return data.id;
  const { data: inserted, error } = await supabase
    .from("faq_questions")
    .insert({
      question_ar: f.question_ar,
      question_en: f.question_en,
      answer_ar: f.answer_ar,
      answer_en: f.answer_en,
      is_active: f.is_active ?? true,
    })
    .select("id")
    .single();
  if (error) throw error;
  return inserted.id;
};

const ensureTicket = async (t) => {
  const { data } = await supabase
    .from("tickets")
    .select("id,title")
    .ilike("title", t.title)
    .maybeSingle();
  if (data?.id) return data.id;
  const { data: inserted, error } = await supabase
    .from("tickets")
    .insert({
      user_id: t.user_id,
      related_order_id: t.related_order_id || null,
      title: t.title,
      description: t.description || null,
      status_id: t.status_id || 1,
    })
    .select("id")
    .single();
  if (error) throw error;
  return inserted.id;
};
const ensureRequest = async (req) => {
  const { data } = await supabase
    .from("requests")
    .select("id,title")
    .ilike("title", req.title)
    .maybeSingle();
  if (data?.id) return data.id;
  const { data: inserted, error } = await supabase
    .from("requests")
    .insert({
      title: req.title,
      description: req.description || null,
      requester_id: req.requester_id,
      service_id: req.service_id,
    })
    .select("id")
    .single();
  if (error) throw error;
  return inserted.id;
};

const ensureCity = async (c) => {
  const { data } = await supabase
    .from("cities")
    .select("id,name_ar")
    .ilike("name_ar", c.name_ar)
    .maybeSingle();
  if (data?.id) return data.id;
  const { data: inserted, error } = await supabase
    .from("cities")
    .insert({
      name_ar: c.name_ar,
      name_en: c.name_en,
    })
    .select("id")
    .single();
  if (error) throw error;
  return inserted.id;
};

const ensureLookupType = async (code) => {
  const { data } = await supabase
    .from("lookup_types")
    .select("id,code")
    .eq("code", code)
    .maybeSingle();
  if (data?.id) return data.id;
  const { data: inserted, error } = await supabase
    .from("lookup_types")
    .insert({ code })
    .select("id")
    .single();
  if (error) throw error;
  return inserted.id;
};

const ensureLookupValue = async (typeId, v) => {
  const { data } = await supabase
    .from("lookup_values")
    .select("id,name_en,lookup_type_id")
    .eq("lookup_type_id", typeId)
    .ilike("name_en", v.name_en)
    .maybeSingle();
  if (data?.id) return data.id;
  const { data: inserted, error } = await supabase
    .from("lookup_values")
    .insert({
      lookup_type_id: typeId,
      name_ar: v.name_ar,
      name_en: v.name_en,
      code: v.code || null,
    })
    .select("id")
    .single();
  if (error) throw error;
  return inserted.id;
};

const ensureRating = async (r) => {
  const { data } = await supabase
    .from("order_ratings")
    .select("id,order_id,rated_by_user_id")
    .eq("order_id", r.order_id)
    .eq("rated_by_user_id", r.rated_by_user_id)
    .maybeSingle();
  if (data?.id) return data.id;
  const { data: inserted, error } = await supabase
    .from("order_ratings")
    .insert({
      order_id: r.order_id,
      rated_by_user_id: r.rated_by_user_id,
      rating_value: r.rating_value,
      comment: r.comment || null,
    })
    .select("id")
    .single();
  if (error) throw error;
  return inserted.id;
};
const ensureOrder = async (ord) => {
  const { data } = await supabase
    .from("orders")
    .select("id,request_id,provider_id")
    .eq("request_id", ord.request_id)
    .eq("provider_id", ord.provider_id)
    .maybeSingle();
  if (data?.id) return data.id;
  const { data: inserted, error } = await supabase
    .from("orders")
    .insert({
      order_title: ord.order_title || null,
      order_status_id: ord.order_status_id || 600,
      request_id: ord.request_id,
      provider_id: ord.provider_id,
      created_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (error) throw error;
  return inserted.id;
};

export async function seedDemoData() {
  if (!supabase) {
    toast.error("Supabase client غير مهيأ. تأكد من إعداد مفاتيح البيئة.");
    return { ok: false, message: "supabase not initialized" };
  }
  try {
    const { data: userData } = await supabase.auth.getUser();
    const currentUserId = userData?.user?.id || null;
    const servicesOk = await tryTable("services");
    const requestersOk = await tryTable("requesters");
    const providersOk = await tryTable("providers");
    const requestsOk = await tryTable("requests");
    const ordersOk = await tryTable("orders");
    const partnersOk = await tryTable("partners");
    const customersOk = await tryTable("customers");
    const faqsOk = await tryTable("faq_questions");
    const ticketsOk = await tryTable("tickets");
    const citiesOk = await tryTable("cities");
    const lookupTypesOk = await tryTable("lookup_types");
    const lookupValuesOk = await tryTable("lookup_values");

    const svcIds = [];
    if (servicesOk) {
      const baseServices = [
        { name_ar: "استشارة تقنية", name_en: "Tech Consulting", price: 300, is_active: true },
        { name_ar: "تصميم واجهات", name_en: "UI Design", price: 500, is_active: true },
        { name_ar: "تحليل المتطلبات", name_en: "Requirements Analysis", price: 400, is_active: true },
      ];
      for (const s of baseServices) {
        const id = await ensureService(s);
        svcIds.push(id);
      }
    }

    let rqId = null;
    if (requestersOk) {
      rqId = await ensureRequester({ name: "Ahmed Requester", email: "ahmed.requester@example.com" });
    }

    let pvId = null;
    if (providersOk) {
      pvId = await ensureProvider({ name: "Khalid Provider", specialization: "Design", avg_rate: 4.6 });
    }

    let reqId = null;
    if (requestsOk && rqId && svcIds.length > 0) {
      reqId = await ensureRequest({
        title: "واجهة صفحة تسجيل",
        description: "تصميم واجهة صفحة تسجيل متجاوبة",
        requester_id: rqId,
        service_id: svcIds[1],
      });
    }

    if (ordersOk && reqId && pvId) {
      const ord1 = await ensureOrder({
        order_title: "طلب تصميم واجهة",
        order_status_id: 601,
        request_id: reqId,
        provider_id: pvId,
      });
      const ord2 = await ensureOrder({
        order_title: "طلب تحليل متطلبات",
        order_status_id: 603,
        request_id: await ensureRequest({
          title: "تحليل مشروع CRM",
          description: "تحليل متطلبات نظام إدارة علاقات العملاء",
          requester_id: rqId,
          service_id: svcIds[2],
        }),
        provider_id: pvId,
      });
      if (currentUserId) {
        await ensureRating({ order_id: ord1, rated_by_user_id: currentUserId, rating_value: 4, comment: "جيد جدًا" });
        await ensureRating({ order_id: ord2, rated_by_user_id: currentUserId, rating_value: 5, comment: "ممتاز" });
      }
    }
    if (partnersOk) {
      await ensurePartner({ name: "Vercel", logo_url: null, website_url: "https://vercel.com", description: "Hosting Partner", is_active: true });
      await ensurePartner({ name: "Netlify", logo_url: null, website_url: "https://www.netlify.com", description: "CI/CD Partner", is_active: true });
    }
    if (customersOk) {
      await ensureCustomer({ name: "ACME Corp", logo_url: null, description: "عميل تجريبي" });
      await ensureCustomer({ name: "Globex", logo_url: null, description: "عميل تجريبي 2" });
    }
    if (faqsOk) {
      await ensureFaq({ question_ar: "كيف أطلب خدمة؟", question_en: "How to request a service?", answer_ar: "اختر الخدمة واتبع الخطوات.", answer_en: "Choose service and follow the steps.", is_active: true });
      await ensureFaq({ question_ar: "ما طرق الدفع؟", question_en: "What are payment methods?", answer_ar: "بطاقة، تحويل.", answer_en: "Card, transfer.", is_active: true });
    }
    if (ticketsOk && currentUserId) {
      await ensureTicket({ user_id: currentUserId, related_order_id: null, title: "اختبار البلاغ", description: "بلاغ تجريبي", status_id: 1 });
    }
    if (citiesOk) {
      await ensureCity({ name_ar: "الرياض", name_en: "Riyadh" });
      await ensureCity({ name_ar: "جدة", name_en: "Jeddah" });
    }
    if (lookupTypesOk && lookupValuesOk) {
      const requesterTypeId = await ensureLookupType("requester-entity-types");
      const providerTypeId = await ensureLookupType("provider-entity-types");
      await ensureLookupValue(requesterTypeId, { name_ar: "فرد", name_en: "Individual", code: "requester-individual" });
      await ensureLookupValue(requesterTypeId, { name_ar: "شركة", name_en: "Company", code: "requester-company" });
      await ensureLookupValue(providerTypeId, { name_ar: "فرد", name_en: "Individual", code: "provider-individual" });
      await ensureLookupValue(providerTypeId, { name_ar: "مؤسسة", name_en: "Organization", code: "provider-organization" });
    }

    toast.success("تم إدخال بيانات تجريبية بنجاح");
    return { ok: true };
  } catch (error) {
    const normalized =
      (error && (error.message || error.code || error.hint)) ?
      { message: error.message, code: error.code, hint: error.hint, details: error.details } :
      JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error))) || String(error);
    console.error("Seed error:", normalized);
    toast.error("فشل إدخال البيانات التجريبية");
    return { ok: false, message: error?.message || "seed failed" };
  }
}
