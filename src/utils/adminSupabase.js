export const adminGet = async (params) => {
  const url = new URL("/api/admin-supabase", typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null) {
      url.searchParams.set(k, typeof v === "object" ? JSON.stringify(v) : String(v));
    }
  });
  const res = await fetch(url.toString(), { method: "GET" });
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const text = await res.text();
    throw new Error(text || "Admin GET error");
  }
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "Admin GET error");
  return json?.data ?? null;
};

export const adminInsert = async ({ table, values }) => {
  const res = await fetch("/api/admin-supabase", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ table, values }),
  });
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const text = await res.text();
    throw new Error(text || "Admin POST error");
  }
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "Admin POST error");
  return json?.data ?? null;
};

export const adminUpdate = async ({ table, id, match, values }) => {
  const res = await fetch("/api/admin-supabase", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ table, id, match, values }),
  });
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const text = await res.text();
    throw new Error(text || "Admin PUT error");
  }
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "Admin PUT error");
  return json?.data ?? null;
};

export const adminDelete = async ({ table, id, match }) => {
  const res = await fetch("/api/admin-supabase", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ table, id, match }),
  });
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const text = await res.text();
    throw new Error(text || "Admin DELETE error");
  }
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "Admin DELETE error");
  return json?.data ?? null;
};
