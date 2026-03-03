import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"

function loadEnv() {
  try {
    const p = path.resolve(process.cwd(), ".env")
    if (fs.existsSync(p)) {
      const c = fs.readFileSync(p, "utf8")
      for (const line of c.split(/\r?\n/)) {
        const s = line.trim()
        if (!s || s.startsWith("#")) continue
        const i = s.indexOf("=")
        if (i === -1) continue
        const k = s.slice(0, i).trim()
        const v = s.slice(i + 1).trim()
        if (k) process.env[k] = v
      }
    }
  } catch {}
}

loadEnv()

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
if (!url || !key) {
  console.error("Missing Supabase env: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}
const supabase = createClient(url, key)

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

async function getProviders() {
  const { data } = await supabase.from("providers").select("id,name").limit(50)
  return data || []
}

async function getRequestsByStatus(ids) {
  const { data } = await supabase.from("requests").select("id,title,status_id").in("status_id", ids).limit(100)
  return data || []
}

async function orderExists(requestId) {
  const { data } = await supabase.from("orders").select("id").eq("request_id", requestId).limit(1)
  return Array.isArray(data) && data.length > 0
}

async function seed() {
  const providers = await getProviders()
  if (!providers.length) {
    console.error("No providers found")
    process.exit(2)
  }
  const accepted = await getRequestsByStatus([9])
  const priced = await getRequestsByStatus([8])
  const completedReqs = await getRequestsByStatus([11])
  const rejectedReqs = await getRequestsByStatus([10])
  const waitingPaymentReqs = await getRequestsByStatus([21])

  const now = new Date()
  const batch = []

  for (const r of accepted.slice(0, 5)) {
    if (await orderExists(r.id)) continue
    const pv = pick(providers)
    batch.push({
      request_id: r.id,
      provider_id: pv.id,
      order_title: `Waiting Approval Order ${Date.now()}`,
      order_status_id: 17,
      start_date: null,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    })
  }

  for (const r of priced.slice(0, 5)) {
    if (await orderExists(r.id)) continue
    const pv = pick(providers)
    batch.push({
      request_id: r.id,
      provider_id: pv.id,
      order_title: `In Progress Order ${Date.now()}`,
      order_status_id: 13,
      start_date: now.toISOString(),
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    })
  }

  for (const r of completedReqs.slice(0, 5)) {
    if (await orderExists(r.id)) continue
    const pv = pick(providers)
    batch.push({
      request_id: r.id,
      provider_id: pv.id,
      order_title: `Completed Order ${Date.now()}`,
      order_status_id: 15,
      start_date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      completed_at: now.toISOString(),
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    })
  }

  for (const r of rejectedReqs.slice(0, 3)) {
    if (await orderExists(r.id)) continue
    const pv = pick(providers)
    batch.push({
      request_id: r.id,
      provider_id: pv.id,
      order_title: `Rejected Order ${Date.now()}`,
      order_status_id: 19,
      start_date: null,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    })
  }

  for (const r of waitingPaymentReqs.slice(0, 2)) {
    if (await orderExists(r.id)) continue
    const pv = pick(providers)
    batch.push({
      request_id: r.id,
      provider_id: pv.id,
      order_title: `On Hold Order ${Date.now()}`,
      order_status_id: 14,
      start_date: null,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    })
  }

  if (!batch.length) {
    console.log("No new orders to insert")
    process.exit(0)
  }

  const { data, error } = await supabase.from("orders").insert(batch).select("id,order_status_id")
  if (error) {
    console.error("Insert orders error:", error.message || error)
    process.exit(3)
  }
  const counts = {}
  for (const o of data || []) {
    counts[o.order_status_id] = (counts[o.order_status_id] || 0) + 1
  }
  console.log("Inserted orders:", data?.length || 0)
  console.log("Counts by order status:", counts)
}

seed().then(() => process.exit(0)).catch((e) => {
  console.error("Seed failed:", e?.message || e)
  process.exit(4)
})
