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

async function getIds() {
  const { data: requesters } = await supabase.from("requesters").select("id").limit(5)
  const { data: services } = await supabase.from("services").select("id,name_en").limit(10)
  const { data: cities } = await supabase.from("cities").select("id,name_en").limit(10)
  return {
    requesterIds: (requesters || []).map(r => r.id),
    serviceIds: (services || []).map(s => s.id),
    cityIds: (cities || []).map(c => c.id),
  }
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

async function seedRequests() {
  const ids = await getIds()
  if (!ids.requesterIds.length || !ids.serviceIds.length || !ids.cityIds.length) {
    console.error("Missing base data: requesters/services/cities must exist")
    process.exit(2)
  }
  const statuses = [
    { id: 7, label: "Pending" },
    { id: 8, label: "Priced" },
    { id: 9, label: "Accepted" },
    { id: 21, label: "Waiting Payment" },
    { id: 10, label: "Rejected" },
    { id: 11, label: "Completed" },
  ]
  const now = new Date().toISOString()
  const batch = []
  for (const st of statuses) {
    for (let i = 0; i < 5; i++) {
      const rid = pick(ids.requesterIds)
      const sid = pick(ids.serviceIds)
      const cid = pick(ids.cityIds)
      batch.push({
        requester_id: rid,
        service_id: sid,
        city_id: cid,
        title: `${st.label} Demo Request ${Date.now()}-${st.id}-${i}`,
        description: `Demo ${st.label} request seeded for testing`,
        status_id: st.id,
        created_at: now,
        updated_at: now,
      })
    }
  }
  const { data, error } = await supabase.from("requests").insert(batch).select("id,title,status_id")
  if (error) {
    console.error("Seed error:", error.message || error)
    process.exit(3)
  }
  console.log("Inserted requests:", data?.length || 0)
  const byStatus = {}
  for (const r of data || []) {
    byStatus[r.status_id] = (byStatus[r.status_id] || 0) + 1
  }
  console.log("Counts by status:", byStatus)
}

seedRequests().then(() => process.exit(0)).catch((e) => {
  console.error("Seed failed:", e?.message || e)
  process.exit(4)
})
