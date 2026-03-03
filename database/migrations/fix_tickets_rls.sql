-- ==============================================================================
-- FIX: TICKETS RLS (Root Cause of Chat Failure)
-- Ensures Admins and Providers can actually SEE the tickets they are trying to chat on.
-- Without this, the nested RLS check in ticket_messages fails silently.
-- ==============================================================================

-- 1. Enable RLS on tickets (if not already)
alter table public.tickets enable row level security;

-- 2. Drop existing policies to prevent conflicts (DROP ALL KNOWN NAMES)
drop policy if exists "Users can view their own tickets" on public.tickets;
drop policy if exists "Admins can view all tickets" on public.tickets;
drop policy if exists "Providers can view related tickets" on public.tickets;
drop policy if exists "Users can create tickets" on public.tickets;
drop policy if exists "Users can update their own tickets" on public.tickets;
drop policy if exists "Users can view relevant tickets" on public.tickets;
drop policy if exists "Users can update relevant tickets" on public.tickets;

-- 3. Define Policies

-- VIEW: Owner + Admin + Related Provider
create policy "Users can view relevant tickets"
on public.tickets for select
using (
  -- Owner
  user_id = auth.uid()
  or
  -- Admin
  public.is_admin()
  or
  -- Related Order Provider
  exists (
    select 1 from public.orders o
    where o.id = tickets.related_order_id
    and o.provider_id in (select id from public.providers where user_id = auth.uid())
  )
);

-- CREATE: Users can create tickets
create policy "Users can create tickets"
on public.tickets for insert
with check (
  -- Can create for themselves
  user_id = auth.uid()
  or
  -- Admins can create for others
  public.is_admin()
);

-- UPDATE: Owner + Admin (Close/Update status)
create policy "Users can update relevant tickets"
on public.tickets for update
using (
  -- Owner
  user_id = auth.uid()
  or
  -- Admin
  public.is_admin()
  or
  -- Related Order Provider (Maybe update status?)
  exists (
    select 1 from public.orders o
    where o.id = tickets.related_order_id
    and o.provider_id in (select id from public.providers where user_id = auth.uid())
  )
);

-- 4. Grant access
grant all on public.tickets to authenticated;
grant all on public.tickets to service_role;
