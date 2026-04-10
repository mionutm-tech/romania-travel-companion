// Pure scoring function for POIs against a planner request.
// No I/O. Deterministic. Tested in src/lib/__tests__/scoring.test.ts.

import type {
  POIWithRelations,
  PlannerRequest,
  ScoreBreakdown,
} from "@/types/database";

const ACTIVITY_DURATION_MIN: Record<string, [number, number]> = {
  // preferred per-stop duration window for each activity level
  low: [60, 180],
  moderate: [45, 150],
  high: [30, 120],
};

export function scorePoi(
  poi: POIWithRelations,
  req: PlannerRequest
): ScoreBreakdown {
  const reasons: string[] = [];

  // ---- interest_match (0..25) ----
  // POI category slug appears in user's interests list.
  let interest_match = 0;
  if (req.interests.length === 0) {
    interest_match = 12; // neutral when user picks no interests
  } else if (req.interests.includes(poi.category.slug)) {
    interest_match = 25;
    reasons.push(`Matches interest "${poi.category.name}"`);
  } else {
    interest_match = 0;
  }

  // ---- destination_match (0..20) ----
  let destination_match = 0;
  if (!req.destination_id) {
    destination_match = 10;
  } else if (poi.destination_id === req.destination_id) {
    destination_match = 20;
    reasons.push(`In selected destination ${poi.destination.name}`);
  } else {
    destination_match = 0;
  }

  // ---- category_match (0..10) ----
  // soft bonus when POI category is not avoided
  const avoid = req.constraints.avoid_categories ?? [];
  const category_match = avoid.includes(poi.category.slug) ? 0 : 10;

  // ---- budget_fit (0..10) ----
  // closer the POI's price_level is to budget, higher the score
  const priceDelta = Math.abs(poi.price_level - req.budget_level);
  const budget_fit = Math.max(0, 10 - priceDelta * 3);
  if (priceDelta === 0) reasons.push("Matches budget exactly");

  // ---- duration_fit (0..10) ----
  const [minDur, maxDur] = ACTIVITY_DURATION_MIN[req.activity_level] ?? [
    45, 150,
  ];
  let duration_fit: number;
  if (poi.duration_minutes >= minDur && poi.duration_minutes <= maxDur) {
    duration_fit = 10;
  } else {
    const overshoot =
      poi.duration_minutes < minDur
        ? minDur - poi.duration_minutes
        : poi.duration_minutes - maxDur;
    duration_fit = Math.max(0, 10 - Math.floor(overshoot / 15));
  }

  // ---- constraint_fit (0..10) ----
  let constraint_fit = 10;
  const c = req.constraints;
  if (c.family_friendly && !poi.family_friendly) {
    constraint_fit -= 10;
  }
  if (c.indoor_only && !poi.indoor) {
    constraint_fit -= 5;
  }
  if (c.accessible && !poi.accessible) {
    constraint_fit -= 10;
  }
  constraint_fit = Math.max(0, constraint_fit);

  // ---- featured_score (0..5) ----
  const featured_score = Math.round((poi.featured_score / 100) * 5);
  if (poi.featured_score >= 80) reasons.push("Editorially featured");

  // ---- rating (0..5) ----
  const rating = poi.rating ?? 0;
  if (rating >= 4.5) reasons.push("Highly rated");

  const total =
    interest_match +
    destination_match +
    category_match +
    budget_fit +
    duration_fit +
    constraint_fit +
    featured_score +
    rating;

  return {
    interest_match,
    destination_match,
    category_match,
    budget_fit,
    duration_fit,
    constraint_fit,
    featured_score,
    rating,
    total,
    reasons,
  };
}

export function stopsPerDay(activity_level: PlannerRequest["activity_level"]) {
  switch (activity_level) {
    case "low":
      return 3;
    case "high":
      return 5;
    default:
      return 4;
  }
}
