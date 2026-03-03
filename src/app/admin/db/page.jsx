"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabaseClient";

export default function AdminDbStatusPage() {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState({
    requests: null,
    orders: null,
    services: null,
    profiles: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        if (!supabase) {
          throw new Error("Supabase client not initialized");
        }
        const fetchCount = async (table) => {
          const { count, error } = await supabase
            .from(table)
            .select("*", { count: "exact", head: true });
          if (error) throw error;
          return count ?? 0;
        };
        const [requests, orders, services, profiles] = await Promise.all([
          fetchCount("requests"),
          fetchCount("orders"),
          fetchCount("services"),
          fetchCount("profiles"),
        ]);
        if (!mounted) return;
        setMetrics({ requests, orders, services, profiles });
        setError(null);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Failed to load metrics");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">{t("adminDbStatus") || "Database Status"}</h1>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white shadow animate-pulse h-24" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="p-6 rounded-2xl bg-white shadow">
            <div className="text-sm text-gray-500">{t("requests") || "Requests"}</div>
            <div className="text-2xl font-bold">{metrics.requests}</div>
          </div>
          <div className="p-6 rounded-2xl bg-white shadow">
            <div className="text-sm text-gray-500">{t("orders") || "Orders"}</div>
            <div className="text-2xl font-bold">{metrics.orders}</div>
          </div>
          <div className="p-6 rounded-2xl bg-white shadow">
            <div className="text-sm text-gray-500">{t("services") || "Services"}</div>
            <div className="text-2xl font-bold">{metrics.services}</div>
          </div>
          <div className="p-6 rounded-2xl bg-white shadow">
            <div className="text-sm text-gray-500">{t("profiles") || "Profiles"}</div>
            <div className="text-2xl font-bold">{metrics.profiles}</div>
          </div>
        </div>
      )}
    </div>
  );
}
