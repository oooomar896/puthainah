"use client";
import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/Layouts/admin-layout/AdminLayout";
import CustomDataTable from "@/components/shared/datatable/DataTable";
import { useTranslation } from "react-i18next";

export default function Page() {
  const { t } = useTranslation();
  const [table, setTable] = useState("");
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [matchJson, setMatchJson] = useState("");
  const [valuesJson, setValuesJson] = useState("");
  const [id, setId] = useState("");

  const columns = useMemo(() => {
    if (!rows?.length) return [];
    const keys = Object.keys(rows[0] || {});
    return keys.map((k) => ({
      name: k,
      selector: (row) => String(row[k]),
      sortable: true,
    }));
  }, [rows]);

  async function load() {
    setIsLoading(true);
    setMessage("");
    try {
      const params = new URLSearchParams();
      params.set("table", table);
      if (matchJson) params.set("match", matchJson);
      const res = await fetch(`/api/admin-supabase?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) {
        setMessage(json?.error || "Error");
      } else {
        setRows(json?.data || []);
      }
    } catch (e) {
      setMessage(e.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function insert() {
    setIsLoading(true);
    setMessage("");
    try {
      const values = valuesJson ? JSON.parse(valuesJson) : null;
      const res = await fetch(`/api/admin-supabase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table, values }),
      });
      const json = await res.json();
      if (!res.ok) {
        setMessage(json?.error || "Error");
      } else {
        setMessage("Inserted");
        await load();
      }
    } catch (e) {
      setMessage(e.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function update() {
    setIsLoading(true);
    setMessage("");
    try {
      const values = valuesJson ? JSON.parse(valuesJson) : null;
      const match = matchJson ? JSON.parse(matchJson) : null;
      const res = await fetch(`/api/admin-supabase`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table, id: id || null, match, values }),
      });
      const json = await res.json();
      if (!res.ok) {
        setMessage(json?.error || "Error");
      } else {
        setMessage("Updated");
        await load();
      }
    } catch (e) {
      setMessage(e.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function remove() {
    setIsLoading(true);
    setMessage("");
    try {
      const match = matchJson ? JSON.parse(matchJson) : null;
      const res = await fetch(`/api/admin-supabase`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table, id: id || null, match }),
      });
      const json = await res.json();
      if (!res.ok) {
        setMessage(json?.error || "Error");
      } else {
        setMessage("Deleted");
        await load();
      }
    } catch (e) {
      setMessage(e.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    setRows([]);
    setMessage("");
  }, [table]);

  return (
    <AdminLayout>
      <div className="p-4 space-y-4">
        <h1 className="text-lg font-bold">{t("Supabase Explorer")}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm">{t("Table")}</label>
            <input
              className="border rounded px-3 py-2 w-full"
              value={table}
              onChange={(e) => setTable(e.target.value)}
              placeholder="مثال: services"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm">{t("Row Id (optional)")}</label>
            <input
              className="border rounded px-3 py-2 w-full"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="id"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm">{t("Match JSON (filters)")}</label>
            <textarea
              className="border rounded px-3 py-2 w-full h-24"
              value={matchJson}
              onChange={(e) => setMatchJson(e.target.value)}
              placeholder='{"status":"active"}'
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm">{t("Values JSON")}</label>
            <textarea
              className="border rounded px-3 py-2 w-full h-24"
              value={valuesJson}
              onChange={(e) => setValuesJson(e.target.value)}
              placeholder='{"name":"New Service"}'
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="bg-primary text-white px-4 py-2 rounded disabled:opacity-50" disabled={!table || isLoading}>
            {t("Load")}
          </button>
          <button onClick={insert} className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50" disabled={!table || !valuesJson || isLoading}>
            {t("Insert")}
          </button>
          <button onClick={update} className="bg-secondary text-white px-4 py-2 rounded disabled:opacity-50" disabled={!table || !valuesJson || isLoading}>
            {t("Update")}
          </button>
          <button onClick={remove} className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50" disabled={!table || isLoading}>
            {t("Delete")}
          </button>
        </div>
        {message ? <div className="text-sm text-red-600">{message}</div> : null}
        <CustomDataTable
          title={t("Results")}
          data={rows}
          columns={columns}
          isLoading={isLoading}
          searchableFields={columns.map((c) => c.name)}
          pagination={true}
          totalRows={rows?.length || 0}
          defaultPage={1}
          defaultPageSize={30}
        />
      </div>
    </AdminLayout>
  );
}

