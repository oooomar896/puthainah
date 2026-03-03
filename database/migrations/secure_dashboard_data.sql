-- ==============================================================================
-- SECURE DASHBOARD DATA (RLS)
-- Restricts access so users only see their own data
-- ==============================================================================

-- 1. Helper function to check if user is admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.admins 
    where user_id = auth.uid()
  );
end;
$$ language plpgsql security definer;

-- ==============================================================================
-- TABLE: REQUESTERS
-- ==============================================================================
alter table public.requesters enable row level security;

create policy "Requesters can view own profile"
on public.requesters for select
using ( auth.uid() = user_id );

create policy "Requesters can update own profile"
on public.requesters for update
using ( auth.uid() = user_id );

-- Admins can view all
create policy "Admins can view all requesters"
on public.requesters for all
using ( public.is_admin() );

-- ==============================================================================
-- TABLE: PROVIDERS
-- ==============================================================================
alter table public.providers enable row level security;

create policy "Providers can view own profile"
on public.providers for select
using ( auth.uid() = user_id );

create policy "Providers can update own profile"
on public.providers for update
using ( auth.uid() = user_id );

-- Public/Requesters need to see basic provider info (usually)
-- Modifying this to allow 'select' for authenticated users might be needed 
-- if you have a "Find Providers" page.
create policy "Everyone can view providers"
on public.providers for select
using ( true );

-- Admins can manage all
create policy "Admins can manage providers"
on public.providers for all
using ( public.is_admin() );

-- ==============================================================================
-- TABLE: REQUESTS (Main Orders Table)
-- ==============================================================================
alter table public.requests enable row level security;

-- Policy: Requesters can view their own requests
create policy "Requesters can view own requests"
on public.requests for select
using (
  requester_id in (
    select id from public.requesters where user_id = auth.uid()
  )
);

-- Policy: Requesters can create requests
create policy "Requesters can create requests"
on public.requests for insert
with check (
  requester_id in (
    select id from public.requesters where user_id = auth.uid()
  )
);

-- Policy: Requesters can update own requests (e.g. cancel, accept price)
create policy "Requesters can update own requests"
on public.requests for update
using (
  requester_id in (
    select id from public.requesters where user_id = auth.uid()
  )
);

-- Policy: Providers can view assigned requests or invitations
create policy "Providers can view assigned requests"
on public.requests for select
using (
  assigned_provider_id in (
    select id from public.providers where user_id = auth.uid()
  )
  or
  provider_id in ( -- If used for direct assignment
    select id from public.providers where user_id = auth.uid()
  )
);

-- Policy: Providers can update requests assigned to them (e.g. submit work, accept invite)
create policy "Providers can update assigned requests"
on public.requests for update
using (
  assigned_provider_id in (
    select id from public.providers where user_id = auth.uid()
  )
  or
  provider_id in (
    select id from public.providers where user_id = auth.uid()
  )
);

-- Policy: Admins can do anything
create policy "Admins can manage requests"
on public.requests for all
using ( public.is_admin() );

-- ==============================================================================
-- TABLE: ORDERS (If separate from requests)
-- ==============================================================================
-- Some parts of the code use 'orders' table. 
-- Assuming 'orders' links to 'requests' or directly to users.
alter table public.orders enable row level security;

create policy "Users can view related orders"
on public.orders for select
using (
  -- As Requester
  exists (
    select 1 from public.requests r
    join public.requesters req on r.requester_id = req.id
    where r.id = orders.request_id
    and req.user_id = auth.uid()
  )
  or
  -- As Provider
  provider_id in (
    select id from public.providers where user_id = auth.uid()
  )
  or
  -- As Admin
  public.is_admin()
);

-- ==============================================================================
-- TABLE: PROJECT MESSAGES
-- ==============================================================================
alter table public.project_messages enable row level security;

create policy "Users can view messages for their orders"
on public.project_messages for select
using (
  -- Check if user is part of the order related to this message
  exists (
    select 1 from public.orders o
    left join public.requests r on o.request_id = r.id
    left join public.requesters req on r.requester_id = req.id
    left join public.providers prov on o.provider_id = prov.id
    where o.id = project_messages.order_id
    and (req.user_id = auth.uid() or prov.user_id = auth.uid())
  )
  or public.is_admin()
);

create policy "Users can send messages for their orders"
on public.project_messages for insert
with check (
  exists (
    select 1 from public.orders o
    left join public.requests r on o.request_id = r.id
    left join public.requesters req on r.requester_id = req.id
    left join public.providers prov on o.provider_id = prov.id
    where o.id = order_id
    and (req.user_id = auth.uid() or prov.user_id = auth.uid())
  )
);

-- ==============================================================================
-- GRANT PERMISSIONS (Fix for 403 Errors)
-- ==============================================================================
grant usage on schema public to authenticated;
grant all on all tables in schema public to authenticated;
grant all on all sequences in schema public to authenticated;
grant all on all functions in schema public to authenticated;

