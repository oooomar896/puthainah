-- ==============================================================================
-- ENABLE UPDATE ON ORDERS (Fix Provider Acceptance Issue)
-- Allows Providers and Requesters to update their own orders (e.g. Status)
-- ==============================================================================

-- 1. Create UPDATE Policy for Orders
create policy "Users can update their own orders"
on public.orders for update
using (
  -- Requester of the associated request
  exists (
    select 1 from public.requests r
    join public.requesters req on r.requester_id = req.id
    where r.id = orders.request_id
    and req.user_id = auth.uid()
  )
  or
  -- Assigned Provider
  provider_id in (select id from public.providers where user_id = auth.uid())
  or
  -- Admin
  public.is_admin()
)
with check (
  -- Requester of the associated request
  exists (
    select 1 from public.requests r
    join public.requesters req on r.requester_id = req.id
    where r.id = orders.request_id
    and req.user_id = auth.uid()
  )
  or
  -- Assigned Provider
  provider_id in (select id from public.providers where user_id = auth.uid())
  or
  -- Admin
  public.is_admin()
);
