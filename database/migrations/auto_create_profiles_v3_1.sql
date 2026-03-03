-- ==============================================================================
-- AUTO-CREATE PROFILES ON SIGNUP (v3.1 - Fixed Syntax)
-- 1. Syncs auth.users -> public.users (Critical Step)
-- 2. Creates 'requester' or 'provider' profile linked to public.users
-- ==============================================================================

-- -------------------------------------------------------------------------
-- PART 1: Ensure public.users exists for a new user
-- -------------------------------------------------------------------------
create or replace function public.handle_new_user_core()
returns trigger as $$
begin
  -- Insert into public.users if not exists
  insert into public.users (id, email, name, role, created_at)
  values (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data->>'fullName', new.raw_user_meta_data->>'name', 'User'),
    coalesce(new.raw_user_meta_data->>'role', 'Requester'), -- Default role
    now()
  )
  on conflict (id) do update
  set 
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role;
    
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for public.users sync
drop trigger if exists on_auth_user_created_core on auth.users;
create trigger on_auth_user_created_core
  after insert on auth.users
  for each row execute function public.handle_new_user_core();


-- -------------------------------------------------------------------------
-- PART 2: Auto-Create Specific Profiles (Requester/Provider)
-- -------------------------------------------------------------------------
create or replace function public.handle_new_user_profile()
returns trigger as $$
declare
  v_role text;
  v_full_name text;
  v_entity_type_id int;
  v_region_id int;
  v_phone text;
  v_cr_number text;
begin
  -- Data extraction
  v_role := (new.raw_user_meta_data->>'role')::text; 
  v_full_name := (new.raw_user_meta_data->>'fullName')::text;
  v_phone := (new.raw_user_meta_data->>'phone')::text;
  v_cr_number := (new.raw_user_meta_data->>'commercialRecord')::text;
  
  -- Handle IDs safely
  begin v_entity_type_id := (new.raw_user_meta_data->>'entityTypeId')::int; exception when others then v_entity_type_id := null; end;
  begin v_region_id := (new.raw_user_meta_data->>'regionId')::int; exception when others then v_region_id := null; end;
  
  if v_full_name is null then 
    v_full_name := (new.raw_user_meta_data->>'name')::text;
  end if;

  -- Default Entity Type (Individual) fallback
  if v_entity_type_id is null then
     select id into v_entity_type_id from public.lookup_values where code = 'individual' limit 1;
  end if;

  -- Ensure public.users record exists (Double Check)
  if not exists (select 1 from public.users where id = new.id) then
    insert into public.users (id, email, name, role, created_at)
    values (new.id, new.email, coalesce(v_full_name, 'New User'), v_role, now());
  end if;
  
  -- Create REQUESTER profile
  if v_role ilike 'Requester' then
    insert into public.requesters (user_id, name, entity_type_id, city_id, mobile, commercial_registeration, created_at)
    values (new.id, coalesce(v_full_name, 'New User'), v_entity_type_id, v_region_id, v_phone, v_cr_number, now())
    on conflict (user_id) do nothing;
    
  -- Create PROVIDER profile
  elsif v_role ilike 'Provider' then
    insert into public.providers (user_id, name, entity_type_id, city_id, phone, commercial_registeration, created_at, profile_status_id)
    values (new.id, coalesce(v_full_name, 'New Provider'), v_entity_type_id, v_region_id, v_phone, v_cr_number, now(), 201) 
    on conflict (user_id) do nothing;
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger: Profile Creation (runs AFTER the core sync)
drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.handle_new_user_profile();


-- ==============================================================================
-- PART 3: REPAIR & BACKFILL (Fix broken state)
-- ==============================================================================
do $$
declare
  v_default_entity_id int;
begin
  -- 1. Backfill public.users (Fix the Foreign Key issue first)
  insert into public.users (id, email, name, role, created_at)
  select 
    id, 
    email, 
    coalesce(raw_user_meta_data->>'fullName', raw_user_meta_data->>'name', 'User'),
    coalesce(raw_user_meta_data->>'role', 'Requester'),
    created_at
  from auth.users
  where not exists (select 1 from public.users where id = auth.users.id);

  -- 2. Get default entity ID
  select id into v_default_entity_id from public.lookup_values where code = 'individual' limit 1;

  -- 3. Backfill Requesters (Now safe to run)
  if v_default_entity_id is not null then
      insert into public.requesters (user_id, name, entity_type_id)
      select 
        id, 
        coalesce(raw_user_meta_data->>'fullName', raw_user_meta_data->>'name', 'User'),
        coalesce((raw_user_meta_data->>'entityTypeId')::int, v_default_entity_id)
      from auth.users
      where (raw_user_meta_data->>'role')::text ilike 'Requester'
      and not exists (select 1 from public.requesters where user_id = auth.users.id);

      -- Backfill Providers
      insert into public.providers (user_id, name, entity_type_id, profile_status_id)
      select 
        id, 
        coalesce(raw_user_meta_data->>'fullName', raw_user_meta_data->>'name', 'Provider'),
        coalesce((raw_user_meta_data->>'entityTypeId')::int, v_default_entity_id),
        201
      from auth.users
      where (raw_user_meta_data->>'role')::text ilike 'Provider'
      and not exists (select 1 from public.providers where user_id = auth.users.id);
  end if;
end $$;
