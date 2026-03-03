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
const supabase = createClient(url, serviceKey);

async function checkLookups() {
    // Check Request Statuses
    const { data: requestStatus } = await supabase
        .from('lookup_values')
        .select('id, code, name_en')
        .eq('lookup_type_id', 3); 
    
    console.log("Request Statuses:", requestStatus);

    // Check Order Statuses
    const { data: orderStatus } = await supabase
        .from('lookup_values')
        .select('id, code, name_en')
        .eq('lookup_type_id', 4);
        
    console.log("Order Statuses:", orderStatus);
}

checkLookups();