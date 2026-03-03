// Quick test to check env loading
import { readFileSync } from 'fs';

// Load .env
function loadEnv() {
    try {
        const envFile = readFileSync('.env', 'utf8');
        envFile.split('\n').forEach(line => {
            line = line.trim();
            if (line && !line.startsWith('#')) {
                const [key, ...valueParts] = line.split('=');
                const value = valueParts.join('=').trim();
                if (key && value) {
                    process.env[key.trim()] = value;
                }
            }
        });
    } catch {
        console.log('Error loading .env');
    }
}

loadEnv();

console.log('\n🔍 Environment Variables Check:');
console.log('─'.repeat(50));
console.log('ZOHO_SMTP_USER:', process.env.ZOHO_SMTP_USER);
console.log('ZOHO_SMTP_PASS:', process.env.ZOHO_SMTP_PASS ? '***' + process.env.ZOHO_SMTP_PASS.slice(-4) : 'NOT SET');
console.log('ZOHO_SMTP_HOST:', process.env.ZOHO_SMTP_HOST);
console.log('ZOHO_SMTP_PORT:', process.env.ZOHO_SMTP_PORT);
console.log('─'.repeat(50));
console.log('\n✅ If you see values above, .env is loading correctly');
console.log('');
