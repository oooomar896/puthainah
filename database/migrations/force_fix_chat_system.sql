-- ==============================================================================
-- FORCE FIX: CHAT SYSTEM (Consolidated & Robust)
-- This script fixes Tickets RLS, Ticket Messages RLS, and Admin Check in one go.
-- Run this ONCE to resolve 403 Errors.
-- ==============================================================================

-- 1. FIX ADMIN CHECK
create or replace function public.is_admin()
returns boolean as $$
declare
  is_admin_table boolean;
  is_admin_meta boolean;
begin
  -- Check 'admins' table
  select exists (
    select 1 from public.admins 
    where user_id = auth.uid()
  ) into is_admin_table;
  
  -- Check Metadata
  select lower(coalesce(raw_user_meta_data->>'role', '')) = 'admin' 
  into is_admin_meta
  from auth.users
  where id = auth.uid();

  return is_admin_table or coalesce(is_admin_meta, false);
end;
$$ language plpgsql security definer;

-- 2. RESET TICKETS RLS
alter table public.tickets enable row level security;

-- Drop all known policies on tickets
drop policy if exists "Users can view relevant tickets" on public.tickets;
drop policy if exists "Users can view their own tickets" on public.tickets;
drop policy if exists "Admins can view all tickets" on public.tickets;
drop policy if exists "Providers can view related tickets" on public.tickets;
drop policy if exists "Users can create tickets" on public.tickets;
drop policy if exists "Users can update relevant tickets" on public.tickets;
drop policy if exists "Users can update their own tickets" on public.tickets;

-- Re-create Tickets Policies
create policy "Users can view relevant tickets"
on public.tickets for select
using (
  user_id = auth.uid() -- Owner
  or public.is_admin() -- Admin
  or exists ( -- Related Provider
    select 1 from public.orders o
    where o.id = tickets.related_order_id
    and o.provider_id in (select id from public.providers where user_id = auth.uid())
  )
);

create policy "Users can create tickets"
on public.tickets for insert
with check (
  user_id = auth.uid() or public.is_admin()
);

create policy "Users can update relevant tickets"
on public.tickets for update
using (
  user_id = auth.uid() or public.is_admin()
);

-- 3. RESET TICKET MESSAGES RLS
alter table public.ticket_messages enable row level security;

-- Drop all known policies on ticket_messages
drop policy if exists "Users can view messages for their tickets" on public.ticket_messages;
drop policy if exists "Users can send messages to their tickets" on public.ticket_messages;
drop policy if exists "Admins can view all messages" on public.ticket_messages;

-- Re-create Ticket Messages Policies
create policy "Users can view messages for their tickets"
on public.ticket_messages for select
using (
  exists (
    select 1 from public.tickets t
    where t.id = ticket_messages.ticket_id
    -- Note: We rely on the tickets policy to filter visibility? 
    -- NO, RLS in `exists` subquery bypasses RLS of target table usually, BUT
    -- simplicity: just check ownership/relation logic again directly
    and (
       t.user_id = auth.uid()
       or public.is_admin()
       or exists (
          select 1 from public.orders o 
          where o.id = t.related_order_id 
          and o.provider_id in (select id from public.providers where user_id = auth.uid())
       )
    )
  )
);

create policy "Users can send messages to their tickets"
on public.ticket_messages for insert
with check (
  -- Allow if user is related to the ticket
  exists (
    select 1 from public.tickets t
    where t.id = ticket_messages.ticket_id
    and (
       t.user_id = auth.uid()
       or public.is_admin()
       or exists (
          select 1 from public.orders o 
          where o.id = t.related_order_id 
          and o.provider_id in (select id from public.providers where user_id = auth.uid())
       )
    )
  )
);

-- 4. GRANT PERMISSIONS
grant all on public.tickets to authenticated;
grant all on public.ticket_messages to authenticated;
grant all on public.tickets to service_role;
grant all on public.ticket_messages to service_role;

-- 5. ENSURE TICKET MESSAGES TABLE EXISTS (Just in case)
create table if not exists public.ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade,
  message text not null,
  created_at timestamptz default now()
);
