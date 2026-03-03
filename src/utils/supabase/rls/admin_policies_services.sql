alter table services enable row level security;
create policy services_read_all on services for select using (true);
create policy services_insert_admin on services for insert with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'Admin'));
create policy services_update_admin on services for update using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'Admin')) with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'Admin'));
create policy services_delete_admin on services for delete using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'Admin'));
