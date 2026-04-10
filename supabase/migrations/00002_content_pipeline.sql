-- ============================================
-- 00002 — Content pipeline + itinerary engine
-- ============================================
-- Extends pois with lifecycle / quality / planner attributes,
-- adds drafts, import jobs, and generated trip plans tables.

-- ============================================
-- 1. Extend pois
-- ============================================
alter table public.pois
  add column if not exists duration_minutes integer not null default 60,
  add column if not exists price_level integer not null default 0
    check (price_level between 0 and 4),
  add column if not exists family_friendly boolean not null default true,
  add column if not exists indoor boolean not null default false,
  add column if not exists accessible boolean not null default false,
  add column if not exists featured_score integer not null default 0
    check (featured_score between 0 and 100),
  add column if not exists best_time_of_day text not null default 'any'
    check (best_time_of_day in ('morning','midday','afternoon','evening','night','any')),
  add column if not exists publish_status text not null default 'draft'
    check (publish_status in ('draft','review','published')),
  add column if not exists data_quality_status text not null default 'raw'
    check (data_quality_status in ('raw','enriched','reviewed')),
  add column if not exists short_description text,
  add column if not exists updated_at timestamptz not null default now();

-- Backfill: every existing POI is treated as fully reviewed/published
-- so the live site keeps working after this migration runs.
update public.pois
   set publish_status = 'published',
       data_quality_status = 'reviewed'
 where publish_status = 'draft';

create index if not exists idx_pois_publish_status
  on public.pois(publish_status);

-- Replace the unconditional public read policy with one that only
-- exposes published POIs to anonymous/regular users, and a separate
-- policy that lets admins read everything (drafts + review).
drop policy if exists "POIs are publicly readable" on public.pois;
drop policy if exists "Published POIs are publicly readable" on public.pois;
drop policy if exists "Admins read all POIs" on public.pois;

create policy "Published POIs are publicly readable"
  on public.pois for select
  using (publish_status = 'published');

create policy "Admins read all POIs"
  on public.pois for select
  using (
    exists (
      select 1 from public.users
       where id = auth.uid() and role = 'admin'
    )
  );

-- updated_at trigger
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists pois_touch_updated_at on public.pois;
create trigger pois_touch_updated_at
  before update on public.pois
  for each row execute function public.touch_updated_at();

-- ============================================
-- 2. POI drafts (AI-assisted authoring)
-- ============================================
create table if not exists public.poi_drafts (
  id uuid primary key default uuid_generate_v4(),
  poi_id uuid not null references public.pois(id) on delete cascade,
  field text not null check (field in ('description','short_description')),
  content text not null,
  source text not null default 'ai' check (source in ('ai','human')),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_poi_drafts_poi on public.poi_drafts(poi_id);

alter table public.poi_drafts enable row level security;

create policy "Admins can read drafts"
  on public.poi_drafts for select
  using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));

create policy "Admins can write drafts"
  on public.poi_drafts for all
  using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));

-- ============================================
-- 3. Import jobs
-- ============================================
create table if not exists public.import_jobs (
  id uuid primary key default uuid_generate_v4(),
  created_by uuid not null references public.users(id),
  filename text not null,
  format text not null check (format in ('csv','json')),
  total_rows integer not null default 0,
  imported_rows integer not null default 0,
  failed_rows integer not null default 0,
  status text not null default 'pending'
    check (status in ('pending','previewing','committed','failed')),
  field_mapping jsonb,
  created_at timestamptz not null default now()
);

alter table public.import_jobs enable row level security;

create policy "Admins manage import jobs"
  on public.import_jobs for all
  using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));

create table if not exists public.import_rows (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid not null references public.import_jobs(id) on delete cascade,
  row_index integer not null,
  raw jsonb not null,
  parsed jsonb,
  poi_id uuid references public.pois(id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending','ready','imported','error')),
  error text
);

create index if not exists idx_import_rows_job on public.import_rows(job_id);

alter table public.import_rows enable row level security;

create policy "Admins manage import rows"
  on public.import_rows for all
  using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));

-- ============================================
-- 4. Generated trip plans (planner output)
-- ============================================
create table if not exists public.generated_trip_plans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete set null,
  destination_id uuid references public.destinations(id),
  duration_days integer not null check (duration_days between 1 and 14),
  budget_level integer not null check (budget_level between 0 and 4),
  activity_level text not null check (activity_level in ('low','moderate','high')),
  interests text[] not null default '{}',
  constraints jsonb not null default '{}',
  fit_score integer not null,
  debug jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_generated_trip_plans_user
  on public.generated_trip_plans(user_id);

alter table public.generated_trip_plans enable row level security;

-- Anonymous + signed-in can create plans (planner is public).
create policy "Anyone can create trip plans"
  on public.generated_trip_plans for insert
  with check (true);

-- Users can read their own plans; admins read all.
create policy "Users read own trip plans"
  on public.generated_trip_plans for select
  using (
    user_id is null
    or user_id = auth.uid()
    or exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create table if not exists public.generated_trip_stops (
  id uuid primary key default uuid_generate_v4(),
  plan_id uuid not null references public.generated_trip_plans(id) on delete cascade,
  poi_id uuid not null references public.pois(id) on delete cascade,
  day_number integer not null,
  stop_order integer not null,
  start_time text,
  duration_minutes integer not null,
  unique (plan_id, day_number, stop_order)
);

create index if not exists idx_generated_trip_stops_plan
  on public.generated_trip_stops(plan_id);

alter table public.generated_trip_stops enable row level security;

create policy "Anyone can create trip stops"
  on public.generated_trip_stops for insert
  with check (true);

create policy "Read stops of readable plans"
  on public.generated_trip_stops for select
  using (
    exists (
      select 1 from public.generated_trip_plans p
       where p.id = plan_id
         and (
           p.user_id is null
           or p.user_id = auth.uid()
           or exists (select 1 from public.users where id = auth.uid() and role = 'admin')
         )
    )
  );
