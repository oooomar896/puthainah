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

async function testInsert() {
    const userId = crypto.randomUUID();
    const email = `test-provider-${Date.now()}@example.com`;
    console.log(`Testing manual insert for user ${userId} / ${email}`);

    // Insert into users
    const { error: userError } = await supabase.from('users').insert({
        id: userId,
        email: email,
        role: 'Provider',
        password_hash: 'dummy' // it's nullable now but let's provide it or not
    });

    if (userError) {
        console.error("Error inserting user:", userError);
        return;
    }
    console.log("User inserted.");

    // Find entity type
    const { data: values, error: lookupError } = await supabase.from('lookup_values')
        .select('id')
        .eq('lookup_type_id', 2) // provider-entity-types
        .limit(1);
    
    if (lookupError || !values || values.length === 0) {
        console.error("Could not find provider entity type", lookupError);
        return;
    }
    const entityTypeId = values[0].id;
    console.log("Using entity type id:", entityTypeId);

    // Insert into providers
    const { error: providerError } = await supabase.from('providers').insert({
        user_id: userId,
        name: "Test Provider",
        entity_type_id: entityTypeId
    });

    if (providerError) {
        console.error("Error inserting provider:", providerError);
    } else {
        console.log("Provider inserted successfully.");
    }
}

testInsert();
