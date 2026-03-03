
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const PLATFORM_SERVICES = [
  { name_ar: 'خدمة تنفيذ', name_en: 'Execution Service' },
  { name_ar: 'خدمة توريد', name_en: 'Supply Service' },
  { name_ar: 'عقود صيانه', name_en: 'Maintenance Contracts' },
  { name_ar: 'إستشارة', name_en: 'Consultation' },
  { name_ar: 'دراسة مشاريع', name_en: 'Project Study' },
  { name_ar: 'إشراف مشاريع', name_en: 'Project Supervision' },
  { name_ar: 'تدريب', name_en: 'Training' },
  { name_ar: 'إدارة مشاريع', name_en: 'Project Management' },
];

async function debug() {
  try {
    const { data: services, error } = await supabase
      .from('services')
      .select('id, name_ar, name_en, base_price');

    if (error) {
      console.error('Error:', error);
    } else {
      const outPath = path.join(__dirname, 'services_dump.json');
      fs.writeFileSync(outPath, JSON.stringify(services || [], null, 2), 'utf-8');
      console.log(`Wrote ${Array.isArray(services) ? services.length : 0} rows to services_dump.json`);
    }

  } catch (e) {
    console.error('CRITICAL ERROR:', e);
  }
}

async function reset() {
  try {
    const rows = PLATFORM_SERVICES.map(s => ({
      name_ar: s.name_ar,
      name_en: s.name_en,
      base_price: 0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabase.from('services').insert(rows);
    if (error) {
      console.error('Reset error:', error.message);
      return;
    }
    await supabase
      .from('services')
      .update({ is_active: false })
      .not('name_ar', 'in', `(${PLATFORM_SERVICES.map(s => `'${s.name_ar}'`).join(',')})`);
    await supabase
      .from('services')
      .update({ is_active: false })
      .in('name_ar', PLATFORM_SERVICES.map(s => s.name_ar))
      .is('base_price', null);
    console.log('Services reset to platform list successfully.');
    await debug();
  } catch (e) {
    console.error('CRITICAL RESET ERROR:', e);
  }
}

reset();
