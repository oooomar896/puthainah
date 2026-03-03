-- ==============================================================================
-- AUTO-CREATE PROFILES ON SIGNUP (Fixed for NOT NULL constraints)
-- Automatically creates a 'requester' or 'provider' profile row
-- based on the user's role metadata.
-- ==============================================================================

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
  -- Extract data from metadata
  v_role := (new.raw_user_meta_data->>'role')::text; 
  v_full_name := (new.raw_user_meta_data->>'fullName')::text;
  v_phone := (new.raw_user_meta_data->>'phone')::text;
  v_cr_number := (new.raw_user_meta_data->>'commercialRecord')::text;
  
  -- Handle Entity Type ID (Ensure it's an integer)
  begin
    v_entity_type_id := (new.raw_user_meta_data->>'entityTypeId')::int;
  exception when others then
    v_entity_type_id := null;
  end;

  -- Handle Region ID
  begin
    v_region_id := (new.raw_user_meta_data->>'regionId')::int;
  exception when others then
    v_region_id := null;
  end;
  
  -- Fallback name
  if v_full_name is null then
     v_full_name := (new.raw_user_meta_data->>'name')::text;
  end if;

  -- Default Entity Type (Individual) if missing
  -- Only if strictly required, otherwise rely on metadata being correct
  if v_entity_type_id is null then
     -- Try to find 'individual' id, or hardcode 1/13 depending on your lookup
     -- Ideally, fetches from lookup_values. For now, assume we rely on metadata
     -- or set to a known safe default if you know it (e.g. 1).
     -- Attempt to find "individual" code in lookup_values for requesters
     select id into v_entity_type_id from public.lookup_values where code = 'individual' limit 1;
  end if;
  
  -- Create REQUESTER profile
  if v_role ilike 'Requester' then
    insert into public.requesters (
      user_id, 
      name, 
      entity_type_id, -- Required Field
      city_id,        -- mapped from regionId
      mobile,
      commercial_registeration,
      created_at
    )
    values (
      new.id, 
      coalesce(v_full_name, 'New User'), 
      v_entity_type_id, 
      v_region_id,
      v_phone,
      v_cr_number,
      now()
    )
    on conflict (user_id) do nothing;
    
  -- Create PROVIDER profile
  elsif v_role ilike 'Provider' then
    insert into public.providers (
        user_id, 
        name, 
        entity_type_id, 
        city_id,
        phone,
        commercial_registeration,
        created_at, 
        profile_status_id
    )
    values (
        new.id, 
        coalesce(v_full_name, 'New Provider'), 
        v_entity_type_id, 
        v_region_id,
        v_phone,
        v_cr_number,
        now(), 
        201 -- Active/Pending status
    ) 
    on conflict (user_id) do nothing;
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger: After auth.users insert
drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.handle_new_user_profile();


-- ==============================================================================
-- BACKFILL: Fix existing users (careful with NOT NULLs)
-- ==============================================================================

do $$
declare
  v_default_entity_id int;
begin
  -- Get a default entity type ID (e.g., Individual) to use as fallback
  select id into v_default_entity_id from public.lookup_values where code = 'individual' limit 1;
  
  -- If not found (e.g. empty DB), handle gracefully or set to 1 if you are sure
  if v_default_entity_id is null then
     -- v_default_entity_id := 1; -- Uncomment if you know ID 1 exists
  end if;

  if v_default_entity_id is not null then
      -- Backfill Requesters
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
