export const ROMANIA_CENTER: [number, number] = [24.9668, 45.9432];
export const DEFAULT_ZOOM = 6.5;

export const CATEGORY_ICONS: Record<string, string> = {
  "museums-culture": "Landmark",
  "food-drink": "UtensilsCrossed",
  "nature-outdoors": "Trees",
  landmarks: "Castle",
  nightlife: "Wine",
};

export const CATEGORY_COLORS: Record<string, string> = {
  "museums-culture": "#c4956a",
  "food-drink": "#b85c38",
  "nature-outdoors": "#8fa88a",
  landmarks: "#1a2f23",
  nightlife: "#7c3aed",
};

export const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Easy",
  moderate: "Moderate",
  challenging: "Challenging",
};

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/destinations", label: "Destinations" },
  { href: "/map", label: "Map" },
  { href: "/itineraries", label: "Itineraries" },
  { href: "/planner", label: "Trip Planner" },
] as const;
