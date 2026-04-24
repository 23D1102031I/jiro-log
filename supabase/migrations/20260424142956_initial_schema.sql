-- Users (Profiles)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now()
);

-- Stores
create table public.stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  lat double precision not null,
  lng double precision not null,
  region text not null,
  business_hours jsonb,
  tags jsonb default '[]',
  rules jsonb default '{}',
  sns_url text,
  closed_days text,
  created_at timestamptz not null default now()
);

-- Reviews
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  store_id uuid references public.stores(id) on delete cascade not null,
  rating numeric(2,1) not null check (rating >= 1.0 and rating <= 5.0),
  call_garlic text default '標準' check (call_garlic in ('抜き', '少なめ', '標準', 'マシ', 'マシマシ')),
  call_yasai text default '標準' check (call_yasai in ('抜き', '少なめ', '標準', 'マシ', 'マシマシ')),
  call_abura text default '標準' check (call_abura in ('抜き', '少なめ', '標準', 'マシ', 'マシマシ')),
  call_karame text default '標準' check (call_karame in ('抜き', '少なめ', '標準', 'マシ', 'マシマシ')),
  thickness_score smallint check (thickness_score between 1 and 5),
  dero_score smallint check (dero_score between 1 and 5),
  vegetable_score smallint check (vegetable_score between 1 and 5),
  noodle_score smallint check (noodle_score between 1 and 5),
  pork_score smallint check (pork_score between 1 and 5),
  emulsification_score smallint check (emulsification_score between 1 and 5),
  comment text,
  images text[] default '{}',
  created_at timestamptz not null default now()
);

-- Titles master
create table public.titles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  condition_type text not null check (condition_type in ('count', 'area', 'all')),
  condition_value jsonb not null
);

-- User titles (achieved)
create table public.user_titles (
  user_id uuid references public.users(id) on delete cascade,
  title_id uuid references public.titles(id) on delete cascade,
  achieved_at timestamptz not null default now(),
  primary key (user_id, title_id)
);

-- RLS
alter table public.users enable row level security;
alter table public.stores enable row level security;
alter table public.reviews enable row level security;
alter table public.titles enable row level security;
alter table public.user_titles enable row level security;

-- users policies
create policy "Public read" on public.users for select using (true);
create policy "Self insert" on public.users for insert with check (auth.uid() = id);
create policy "Self update" on public.users for update using (auth.uid() = id);

-- stores policies
create policy "Public read" on public.stores for select using (true);
create policy "Admin insert" on public.stores for insert with check (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);
create policy "Admin update" on public.stores for update using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- reviews policies
create policy "Public read" on public.reviews for select using (true);
create policy "Auth insert" on public.reviews for insert with check (auth.uid() = user_id);
create policy "Owner update" on public.reviews for update using (auth.uid() = user_id);
create policy "Owner delete" on public.reviews for delete using (auth.uid() = user_id);

-- titles policies
create policy "Public read" on public.titles for select using (true);

-- user_titles policies
create policy "Public read" on public.user_titles for select using (true);
create policy "Self insert" on public.user_titles for insert with check (auth.uid() = user_id);

-- Trigger: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Initial titles data
insert into public.titles (name, description, condition_type, condition_value) values
  ('助手見習い', '初めての一杯を記録した', 'count', '{"min": 1}'),
  ('常連の域', '10杯を記録した', 'count', '{"min": 10}'),
  ('ジロリアン', '25杯を記録した', 'count', '{"min": 25}'),
  ('ロットの支配者', '50杯を記録した', 'count', '{"min": 50}'),
  ('山手線の主', '23区内の全店舗を制覇した', 'area', '{"region": "23区"}'),
  ('直系マスター', '全直系店舗を完食制覇した', 'all', '{}');
