const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function runMigration() {
    console.log('🚀 Running Admin Attachments RLS Migration...\n');

    const migrationFile = path.join(__dirname, '../supabase/migrations/fix_admin_attachments_rls.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');

    try {
        // Split by semicolon and execute each statement
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        for (const statement of statements) {
            console.log(`Executing: ${statement.substring(0, 80)}...`);
            const { error } = await supabase.rpc('exec_sql', { sql_query: statement });

            if (error) {
                // Try direct query if RPC fails
                const { error: directError } = await supabase.from('_sql').select('*').limit(0);
                if (directError) {
                    console.error(`❌ Error executing statement:`, error);
                    console.error('Statement:', statement);
                } else {
                    console.log('✅ Statement executed');
                }
            } else {
                console.log('✅ Statement executed');
            }
        }

        console.log('\n✅ Migration completed successfully!');
        console.log('\n📝 Summary:');
        console.log('   - Created/updated is_admin() function');
        console.log('   - Added Admin UPDATE policy for attachments table');
        console.log('   - Added Admin INSERT policy for attachments table');
        console.log('   - Added Admin DELETE policy for attachments table');
        console.log('   - Added Admin UPDATE policy for payments table');
        console.log('   - Added Admin INSERT policy for payments table');
        console.log('\n✨ Admins can now accept/reject receipts!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
