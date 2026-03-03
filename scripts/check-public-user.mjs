import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

function loadDotEnvFallback() {
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        const value = trimmed.slice(eq + 1).trim();
        if (key) process.env[key] = value;
      }
    }
  } catch {}
}

loadDotEnvFallback();

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing credentials");
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function checkUser() {
    const email = "oooomar11223300@gmail.com";
    console.log(`Checking public.users for ${email}...`);
    const { data, error } = await supabase.from('users').select('*').eq('email', email);
    
    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Found:", data);
    }
}

checkUser();
