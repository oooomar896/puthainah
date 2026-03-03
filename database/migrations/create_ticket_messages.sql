-- ==============================================================================
-- CREATE TICKET MESSAGES TABLE (Fixed)
-- Re-creates table with correct FK to public.users for PostgREST joins
-- ==============================================================================

-- 1. Drop existing to reset
drop table if exists public.ticket_messages;

-- 2. Create Table
create table public.ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  -- Must reference public.users so Frontend can join on it
  sender_id uuid not null references public.users(id) on delete cascade, 
  message text not null,
  created_at timestamptz default now(),
  
  -- Constraints
  constraint message_length check (char_length(message) > 0)
);

-- 3. Indexes
create index idx_ticket_messages_ticket_id on public.ticket_messages(ticket_id);
create index idx_ticket_messages_created_at on public.ticket_messages(created_at);

-- 4. RLS Policies
alter table public.ticket_messages enable row level security;

-- VIEW: Users can view messages for tickets they own, or Admins
create policy "Users can view messages for their tickets"
on public.ticket_messages for select
using (
  exists (
    select 1 from public.tickets t
    where t.id = ticket_messages.ticket_id
    and t.user_id = auth.uid()
  )
  or
  public.is_admin()
);

-- INSERT: Users can send messages to their tickets, or Admins
create policy "Users can send messages to their tickets"
on public.ticket_messages for insert
with check (
  exists (
    select 1 from public.tickets t
    where t.id = ticket_messages.ticket_id
    and t.user_id = auth.uid()
  )
  or
  public.is_admin()
);

-- 5. Grant Permissions
grant all on public.ticket_messages to authenticated;
