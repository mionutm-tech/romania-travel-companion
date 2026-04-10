export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  role: "user" | "admin";
  created_at: string;
}

export interface Destination {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  hero_image_url: string | null;
  lat: number;
  lng: number;
  created_at: string;
}

export interface POICategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

export type PublishStatus = "draft" | "review" | "published";
export type DataQualityStatus = "raw" | "enriched" | "reviewed";
export type BestTimeOfDay =
  | "morning"
  | "midday"
  | "afternoon"
  | "evening"
  | "night"
  | "any";

export interface POI {
  id: string;
  destination_id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  address: string | null;
  lat: number;
  lng: number;
  hero_image_url: string | null;
  rating: number | null;
  website_url: string | null;
  phone: string | null;
  opening_hours: Record<string, string> | null;
  duration_minutes: number;
  price_level: number; // 0..4
  family_friendly: boolean;
  indoor: boolean;
  accessible: boolean;
  featured_score: number; // 0..100
  best_time_of_day: BestTimeOfDay;
  publish_status: PublishStatus;
  data_quality_status: DataQualityStatus;
  created_at: string;
  updated_at: string;
}

export interface POITag {
  id: string;
  name: string;
  slug: string;
}

export interface POITagLink {
  poi_id: string;
  tag_id: string;
}

export interface Itinerary {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  hero_image_url: string | null;
  duration_days: number;
  difficulty: "easy" | "moderate" | "challenging";
  created_at: string;
}

export interface ItineraryStop {
  id: string;
  itinerary_id: string;
  poi_id: string;
  stop_order: number;
  notes: string | null;
  duration_minutes: number;
}

export interface UserSavedPOI {
  user_id: string;
  poi_id: string;
  saved_at: string;
}

export interface UserSavedItinerary {
  user_id: string;
  itinerary_id: string;
  saved_at: string;
}

// Joined types for queries
export interface POIWithRelations extends POI {
  category: POICategory;
  destination: Destination;
  tags?: POITag[];
}

export interface ItineraryWithStops extends Itinerary {
  stops: (ItineraryStop & { poi: POIWithRelations })[];
}

export interface DestinationWithCount extends Destination {
  poi_count: number;
}

// ============================================
// Planner / scoring
// ============================================

export type ActivityLevel = "low" | "moderate" | "high";

export interface PlannerConstraints {
  family_friendly?: boolean;
  indoor_only?: boolean;
  accessible?: boolean;
  avoid_categories?: string[]; // category slugs
}

export interface PlannerRequest {
  destination_id?: string;
  duration_days: number; // 1..14
  budget_level: number; // 0..4
  activity_level: ActivityLevel;
  interests: string[]; // category slugs
  constraints: PlannerConstraints;
}

export interface ScoreBreakdown {
  interest_match: number; // 0-25
  destination_match: number; // 0-20
  category_match: number; // 0-10
  budget_fit: number; // 0-10
  duration_fit: number; // 0-10
  constraint_fit: number; // 0-10
  featured_score: number; // 0-5
  rating: number; // 0-5
  total: number; // 0-95
  reasons: string[];
}

export interface PlannerStop {
  poi: POIWithRelations;
  day_number: number;
  stop_order: number;
  start_time: string; // "HH:MM"
  duration_minutes: number;
  score: ScoreBreakdown;
}

export interface PlannerDaySummary {
  day: number;
  total_minutes: number;
  total_km: number;
}

export interface PlannerDebug {
  candidates_considered: number;
  candidates_after_filter: number;
  rejected_for_constraint: { poi_id: string; reason: string }[];
  day_summaries: PlannerDaySummary[];
}

export interface PlannerResult {
  stops: PlannerStop[];
  fit_score: number; // 0..100
  debug: PlannerDebug;
}

// ============================================
// Imports
// ============================================

export type ImportFormat = "csv" | "json";
export type ImportJobStatus =
  | "pending"
  | "previewing"
  | "committed"
  | "failed";
export type ImportRowStatus = "pending" | "ready" | "imported" | "error";

export interface ImportJob {
  id: string;
  created_by: string;
  filename: string;
  format: ImportFormat;
  total_rows: number;
  imported_rows: number;
  failed_rows: number;
  status: ImportJobStatus;
  field_mapping: Record<string, string> | null;
  created_at: string;
}

export interface ImportRow {
  id: string;
  job_id: string;
  row_index: number;
  raw: Record<string, unknown>;
  parsed: Record<string, unknown> | null;
  poi_id: string | null;
  status: ImportRowStatus;
  error: string | null;
}

// ============================================
// POI drafts
// ============================================

export type DraftField = "description" | "short_description" | "ai_bundle";
export type DraftStatus = "pending" | "approved" | "rejected";

export interface POIDraft {
  id: string;
  poi_id: string;
  field: DraftField;
  content: string;
  source: "ai" | "human";
  status: DraftStatus;
  created_by: string | null;
  created_at: string;
}
