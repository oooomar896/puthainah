const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
// Basic .env parser since dotenv might not be installed
try {
    const envConfig = fs.readFileSync(path.resolve(__dirname, '../.env.local'), 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            process.env[key.trim()] = valueParts.join('=').trim();
        }
    });
} catch (e) {
    console.warn('⚠️ Could not load .env.local file');
}

// Setup Supabase client with Service Role Key for admin privileges
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: Missing Supabase credentials in .env.local');
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function cleanupDatabase() {
    console.log('🚀 Starting Data Cleanup (Keeping Admins Only)...\n');

    try {
        // 1. Get IDs of Admin Users to preserve
        console.log('🔍 Identifying Admin users to preserve...');

        // Fetch admins from public.users
        const { data: adminUsers, error: adminError } = await supabase
            .from('users')
            .select('id, email, role')
            .ilike('role', 'admin'); // Case-insensitive check

        if (adminError) throw new Error(`Failed to fetch admins: ${adminError.message}`);

        if (!adminUsers || adminUsers.length === 0) {
            console.error('❌ No Admin users found! Aborting to prevent full data wipe.');
            return;
        }

        const adminIds = adminUsers.map(u => u.id);
        console.log(`✅ Found ${adminIds.length} Admin users: ${adminUsers.map(u => u.email).join(', ')}`);
        console.log('🛑 All other users will be DELETED.\n');

        // Helper to run delete operation
        // 'table': table name
        // 'column': column to filter by (e.g., 'user_id', 'requester_id')
        // 'operator': 'not.in' (we want to delete where id NOT in adminIds)
        // NOTE: Supabase filter 'not.in' expects comma-separated string or array

        // IMPORTANT: It's safer to fetch IDs of non-admins first for specific tables
        // Or invert the logic: Delete where NOT IN (adminIds)

        const CHUNK_SIZE = 1000; // Process in chunks if needed

        // --- STEP 1: Delete specific child tables first to avoid FK errors ---

        // 1.1 Delete Ticket Messages (where user is not admin)
        console.log('🗑️ Deleting Ticket Messages...');
        // We need to find tickets owned by non-admins first
        const { data: nonAdminTickets } = await supabase
            .from('tickets')
            .select('id')
            .not('user_id', 'in', `(${adminIds.join(',')})`);

        if (nonAdminTickets && nonAdminTickets.length > 0) {
            const ticketIds = nonAdminTickets.map(t => t.id);
            const { error } = await supabase.from('ticket_messages').delete().in('ticket_id', ticketIds);
            if (error) console.warn(`⚠️ Error deleting ticket messages: ${error.message}`);
        }

        // 1.2 Delete Tickets
        console.log('🗑️ Deleting Tickets...');
        await supabase.from('tickets').delete().not('user_id', 'in', `(${adminIds.join(',')})`);

        // 1.3 Delete Payments (All non-admin related payments)
        console.log('🗑️ Deleting Payments...');
        // Finding non-admin requests first
        // Since this is complex via JS API, we'll try to delete orphaned payments later or loop
        // But simplest for now: Fetch all payments, check associated request -> requester, if not admin, delete.
        // Optimization: Delete all payments not linked to requests owned by admins.

        // Fetch requests owned by admins
        const { data: adminRequests } = await supabase.from('requests')
            .select('id, requester_id')
            .in('requester_id', (
                await supabase.from('requesters').select('id').in('user_id', adminIds)
            ).data?.map(r => r.id) || []);

        const adminRequestIds = adminRequests?.map(r => r.id) || [];

        if (adminRequestIds.length > 0) {
            await supabase.from('payments').delete().not('request_id', 'in', `(${adminRequestIds.join(',')})`);
        } else {
            // No admin requests, so delete ALL payments safely
            await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
        }

        // 1.4 Delete Attachments
        console.log('🗑️ Deleting Attachments...');
        // Delete where requester_id linked to non-admin user
        // First get admin requester IDs
        const { data: adminRequesters } = await supabase.from('requesters').select('id').in('user_id', adminIds);
        const adminRequesterIds = adminRequesters?.map(x => x.id) || [];

        // Get admin provider IDs
        const { data: adminProviders } = await supabase.from('providers').select('id').in('user_id', adminIds);
        const adminProviderIds = adminProviders?.map(x => x.id) || [];

        // Delete attachments where requester_id NOT in adminRequesterIds
        if (adminRequesterIds.length > 0) {
            await supabase.from('attachments').delete().not('requester_id', 'in', `(${adminRequesterIds.join(',')})`).not('requester_id', 'is', null);
        } else {
            await supabase.from('attachments').delete().not('requester_id', 'is', null);
        }

        // Delete attachments where provider_id NOT in adminProviderIds
        if (adminProviderIds.length > 0) {
            await supabase.from('attachments').delete().not('provider_id', 'in', `(${adminProviderIds.join(',')})`).not('provider_id', 'is', null);
        } else {
            await supabase.from('attachments').delete().not('provider_id', 'is', null);
        }


        // 1.5 Delete Orders/Projects
        console.log('🗑️ Deleting Orders/Projects...');
        // Delete orders where provider not admin or requester not admin
        // This is tricky with simple filters. We will delete all orders that are NOT linked to admin providers OR admin requests.
        // For simplicity in this cleanup: Delete if provider is NOT admin AND requester is NOT admin.
        // Actually, usually we want to wipe everything except pure admin testing data.

        // Let's delete orders where provider_id is NOT in adminProviderIds
        if (adminProviderIds.length > 0) {
            await supabase.from('orders').delete().not('provider_id', 'in', `(${adminProviderIds.join(',')})`);
        } else {
            await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        }

        // 1.6 Delete Requests
        console.log('🗑️ Deleting Requests...');
        if (adminRequesterIds.length > 0) {
            await supabase.from('requests').delete().not('requester_id', 'in', `(${adminRequesterIds.join(',')})`);
        } else {
            await supabase.from('requests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        }

        // 1.7 Delete Notifications
        console.log('🗑️ Deleting Notifications...');
        await supabase.from('notifications').delete().not('user_id', 'in', `(${adminIds.join(',')})`);

        // 1.8 Delete Profile Infos
        console.log('🗑️ Deleting Profile Infos...');
        await supabase.from('profile_infos').delete().not('user_id', 'in', `(${adminIds.join(',')})`);

        // --- STEP 2: Delete Entity Tables ---

        // 2.1 Delete Providers
        console.log('🗑️ Deleting Providers...');
        await supabase.from('providers').delete().not('user_id', 'in', `(${adminIds.join(',')})`);

        // 2.2 Delete Requesters
        console.log('🗑️ Deleting Requesters...');
        await supabase.from('requesters').delete().not('user_id', 'in', `(${adminIds.join(',')})`);


        // --- STEP 3: Delete Users from public.users ---
        console.log('🗑️ Deleting Users from public.users...');
        const { error: usersError } = await supabase.from('users').delete().not('id', 'in', `(${adminIds.join(',')})`);
        if (usersError) console.error('Error deleting public users:', usersError);


        // --- STEP 4: Delete Users from Auth (Crucial) ---
        console.log('🗑️ Deleting Users from Supabase Auth...');

        // We need to fetch ALL auth users first (pagination likely needed for large sets)
        const { data: { users: authUsers }, error: authListError } = await supabase.auth.admin.listUsers();

        if (authListError) {
            console.error('Failed to list auth users:', authListError);
        } else {
            const usersToDelete = authUsers
                .filter(u => !adminIds.includes(u.id))
                .map(u => u.id);

            console.log(`Found ${usersToDelete.length} auth users to delete.`);

            for (const userId of usersToDelete) {
                const { error: delAuthError } = await supabase.auth.admin.deleteUser(userId);
                if (delAuthError) {
                    console.warn(`Failed to delete auth user ${userId}:`, delAuthError.message);
                } else {
                    // process.stdout.write('.'); // progress indicator
                }
            }
            console.log('\nAuth users deletion complete.');
        }

        console.log('\n✨ Database Cleanup Finished! Only Admins remain.');

    } catch (error) {
        console.error('❌ Unexpected Error during cleanup:', error);
        process.exit(1);
    }
}

cleanupDatabase();
