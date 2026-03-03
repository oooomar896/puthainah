import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

function loadDotEnvFallback() {
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    console.log("Loading .env from:", envPath);
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        const value = trimmed.slice(eq + 1).trim();
        if (key && !(key in process.env)) {
          process.env[key] = value;
        }
      }
    } else {
        console.log(".env file not found at", envPath);
    }
  } catch (e) {
    console.error("Error loading .env", e);
  }
}

loadDotEnvFallback();

const url =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("URL:", url);
console.log("Service Key Length:", serviceKey ? serviceKey.length : 0);
if (serviceKey) {
    console.log("Service Key Start:", serviceKey.substring(0, 10));
    console.log("Service Key End:", serviceKey.substring(serviceKey.length - 10));
}

if (!url || !serviceKey) {
  console.error("Missing credentials");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function test() {
    console.log("Attempting to list users...");
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) {
        console.error("Error listing users:", error);
    } else {
        console.log("Successfully listed users. Count:", users.length);
    }
}

test();
