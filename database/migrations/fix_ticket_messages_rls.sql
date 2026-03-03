-- ==============================================================================
-- FIX: TICKET MESSAGES RLS
-- Allows Order Providers to view/reply to tickets related to their orders
-- ==============================================================================

-- 1. Drop existing policies to ensure clean state
drop policy if exists "Users can view messages for their tickets" on public.ticket_messages;
drop policy if exists "Users can send messages to their tickets" on public.ticket_messages;

-- 2. Create Expanded VIEW Policy
create policy "Users can view messages for their tickets"
on public.ticket_messages for select
using (
  -- Ticket Owner
  exists (
    select 1 from public.tickets t
    where t.id = ticket_messages.ticket_id
    and t.user_id = auth.uid()
  )
  or
  -- Related Order Provider (Access to tickets linked to their orders)
  exists (
    select 1 from public.tickets t
    join public.orders o on o.id = t.related_order_id
    where t.id = ticket_messages.ticket_id
    and o.provider_id in (select id from public.providers where user_id = auth.uid())
  )
  or
  -- Admins
  public.is_admin()
);

-- 3. Create Expanded INSERT Policy
create policy "Users can send messages to their tickets"
on public.ticket_messages for insert
with check (
  -- Ticket Owner
  exists (
    select 1 from public.tickets t
    where t.id = ticket_messages.ticket_id
    and t.user_id = auth.uid()
  )
  or
  -- Related Order Provider
  exists (
    select 1 from public.tickets t
    join public.orders o on o.id = t.related_order_id
    where t.id = ticket_messages.ticket_id
    and o.provider_id in (select id from public.providers where user_id = auth.uid())
  )
  or
  -- Admins
  public.is_admin()
);
