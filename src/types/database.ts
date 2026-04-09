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

export interface POI {
  id: string;
  destination_id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  lat: number;
  lng: number;
  hero_image_url: string | null;
  rating: number | null;
  website_url: string | null;
  phone: string | null;
  opening_hours: Record<string, string> | null;
  created_at: string;
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
