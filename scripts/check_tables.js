
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');


function parseEnv(filePath) {
    if (!fs.existsSync(filePath)) return {};
    const content = fs.readFileSync(filePath, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
        let trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        if (trimmed.includes(' #')) trimmed = trimmed.split(' #')[0].trim();
        if (trimmed.includes('=')) {
            const parts = trimmed.split('=');
            const key = parts[0].trim();
            let val = parts.slice(1).join('=').trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                val = val.slice(1, -1);
            }
            env[key] = val;
        }
    });
    return env;
}

const env = { ...parseEnv('.env'), ...parseEnv('.env.local') };
const url = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY;

const client = createClient(url, key);

async function check() {
    console.log('Checking tables...');

    // Try to query common tables to see which ones exist
    const tables = ['lookup_values', 'request_statuses', 'orders', 'projects', 'attachments', 'attachment_groups'];

    for (const t of tables) {
        const { error } = await client.from(t).select('count', { count: 'exact', head: true }).limit(1);
        if (error) {
            console.log(`Table ${t}: MISSING or ERROR (${error.message})`);
        } else {
            console.log(`Table ${t}: EXISTS`);
        }
    }
}

check();
