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
                if (key) {
                    process.env[key] = value;
                }
            }
        }
    } catch {
        // ignore
    }
}

loadDotEnvFallback();

const url =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
    console.error("Missing Supabase URL or Service Role Key in environment.");
    process.exit(1);
}

const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
});

const services = [
    {
        id: '00000000-0000-0000-0000-000000000001',
        name_ar: 'خدمة التنفيذ',
        name_en: 'Implementation Service',
        base_price: 0,
        is_active: true
    },
    {
        id: '00000000-0000-0000-0000-000000000002',
        name_ar: 'خدمة التوريد',
        name_en: 'Supply Service',
        base_price: 0,
        is_active: true
    },
    {
        id: '00000000-0000-0000-0000-000000000003',
        name_ar: 'خدمة الصيانة',
        name_en: 'Maintenance Service',
        base_price: 0,
        is_active: true
    },
    {
        id: '00000000-0000-0000-0000-000000000004',
        name_ar: 'خدمة الاستشارات',
        name_en: 'Consulting Service',
        base_price: 0,
        is_active: true
    },
    {
        id: '00000000-0000-0000-0000-000000000005',
        name_ar: 'خدمة تشخيص ودراسة المشاريع',
        name_en: 'Project Diagnosis and Study',
        base_price: 0,
        is_active: true
    },
    {
        id: '00000000-0000-0000-0000-000000000006',
        name_ar: 'خدمة الإشراف على المشاريع',
        name_en: 'Project Supervision',
        base_price: 0,
        is_active: true
    },
    {
        id: '00000000-0000-0000-0000-000000000007',
        name_ar: 'خدمة التدريب',
        name_en: 'Training Service',
        base_price: 0,
        is_active: true
    },
    {
        id: '00000000-0000-0000-0000-000000000008',
        name_ar: 'خدمة إدارة المشاريع',
        name_en: 'Project Management',
        base_price: 0,
        is_active: true
    }
];

async function main() {
    console.log("Upserting services...");
    const { data, error } = await admin.from('services').upsert(services, { onConflict: 'id' }).select();

    if (error) {
        console.error("Error upserting services:", error);
        process.exit(1);
    }

    console.log(`Successfully upserted ${data.length} services.`);
}

main().catch((e) => {
    console.error(e?.message || e);
    process.exit(1);
});
