-- ==============================================================================
-- SECURE DASHBOARD DATA (RLS) - FACTORY RESET
-- Drops ALL existing policies first to ensure data privacy
-- ==============================================================================

-- 1. Helper function for Admin check
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
-- CLEANUP: DROP ALL EXISTING POLICIES TO PREVENT CONFLICTS
-- ==============================================================================
do $$
begin
  -- Requesters
  drop policy if exists "Requesters can view own profile" on public.requesters;
  drop policy if exists "Requesters can update own profile" on public.requesters;
  drop policy if exists "Admins can view all requesters" on public.requesters;
  drop policy if exists "Everyone can view requesters" on public.requesters;
  drop policy if exists "Service role can manage requesters" on public.requesters;
  
  -- Providers
  drop policy if exists "Providers can view own profile" on public.providers;
  drop policy if exists "Providers can update own profile" on public.providers;
  drop policy if exists "Everyone can view providers" on public.providers;
  drop policy if exists "Admins can manage providers" on public.providers;
  
  -- Requests
  drop policy if exists "Requesters can view own requests" on public.requests;
  drop policy if exists "Requesters can create requests" on public.requests;
  drop policy if exists "Requesters can update own requests" on public.requests;
  drop policy if exists "Providers can view assigned requests" on public.requests;
  drop policy if exists "Providers can update assigned requests" on public.requests;
  drop policy if exists "Admins can manage requests" on public.requests;
  drop policy if exists "Everyone can view requests" on public.requests;
  
  -- Orders
  drop policy if exists "Users can view related orders" on public.orders;
  drop policy if exists "Admins can manage orders" on public.orders;
  
  -- Project Messages
  drop policy if exists "Users can view messages for their orders" on public.project_messages;
  drop policy if exists "Users can send messages for their orders" on public.project_messages;
end $$;


-- ==============================================================================
-- APPLY STRICT RLS POLICIES
-- ==============================================================================

-- --------------------------------------------------------
-- TABLE: REQUESTERS
-- --------------------------------------------------------
alter table public.requesters enable row level security;

create policy "Requesters can view own profile"
on public.requesters for select
using ( auth.uid() = user_id );

create policy "Requesters can update own profile"
on public.requesters for update
using ( auth.uid() = user_id );

create policy "Admins can view all requesters"
on public.requesters for all
using ( public.is_admin() );

-- --------------------------------------------------------
-- TABLE: PROVIDERS
-- --------------------------------------------------------
alter table public.providers enable row level security;

create policy "Providers can view own profile"
on public.providers for select
using ( auth.uid() = user_id );

create policy "Providers can update own profile"
on public.providers for update
using ( auth.uid() = user_id );

-- Public view needed for provider listings? If so, restricted 'select'
create policy "Everyone can view providers"
on public.providers for select
using ( true );

create policy "Admins can manage providers"
on public.providers for all
using ( public.is_admin() );

-- --------------------------------------------------------
-- TABLE: REQUESTS (Source of the leak)
-- --------------------------------------------------------
alter table public.requests enable row level security;

-- VIEW: Only see if you are the requester OR the assigned provider OR the invited provider
create policy "Users can view their own requests"
on public.requests for select
using (
  requester_id in (select id from public.requesters where user_id = auth.uid()) -- Owner
  or
  assigned_provider_id in (select id from public.providers where user_id = auth.uid()) -- Assignee
  or
  provider_id in (select id from public.providers where user_id = auth.uid()) -- Invitee
  or
  public.is_admin() -- Admin
);

-- CREATE: Only requesters can create
create policy "Requesters can create requests"
on public.requests for insert
with check (
  requester_id in (select id from public.requesters where user_id = auth.uid())
  or public.is_admin()
);

-- UPDATE: Owners and Assignees can update (status/response)
create policy "Users can update their own requests"
on public.requests for update
using (
  requester_id in (select id from public.requesters where user_id = auth.uid())
  or
  assigned_provider_id in (select id from public.providers where user_id = auth.uid())
  or
  provider_id in (select id from public.providers where user_id = auth.uid())
  or
  public.is_admin()
);

-- DELETE: Only admins or owner (if pending)
create policy "Users can delete their own requests"
on public.requests for delete
using (
  (requester_id in (select id from public.requesters where user_id = auth.uid()) and status_id in (1, 17)) -- Only if pending/new
  or
  public.is_admin()
);

-- --------------------------------------------------------
-- TABLE: ORDERS
-- --------------------------------------------------------
alter table public.orders enable row level security;

create policy "Users can view related orders"
on public.orders for select
using (
  exists (
    select 1 from public.requests r
    join public.requesters req on r.requester_id = req.id
    where r.id = orders.request_id
    and req.user_id = auth.uid()
  )
  or
  provider_id in (select id from public.providers where user_id = auth.uid())
  or
  public.is_admin()
);

-- --------------------------------------------------------
-- TABLE: PROJECT MESSAGES
-- --------------------------------------------------------
alter table public.project_messages enable row level security;

create policy "Users can view messages for their orders"
on public.project_messages for select
using (
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

-- Grant access (ensure no 403s)
grant usage on schema public to authenticated;
grant all on all tables in schema public to authenticated;
grant all on all sequences in schema public to authenticated;
