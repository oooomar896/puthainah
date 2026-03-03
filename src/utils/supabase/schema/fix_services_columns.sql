alter table public.services add column if not exists price numeric null;
alter table public.services add column if not exists image_url text null;
alter table public.services add column if not exists is_active boolean not null default true;
alter table public.services add column if not exists updated_at timestamptz null;
alter table public.services add column if not exists created_at timestamptz not null default now();
