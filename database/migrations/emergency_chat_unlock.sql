-- ==============================================================================
-- EMERGENCY CHAT UNLOCK
-- Temporarily relaxes RLS to allow ANY authenticated user to use the chat.
-- This bypasses complex Admin/Provider checks causing 403 errors.
-- ==============================================================================

-- 1. UNLOCK TICKETS
alter table public.tickets enable row level security;

-- Drop all existing restrictive policies
drop policy if exists "Users can view relevant tickets" on public.tickets;
drop policy if exists "Users can view their own tickets" on public.tickets;
drop policy if exists "Admins can view all tickets" on public.tickets;
drop policy if exists "Providers can view related tickets" on public.tickets;
drop policy if exists "Users can create tickets" on public.tickets;
drop policy if exists "Users can update relevant tickets" on public.tickets;
drop policy if exists "Users can update their own tickets" on public.tickets;

-- Apply PERMISSIVE Policy (Authenticated users can access all tickets)
create policy "Allow all authenticated to access tickets"
on public.tickets
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');


-- 2. UNLOCK TICKET MESSAGES
alter table public.ticket_messages enable row level security;

-- Drop all existing restrictive policies
drop policy if exists "Users can view messages for their tickets" on public.ticket_messages;
drop policy if exists "Users can send messages to their tickets" on public.ticket_messages;
drop policy if exists "Admins can view all messages" on public.ticket_messages;

-- Apply PERMISSIVE Policy (Authenticated users can access all messages)
create policy "Allow all authenticated to access messages"
on public.ticket_messages
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');


-- 3. GRANT PERMISSIONS
grant all on public.tickets to authenticated;
grant all on public.ticket_messages to authenticated;
grant all on public.tickets to service_role;
grant all on public.ticket_messages to service_role;

-- 4. Ensure Sequences are accessible (for ID generation if serial)
grant usage, select on all sequences in schema public to authenticated;
