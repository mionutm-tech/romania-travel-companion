# Romania Travel Companion

A modern, mobile-first travel planning platform for Romania. Discover curated POIs, browse destinations on an interactive map, explore editorial itineraries, plan trips, and save your favorites.

## Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Maps**: Mapbox GL JS
- **Icons**: Lucide React

## Setup Guide (start here)

This guide assumes you have never used Supabase, Mapbox, or Next.js
before. Follow each step in order. Every command and field is exact —
copy and paste them.

### What you need before you start

- A computer running macOS, Linux, or Windows
- **Node.js 18 or newer** — install from <https://nodejs.org> (pick the
  "LTS" download). After installing, open a new terminal and run
  `node --version` to confirm it prints something like `v20.10.0`.
- A **free Supabase account** — sign up at <https://supabase.com>
- A **free Mapbox account** — sign up at <https://account.mapbox.com>
- A code editor (optional but recommended): <https://code.visualstudio.com>

### Step 1 — Get the code on your computer

Open a terminal and run:

```bash
git clone <repo-url> romania-travel-companion
cd romania-travel-companion
npm install
```

The `npm install` step takes a minute or two and finishes with a line
like `added 412 packages in 1m`. Warnings are normal; errors are not.

### Step 2 — Create your Supabase project

1. Go to <https://supabase.com/dashboard> and sign in.
2. Click the green **New project** button.
3. Fill in:
   - **Name**: anything, e.g. `romania-travel`
   - **Database Password**: click *Generate a password* and **save it
     somewhere safe** — you cannot see it again.
   - **Region**: pick the one closest to you.
4. Click **Create new project**. Wait about 2 minutes for the green
   "Project is healthy" status.

### Step 3 — Run the database setup

1. In your Supabase project, click **SQL Editor** in the left sidebar.
2. Click **+ New query** in the top right.
3. Open the file `supabase/migrations/00001_initial_schema.sql` from
   this repo in your code editor, **select all**, **copy**, and
   **paste** into the Supabase SQL editor.
4. Click the green **Run** button (or press `Ctrl+Enter` /
   `Cmd+Enter`). You should see **"Success. No rows returned"** in the
   results panel. This creates all tables, security policies, and the
   trigger that will create your user profile when you sign up.
5. Click **+ New query** again.
6. Open `supabase/seed.sql` from this repo, copy all, paste into the
   editor, and click **Run**. Same expected message. This loads 4
   destinations, 23 places, 4 itineraries, and 8 tags.

> **If the seed errors with "duplicate key value":** the database
> already has data. Run this in a new query first, then re-run
> `seed.sql`:
>
> ```sql
> truncate
>   public.itinerary_stops, public.poi_tag_links, public.itineraries,
>   public.pois, public.poi_tags, public.poi_categories, public.destinations
> cascade;
> ```

### Step 4 — Get your Supabase keys

1. In Supabase, click **Project Settings** (the gear icon, bottom-left)
   → **API**.
2. You will copy three values from this page in the next step:
   - **Project URL** (under "Project URL"), looks like
     `https://abcdefghijk.supabase.co`
   - **anon public** key (under "Project API keys"), a long string
     starting with `eyJ...`
   - **service_role** key (also under "Project API keys"), another long
     `eyJ...` string. **This one is sensitive — never share it or
     commit it to git.**

### Step 5 — Get your Mapbox token

1. Go to <https://account.mapbox.com> and sign in.
2. Scroll down to **Access tokens**.
3. Copy the **Default public token** (starts with `pk.`).

### Step 6 — Create your `.env.local` file

In the project root (the `romania-travel-companion` folder), create a
new file named exactly `.env.local` (with the leading dot). Paste the
following and replace each placeholder with the value you copied:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR-SERVICE-ROLE-KEY
NEXT_PUBLIC_MAPBOX_TOKEN=pk.YOUR-MAPBOX-TOKEN
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Save the file. `.env.local` is in `.gitignore`, so it will not be
committed.

### Step 7 — Start the app

In your terminal (still in the project folder), run:

```bash
npm run dev
```

After a few seconds you should see:

```
▲ Next.js 16.x.x
- Local:        http://localhost:3000
✓ Ready in ...
```

Open <http://localhost:3000> in your browser. The homepage should load
with destination cards and hero imagery.

### Step 8 — Create your account and make yourself admin

1. In the running app, click **Sign up** in the top-right header.
2. Fill in your email and a password, then submit.
3. **If Supabase email confirmation is on** (the default): check your
   inbox and click the confirmation link. To skip this for local dev,
   go to Supabase → **Authentication** → **Providers** → **Email** and
   turn off **Confirm email**, then sign up again.
4. Once signed in, go back to Supabase → **SQL Editor** → **+ New
   query** and run this exact line, replacing the email with the one
   you just signed up with:

   ```sql
   update public.users set role = 'admin' where email = 'YOU@EXAMPLE.COM';
   ```

   Expected: `Success. 1 row(s) updated.`
5. Reload <http://localhost:3000>. Your user menu (top-right) now shows
   an **Admin** link, and <http://localhost:3000/admin> is reachable.

### Step 9 — Verification checklist

Click through every item. If all 11 pass, the app is fully runnable.

1. <http://localhost:3000/> — homepage loads with hero and four
   destination cards.
2. <http://localhost:3000/destinations> — four cards: Bucharest, Brașov,
   Sibiu, Cluj-Napoca.
3. <http://localhost:3000/destinations/bucharest> — destination detail
   page with several POIs listed.
4. <http://localhost:3000/map> — Mapbox map renders with **23 colored
   pins** spread across Romania. *(If no pins appear, the seed didn't
   load — re-run Step 3.)*
5. <http://localhost:3000/itineraries> — four itinerary cards.
6. <http://localhost:3000/itineraries/bucharest-in-2-days> — multi-stop
   itinerary detail.
7. <http://localhost:3000/auth/signup> — create an account (or sign in).
8. <http://localhost:3000/saved> — empty state with a "Browse" CTA.
9. From any POI detail page, click the **heart** icon → return to
   /saved → the POI now appears.
10. After Step 8 promotion, <http://localhost:3000/admin> shows: **4
    Destinations, 23 POIs, 4 Itineraries, ≥1 Users**.
11. Open <http://localhost:3000/admin> in a private/incognito window
    (logged out) → you should be redirected to /auth/login.

## Required environment variables (reference)

| Variable | Source | Sensitive? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL | No |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public | No |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role | **Yes** |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | account.mapbox.com → Default public token | No |
| `NEXT_PUBLIC_APP_URL` | Always `http://localhost:3000` for local dev | No |

## Troubleshooting

**Seed fails with "duplicate key value violates unique constraint"**
The database already has rows. Run the `truncate` query from Step 3
above, then re-run `seed.sql`.

**The map page is blank with no pins**
Either (a) the Mapbox token is missing or wrong (check `.env.local`,
restart `npm run dev`), or (b) the seed didn't load (verify the
**POIs** count on /admin is 23).

**`/admin` redirects me to /auth/login even though I'm signed in**
You haven't promoted your account yet. Run the `update public.users
set role = 'admin' …` query from Step 8.

**Signup "succeeds" but no user appears in `public.users`**
Email confirmation is on and you haven't clicked the confirmation
link yet. Check your inbox, or disable confirmation in Supabase →
Authentication → Providers → Email.

**The Supabase project stopped responding after a week**
Free-tier projects auto-pause after 7 days of inactivity. Open the
Supabase dashboard and click **Restore project**.

**`npm install` errors on Windows**
Make sure Node.js 18+ is installed and your terminal is a fresh
window opened *after* the install (so it picks up the new PATH).

## Known limitations

- The trip planner (`/api/planner`) is intentionally public — no
  account required to use it.
- The seed assumes a fresh database; re-running it requires the
  `truncate` step above.
- Free-tier Supabase projects auto-pause after 7 days of inactivity.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/              # Admin dashboard (CRUD)
│   ├── api/                # API routes
│   ├── auth/               # Auth pages (login, signup, callback)
│   ├── destinations/       # Destination listing + detail
│   ├── itineraries/        # Itinerary listing + detail
│   ├── map/                # Interactive discovery map
│   ├── planner/            # Trip planner
│   ├── pois/               # POI detail pages
│   └── saved/              # Saved items (auth-gated)
├── components/
│   ├── auth/               # Auth provider, forms, user menu
│   ├── cards/              # POI, Destination, Itinerary cards
│   ├── layout/             # Header, Footer, Admin sidebar
│   ├── map/                # Mapbox wrapper + markers
│   ├── sections/           # Homepage sections
│   ├── shared/             # Reusable UI (filters, ratings, etc.)
│   └── ui/                 # shadcn/ui primitives
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities, Supabase clients, Mapbox config
└── types/                  # TypeScript type definitions

supabase/
├── migrations/             # SQL schema migration
└── seed.sql                # Seed data (4 destinations, 23 POIs, 4 itineraries)
```

## Database Schema

10 tables with Row Level Security:

- `users` - profiles (auto-created on signup via trigger)
- `destinations` - cities/regions with coordinates
- `poi_categories` - Museums, Food, Nature, Landmarks, Nightlife
- `pois` - points of interest with ratings, hours, images
- `poi_tags` + `poi_tag_links` - flexible tagging system
- `itineraries` - curated multi-day routes
- `itinerary_stops` - ordered stops within itineraries
- `user_saved_pois` + `user_saved_itineraries` - bookmarks

## Seed Data

- **4 destinations**: Bucharest, Brasov, Sibiu, Cluj-Napoca
- **23 POIs** across all categories with real coordinates, descriptions, and ratings
- **4 itineraries** with ordered stops and editorial notes
- **8 tags** for flexible categorization

## Features

- Mobile-first responsive design
- SEO-friendly slugs and metadata on all pages
- Interactive Mapbox map with category-colored markers
- Category filtering on map and destination pages
- Save POIs and itineraries (authenticated users)
- Trip planner with interest/destination selection
- Admin dashboard with CRUD for all content
- Loading skeletons and empty states
- Supabase Auth with email/password

## License

MIT
