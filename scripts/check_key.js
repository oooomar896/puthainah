
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

console.log('Testing with Key:');
console.log('Prefix:', key.substring(0, 15));
console.log('Suffix:', key.substring(key.length - 15));

const client = createClient(url, key);
client.storage.listBuckets().then(({ data, error }) => {
    if (error) console.error('Error:', error.message);
    else console.log('Buckets:', data.map(b => b.name));
});
