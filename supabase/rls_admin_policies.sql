create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and lower(u.role) = 'admin'
  );
$$;

create policy "admin insert users" on public.users for insert with check (public.is_admin());
create policy "admin insert providers" on public.providers for insert with check (public.is_admin());
create policy "admin insert requesters" on public.requesters for insert with check (public.is_admin());
create policy "admin insert admins" on public.admins for insert with check (public.is_admin());
create policy "admin insert requests" on public.requests for insert with check (public.is_admin());
create policy "admin insert orders" on public.orders for insert with check (public.is_admin());
create policy "admin insert lookup_types" on public.lookup_types for insert with check (public.is_admin());
create policy "admin insert lookup_values" on public.lookup_values for insert with check (public.is_admin());
create policy "admin insert cities" on public.cities for insert with check (public.is_admin());
create policy "admin insert services" on public.services for insert with check (public.is_admin());
create policy "admin insert project_messages" on public.project_messages for insert with check (public.is_admin());
create policy "admin insert project_deliverables" on public.project_deliverables for insert with check (public.is_admin());
create policy "admin insert status_history" on public.status_history for insert with check (public.is_admin());
create policy "admin insert partners" on public.partners for insert with check (public.is_admin());
create policy "admin insert customers" on public.customers for insert with check (public.is_admin());
create policy "admin insert faq_questions" on public.faq_questions for insert with check (public.is_admin());
create policy "admin insert tickets" on public.tickets for insert with check (public.is_admin());
create policy "admin insert order_ratings" on public.order_ratings for insert with check (public.is_admin());

-- Admin UPDATE policies for operational actions
create policy "admin update users" on public.users for update using (public.is_admin()) with check (public.is_admin());
create policy "admin update providers" on public.providers for update using (public.is_admin()) with check (public.is_admin());
create policy "admin update requesters" on public.requesters for update using (public.is_admin()) with check (public.is_admin());
create policy "admin update admins" on public.admins for update using (public.is_admin()) with check (public.is_admin());
create policy "admin update requests" on public.requests for update using (public.is_admin()) with check (public.is_admin());
create policy "admin update orders" on public.orders for update using (public.is_admin()) with check (public.is_admin());
create policy "admin update project_messages" on public.project_messages for update using (public.is_admin()) with check (public.is_admin());
create policy "admin update project_deliverables" on public.project_deliverables for update using (public.is_admin()) with check (public.is_admin());
