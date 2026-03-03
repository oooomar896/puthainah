// Script to run migration on Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tqskjoufozgyactjnrix.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxc2tqb3Vmb3pneWFjdGpucml4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQxMTM0NywiZXhwIjoyMDgxOTg3MzQ3fQ.xRU624hUrN8FTprG-LDYBiRhfLYb1oxDn2JowoX3QtU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
    try {
        console.log('🚀 Starting migration...\n');

        // Test connection first
        const { error: testError } = await supabase
            .from('users')
            .select('count')
            .limit(1);

        if (testError) {
            console.error('❌ Connection test failed:', testError.message);
            return;
        }
        console.log('✅ Connected to Supabase\n');

        // Since we can't run DDL via the client, let's just verify the current schema
        console.log('📋 Checking current requests table structure...\n');

        const { data: requestsData, error: requestsError } = await supabase
            .from('requests')
            .select('*')
            .limit(1);

        if (requestsError) {
            console.log('❌ Error accessing requests table:', requestsError.message);
        } else {
            console.log('✅ Requests table exists');
            if (requestsData && requestsData.length > 0) {
                console.log('   Columns found:', Object.keys(requestsData[0]).join(', '));
            }
        }

        // Check if project_messages table exists
        const { error: messagesError } = await supabase
            .from('project_messages')
            .select('*')
            .limit(1);

        if (messagesError && messagesError.code === '42P01') {
            console.log('⚠️  project_messages table does not exist - needs to be created');
        } else if (messagesError) {
            console.log('⚠️  project_messages:', messagesError.message);
        } else {
            console.log('✅ project_messages table exists');
        }

        // Check if project_deliverables table exists
        const { error: deliverablesError } = await supabase
            .from('project_deliverables')
            .select('*')
            .limit(1);

        if (deliverablesError && deliverablesError.code === '42P01') {
            console.log('⚠️  project_deliverables table does not exist - needs to be created');
        } else if (deliverablesError) {
            console.log('⚠️  project_deliverables:', deliverablesError.message);
        } else {
            console.log('✅ project_deliverables table exists');
        }

        console.log('\n📝 Note: To apply the full migration, please run the SQL in Supabase Dashboard:');
        console.log('   1. Go to https://supabase.com/dashboard/project/tqskjoufozgyactjnrix');
        console.log('   2. Click on "SQL Editor"');
        console.log('   3. Paste the contents of: supabase/migrations/20260101_complete_workflow.sql');
        console.log('   4. Click "Run"');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    }
}

runMigration();
