-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================
-- USERS (public profiles mirroring auth.users)
-- ============================================
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.users enable row level security;
create policy "Users can view own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);
create policy "Public read for users" on public.users for select using (true);

-- ============================================
-- DESTINATIONS
-- ============================================
create table public.destinations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  hero_image_url text,
  lat double precision not null,
  lng double precision not null,
  created_at timestamptz not null default now()
);

alter table public.destinations enable row level security;
create policy "Destinations are publicly readable" on public.destinations for select using (true);
create policy "Admins can insert destinations" on public.destinations for insert with check (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);
create policy "Admins can update destinations" on public.destinations for update using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);
create policy "Admins can delete destinations" on public.destinations for delete using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- ============================================
-- POI CATEGORIES
-- ============================================
create table public.poi_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  icon text
);

alter table public.poi_categories enable row level security;
create policy "Categories are publicly readable" on public.poi_categories for select using (true);
create policy "Admins can manage categories" on public.poi_categories for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- ============================================
-- POIS
-- ============================================
create table public.pois (
  id uuid primary key default uuid_generate_v4(),
  destination_id uuid not null references public.destinations(id) on delete cascade,
  category_id uuid not null references public.poi_categories(id) on delete restrict,
  name text not null,
  slug text not null unique,
  description text,
  address text,
  lat double precision not null,
  lng double precision not null,
  hero_image_url text,
  rating numeric(2,1) check (rating >= 0 and rating <= 5),
  website_url text,
  phone text,
  opening_hours jsonb,
  created_at timestamptz not null default now()
);

create index idx_pois_destination on public.pois(destination_id);
create index idx_pois_category on public.pois(category_id);
create index idx_pois_slug on public.pois(slug);

alter table public.pois enable row level security;
create policy "POIs are publicly readable" on public.pois for select using (true);
create policy "Admins can insert POIs" on public.pois for insert with check (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);
create policy "Admins can update POIs" on public.pois for update using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);
create policy "Admins can delete POIs" on public.pois for delete using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- ============================================
-- POI TAGS
-- ============================================
create table public.poi_tags (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique
);

alter table public.poi_tags enable row level security;
create policy "Tags are publicly readable" on public.poi_tags for select using (true);

create table public.poi_tag_links (
  poi_id uuid not null references public.pois(id) on delete cascade,
  tag_id uuid not null references public.poi_tags(id) on delete cascade,
  primary key (poi_id, tag_id)
);

alter table public.poi_tag_links enable row level security;
create policy "Tag links are publicly readable" on public.poi_tag_links for select using (true);
create policy "Admins can manage tag links" on public.poi_tag_links for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- ============================================
-- ITINERARIES
-- ============================================
create table public.itineraries (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text not null unique,
  description text,
  hero_image_url text,
  duration_days integer not null default 1,
  difficulty text not null default 'easy' check (difficulty in ('easy', 'moderate', 'challenging')),
  created_at timestamptz not null default now()
);

alter table public.itineraries enable row level security;
create policy "Itineraries are publicly readable" on public.itineraries for select using (true);
create policy "Admins can insert itineraries" on public.itineraries for insert with check (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);
create policy "Admins can update itineraries" on public.itineraries for update using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);
create policy "Admins can delete itineraries" on public.itineraries for delete using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

create table public.itinerary_stops (
  id uuid primary key default uuid_generate_v4(),
  itinerary_id uuid not null references public.itineraries(id) on delete cascade,
  poi_id uuid not null references public.pois(id) on delete cascade,
  stop_order integer not null,
  notes text,
  duration_minutes integer default 60,
  unique (itinerary_id, stop_order)
);

create index idx_itinerary_stops_itinerary on public.itinerary_stops(itinerary_id);

alter table public.itinerary_stops enable row level security;
create policy "Stops are publicly readable" on public.itinerary_stops for select using (true);
create policy "Admins can manage stops" on public.itinerary_stops for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- ============================================
-- USER SAVED ITEMS
-- ============================================
create table public.user_saved_pois (
  user_id uuid not null references public.users(id) on delete cascade,
  poi_id uuid not null references public.pois(id) on delete cascade,
  saved_at timestamptz not null default now(),
  primary key (user_id, poi_id)
);

alter table public.user_saved_pois enable row level security;
create policy "Users can view own saved POIs" on public.user_saved_pois for select using (auth.uid() = user_id);
create policy "Users can save POIs" on public.user_saved_pois for insert with check (auth.uid() = user_id);
create policy "Users can unsave POIs" on public.user_saved_pois for delete using (auth.uid() = user_id);

create table public.user_saved_itineraries (
  user_id uuid not null references public.users(id) on delete cascade,
  itinerary_id uuid not null references public.itineraries(id) on delete cascade,
  saved_at timestamptz not null default now(),
  primary key (user_id, itinerary_id)
);

alter table public.user_saved_itineraries enable row level security;
create policy "Users can view own saved itineraries" on public.user_saved_itineraries for select using (auth.uid() = user_id);
create policy "Users can save itineraries" on public.user_saved_itineraries for insert with check (auth.uid() = user_id);
create policy "Users can unsave itineraries" on public.user_saved_itineraries for delete using (auth.uid() = user_id);
