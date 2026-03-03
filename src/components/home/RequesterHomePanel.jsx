"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabaseClient";
import { tr as trHelper } from "@/utils/tr";
import { ClipboardList } from "lucide-react";

export default function RequesterHomePanel({
  requesterId,
  userId,
  reqPageSize = 10,
  notPageSize = 10,
  initialRequests = [],
  initialNotifications = [],
  initialRequestCount = 0,
  initialNotificationsCount = 0,
}) {
  const { t } = useTranslation();
  const tr = useCallback((key, fallback) => trHelper(t, key, fallback), [t]);
  const [reqs, setReqs] = useState(initialRequests || []);
  const [tickets, setTickets] = useState(initialNotifications || []);
  const [reqCount, setReqCount] = useState(initialRequestCount || 0);
  const [notCount, setNotCount] = useState(initialNotificationsCount || 0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      if (!requesterId || !userId) {
        setLoading(false);
        return;
      }
      const { count: requestsCount } = await supabase.from("requests").select("*", { count: "exact", head: true }).eq("requester_id", requesterId);
      const { data: requests } = await supabase
        .from("requests")
        .select(`
          id,
          title,
          created_at,
          service:services(name_ar,name_en),
          status:lookup_values!requests_status_id_fkey(name_ar,name_en,code)
        `)
        .eq("requester_id", requesterId)
        .order("created_at", { ascending: false })
        .limit(reqPageSize);
      const { count: ticketsCount } = await supabase.from("tickets").select("*", { count: "exact", head: true }).eq("user_id", userId);
      const { data: notifs } = await supabase
        .from("tickets")
        .select("id,title,created_at,status_id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(notPageSize);
      const mapped = (requests || []).map((r) => ({
        id: r.id,
        title: r.title || "-",
        serviceName: r.service ? r.service.name_ar || r.service.name_en : "-",
        statusName: r.status ? r.status.name_ar || r.status.name_en : "-",
        statusCode: r.status ? r.status.code || "" : "",
        created_at: r.created_at,
      }));
      setReqCount(typeof requestsCount === "number" ? requestsCount : initialRequestCount || 0);
      setReqs(mapped.length ? mapped : (initialRequests || []));
      setNotCount(typeof ticketsCount === "number" ? ticketsCount : initialNotificationsCount || 0);
      setTickets((notifs && notifs.length) ? notifs : (initialNotifications || []));
    } finally {
      setLoading(false);
    }
  }, [requesterId, userId, reqPageSize, notPageSize, initialRequestCount, initialRequests, initialNotificationsCount, initialNotifications]);

  useEffect(() => {
    load();
  }, [requesterId, userId, reqPageSize, notPageSize, load]);

  useEffect(() => {
    if (!requesterId || !userId) return;
    const ch = supabase
      .channel("home-panel")
      .on("postgres_changes", { event: "*", schema: "public", table: "requests", filter: `requester_id=eq.${requesterId}` }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "tickets", filter: `user_id=eq.${userId}` }, () => load());
    ch.subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [requesterId, userId, load]);

  const RequestsList = useMemo(
    () => ({ items }) =>
      items && items.length > 0 ? (
        <div className="space-y-3">
          {items.map((it) => {
            const s = statusStyle(it.statusCode);
            return (
              <a
                href={it.id ? `/requests/${it.id}` : "/requests"}
                key={it.id}
                className={`flex items-center justify-between p-4 rounded-2xl border ${s.border} hover:shadow-sm transition bg-white`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`inline-flex items-center justify-center w-10 h-10 rounded-2xl ${s.bg} ${s.text} border ${s.border}`}>
                    <ClipboardList className="w-5 h-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="font-bold text-gray-900 truncate">{it.title}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5 truncate">{it.serviceName}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`inline-block text-[11px] font-black px-3 py-1 rounded-full ${s.bg} ${s.text} border ${s.border}`}>
                    {it.statusName}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">{it.created_at ? new Date(it.created_at).toLocaleString("ar-EG") : ""}</div>
                </div>
              </a>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-white flex items-center justify-center border border-gray-200 shadow-sm mb-3">
            <ClipboardList className="w-6 h-6 text-gray-500" />
          </div>
          <div className="text-gray-600 text-sm mb-2">{tr("home.noRequests", "لا توجد طلبات")}</div>
          <a href="/request-service" className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold">
            {tr("home.actionNewRequest", "طلب خدمة جديدة")}
          </a>
        </div>
      ),
    [tr]
  );

  const NotificationsList = useMemo(
    () => ({ items }) =>
      items && items.length > 0 ? (
        <ul className="space-y-2">
          {items.map((n) => (
            <a href={`/tickets/${n.id}`} key={n.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50">
              <span className="font-medium text-gray-800 truncate">{n.title}</span>
              <span className="text-[11px] text-gray-500">{new Date(n.created_at).toLocaleDateString("ar-EG")}</span>
            </a>
          ))}
        </ul>
      ) : (
        <div className="text-gray-500 text-sm">{tr("home.noNotifications", "لا توجد إشعارات")}</div>
      ),
    [tr]
  );

  const incompleteReqs = useMemo(() => {
    const doneCodes = ["completed", "closed", "finished", "done"];
    return (reqs || []).filter((r) => {
      const c = String(r.statusCode || "").toLowerCase();
      return !doneCodes.includes(c);
    });
  }, [reqs]);

  const statusStyle = (code) => {
    const c = String(code || "").toLowerCase();
    if (["pending", "new", "priced"].includes(c)) {
      return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" };
    }
    if (["in_progress", "assigned", "processing"].includes(c)) {
      return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" };
    }
    if (["paused", "on_hold"].includes(c)) {
      return { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200" };
    }
    if (["cancelled", "canceled"].includes(c)) {
      return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" };
    }
    return { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" };
  };

  const IncompleteList = useMemo(
    () => ({ items }) =>
      items && items.length > 0 ? (
        <div className="space-y-3">
          {items.map((it) => {
            const s = statusStyle(it.statusCode);
            return (
              <a
                href={it.id ? `/requests/${it.id}` : "/requests"}
                key={it.id}
                className={`flex items-center justify-between p-4 rounded-2xl border ${s.border} ${s.bg} hover:bg-white hover:shadow-sm transition`}
              >
                <div className="min-w-0">
                  <div className="font-bold text-gray-900 truncate">{it.title}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5 truncate">{it.serviceName}</div>
                </div>
                <div className={`text-[11px] font-black px-3 py-1 rounded-full ${s.bg} ${s.text} border ${s.border}`}>
                  {it.statusName}
                </div>
              </a>
            );
          })}
        </div>
      ) : (
        <div className="text-gray-500 text-sm">{tr("home.noIncomplete", "لا توجد طلبات غير مكتملة")}</div>
      ),
    [tr]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">{tr("home.requests", "طلباتي")}</h3>
          <p className="text-gray-600 text-sm mb-4">{tr("home.total", "إجمالي") + ": " + (Math.max(reqCount || 0, (reqs || []).length))}</p>
          {loading ? <div className="text-gray-400 text-sm">...</div> : <RequestsList items={reqs} />}
          <div className="mt-4 flex items-center justify-between">
            <a href={`/home?RequestPageSize=${reqPageSize}&RequestPageNumber=2&NotifyPageSize=${notPageSize}&NotifyPageNumber=1`} className="text-primary font-bold text-sm">
              {tr("viewMore", "عرض المزيد")}
            </a>
            <a href="/requests" className="text-gray-700 font-bold text-sm">
              {tr("viewAll", "عرض الكل")}
            </a>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">{tr("home.incompleteRequests", "الطلبات غير المكتملة")}</h3>
          <p className="text-gray-600 text-sm mb-4">{tr("home.total", "إجمالي") + ": " + (incompleteReqs?.length || 0)}</p>
          {loading ? <div className="text-gray-400 text-sm">...</div> : <IncompleteList items={incompleteReqs} />}
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">{tr("home.notifications", "الإشعارات")}</h3>
          <p className="text-gray-600 text-sm mb-4">{tr("home.total", "إجمالي") + ": " + (notCount || 0)}</p>
          {loading ? <div className="text-gray-400 text-sm">...</div> : <NotificationsList items={tickets} />}
          <div className="mt-4 flex items-center justify-between">
            <a href={`/home?NotifyPageSize=${notPageSize}&NotifyPageNumber=2&RequestPageSize=${reqPageSize}&RequestPageNumber=1`} className="text-primary font-bold text-sm">
              {tr("viewMore", "عرض المزيد")}
            </a>
            <a href="/tickets" className="text-gray-700 font-bold text-sm">
              {tr("viewAll", "عرض الكل")}
            </a>
          </div>
        </div>
      </div>
      <div className="lg:col-span-1 space-y-8">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">{tr("home.quickActions", "إجراءات سريعة")}</h3>
          <div className="grid gap-2">
            <a href="/request-service" className="px-4 py-3 rounded-xl bg-primary/5 text-primary font-bold border border-primary/10">
              {tr("home.actionNewRequest", "طلب خدمة جديدة")}
            </a>
            <a href="/requests" className="px-4 py-3 rounded-xl bg-gray-50 text-gray-800 font-bold border border-gray-100">
              {tr("home.browseRequests", "تصفح طلباتي")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
