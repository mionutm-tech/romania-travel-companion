# Romania Travel Companion

A modern, mobile-first travel planning platform for Romania. Discover curated POIs, browse destinations on an interactive map, explore editorial itineraries, plan trips, and save your favorites.

## Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Maps**: Mapbox GL JS
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Mapbox](https://mapbox.com) account (free tier works)

### 1. Clone and install

```bash
git clone <repo-url>
cd romania-travel-companion
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in your keys:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox public access token |
| `NEXT_PUBLIC_APP_URL` | App URL (default: `http://localhost:3000`) |

### 3. Database setup

Run the migration in your Supabase SQL editor (or via CLI):

```bash
# Option A: Supabase CLI
npx supabase db push

# Option B: Copy-paste into Supabase SQL Editor
# 1. Run supabase/migrations/00001_initial_schema.sql
# 2. Run supabase/seed.sql
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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
