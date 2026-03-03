const { createClient } = require('@supabase/supabase-js');

const path = require('path');

// Supabase credentials
const supabaseUrl = 'https://tqskjoufozgyactjnrix.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxc2tqb3Vmb3pneWFjdGpucml4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQxMTM0NywiZXhwIjoyMDgxOTg3MzQ3fQ.xRU624hUrN8FTprG-LDYBiRhfLYb1oxDn2JowoX3QtU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);



// Alternative: Apply using direct SQL execution
async function applyMigrationDirect() {
    console.log('🚀 تطبيق Migration مباشرة على Supabase...\n');

    try {
        const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20260101_auto_create_order_on_payment.sql');

        console.log('📝 محتوى Migration SQL جاهز');
        console.log('⚠️  ملاحظة: يجب تطبيق هذا SQL يدوياً في Supabase Dashboard:\n');
        console.log('1. افتح https://tqskjoufozgyactjnrix.supabase.co');
        console.log('2. اذهب إلى SQL Editor');
        console.log('3. انسخ والصق المحتوى من الملف:');
        console.log(`   ${migrationPath}`);
        console.log('4. اضغط RUN\n');

        // Check if tables exist
        const { error } = await supabase
            .from('orders')
            .select('id')
            .limit(1);

        if (error) {
            console.log('⚠️  جدول orders غير موجود أو غير متاح');
        } else {
            console.log('✅ جدول orders موجود');
        }

        // Check requests table
        const { data: requests, error: reqError } = await supabase
            .from('requests')
            .select('id, status_id')
            .eq('status_id', 204)
            .limit(5);

        if (!reqError && requests) {
            console.log(`\n✅ وجدت ${requests.length} طلبات مدفوعة (status_id=204)`);
            console.log('سيتم تحويلها إلى مشاريع بعد تطبيق Migration\n');
        }

    } catch (error) {
        console.error('❌ خطأ:', error.message);
    }
}

// Run migration check
applyMigrationDirect();
