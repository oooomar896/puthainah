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

async function checkLookups() {
    console.log("Checking lookup_types...");
    const { data: types, error: typesError } = await supabase.from('lookup_types').select('*');
    if (typesError) console.error("Error types:", typesError);
    else console.log("Types:", types);

    console.log("Checking lookup_values...");
    const { data: values, error: valuesError } = await supabase.from('lookup_values').select('*');
    if (valuesError) console.error("Error values:", valuesError);
    else console.log("Values count:", values.length);
    if (values && values.length > 0) {
        console.log("First 5 values:", values.slice(0, 5));
    }
}

checkLookups();
