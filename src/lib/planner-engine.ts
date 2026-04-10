// Deterministic planner engine. Pure function — no I/O.
// Tested in src/lib/__tests__/planner-engine.test.ts.

import type {
  POIWithRelations,
  PlannerRequest,
  PlannerResult,
  PlannerStop,
  PlannerDaySummary,
} from "@/types/database";
import { scorePoi, stopsPerDay } from "./scoring";
import { haversineKm } from "./distance";

const TRANSITION_MINUTES = 30;
const DAY_START_MINUTES = 9 * 60; // 09:00

function fmtTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

interface ScoredPoi {
  poi: POIWithRelations;
  score: ReturnType<typeof scorePoi>;
}

function passesHardConstraints(
  poi: POIWithRelations,
  req: PlannerRequest
): { ok: true } | { ok: false; reason: string } {
  if (poi.publish_status !== "published") {
    return { ok: false, reason: "not published" };
  }
  const c = req.constraints;
  if (c.family_friendly && !poi.family_friendly) {
    return { ok: false, reason: "not family friendly" };
  }
  if (c.indoor_only && !poi.indoor) {
    return { ok: false, reason: "not indoor" };
  }
  if (c.accessible && !poi.accessible) {
    return { ok: false, reason: "not accessible" };
  }
  if (c.avoid_categories?.includes(poi.category.slug)) {
    return { ok: false, reason: `avoided category ${poi.category.slug}` };
  }
  return { ok: true };
}

/**
 * Distribute scored POIs into days using round-robin by category to
 * avoid stacking 5 museums into a single day. Within a day, the
 * highest-scoring POI is the seed, and remaining POIs are ordered by
 * nearest-neighbor (haversine) starting from the seed.
 */
function pickAndOrder(
  scored: ScoredPoi[],
  duration_days: number,
  perDay: number
): ScoredPoi[][] {
  const totalNeeded = duration_days * perDay;
  // already sorted desc by score by caller
  const top = scored.slice(0, Math.max(totalNeeded, 0));

  // group by category
  const byCategory = new Map<string, ScoredPoi[]>();
  for (const s of top) {
    const k = s.poi.category_id;
    if (!byCategory.has(k)) byCategory.set(k, []);
    byCategory.get(k)!.push(s);
  }
  // round-robin: rotate through categories, take 1 each pass
  const queue: ScoredPoi[] = [];
  const buckets = Array.from(byCategory.values());
  let added = true;
  while (added && queue.length < top.length) {
    added = false;
    for (const bucket of buckets) {
      const next = bucket.shift();
      if (next) {
        queue.push(next);
        added = true;
      }
    }
  }

  // chunk into days
  const days: ScoredPoi[][] = [];
  for (let d = 0; d < duration_days; d++) {
    days.push(queue.slice(d * perDay, d * perDay + perDay));
  }

  // route within each day: nearest neighbor from highest-scored seed
  return days.map((day) => {
    if (day.length <= 1) return day;
    const sortedByScore = [...day].sort((a, b) => b.score.total - a.score.total);
    const seed = sortedByScore[0];
    const remaining = sortedByScore.slice(1);
    const ordered: ScoredPoi[] = [seed];
    let cursor = seed.poi;
    while (remaining.length > 0) {
      let bestIdx = 0;
      let bestDist = Infinity;
      for (let i = 0; i < remaining.length; i++) {
        const d = haversineKm(cursor, remaining[i].poi);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = i;
        }
      }
      const [next] = remaining.splice(bestIdx, 1);
      ordered.push(next);
      cursor = next.poi;
    }
    return ordered;
  });
}

export function buildPlan(
  pois: POIWithRelations[],
  req: PlannerRequest
): PlannerResult {
  const rejected: { poi_id: string; reason: string }[] = [];
  const candidates: POIWithRelations[] = [];

  for (const poi of pois) {
    const check = passesHardConstraints(poi, req);
    if (check.ok) {
      candidates.push(poi);
    } else {
      rejected.push({ poi_id: poi.id, reason: check.reason });
    }
  }

  // optionally constrain by destination if specified
  const filtered = req.destination_id
    ? candidates.filter((p) => p.destination_id === req.destination_id)
    : candidates;

  const scored: ScoredPoi[] = filtered
    .map((poi) => ({ poi, score: scorePoi(poi, req) }))
    .sort((a, b) => {
      if (b.score.total !== a.score.total) return b.score.total - a.score.total;
      // deterministic tiebreaker
      return a.poi.id < b.poi.id ? -1 : 1;
    });

  const perDay = stopsPerDay(req.activity_level);
  const days = pickAndOrder(scored, req.duration_days, perDay);

  const stops: PlannerStop[] = [];
  const day_summaries: PlannerDaySummary[] = [];

  for (let dayIdx = 0; dayIdx < days.length; dayIdx++) {
    const day = days[dayIdx];
    let cursorMinutes = DAY_START_MINUTES;
    let totalKm = 0;
    let totalMin = 0;
    let prev: POIWithRelations | null = null;

    for (let stopIdx = 0; stopIdx < day.length; stopIdx++) {
      const { poi, score } = day[stopIdx];
      if (prev) {
        totalKm += haversineKm(prev, poi);
        cursorMinutes += TRANSITION_MINUTES;
      }
      stops.push({
        poi,
        day_number: dayIdx + 1,
        stop_order: stopIdx + 1,
        start_time: fmtTime(cursorMinutes),
        duration_minutes: poi.duration_minutes,
        score,
      });
      cursorMinutes += poi.duration_minutes;
      totalMin += poi.duration_minutes;
      prev = poi;
    }

    day_summaries.push({
      day: dayIdx + 1,
      total_minutes: totalMin,
      total_km: Math.round(totalKm * 10) / 10,
    });
  }

  const fit_score =
    stops.length === 0
      ? 0
      : Math.round(
          (stops.reduce((acc, s) => acc + s.score.total, 0) /
            (stops.length * 95)) *
            100
        );

  return {
    stops,
    fit_score,
    debug: {
      candidates_considered: pois.length,
      candidates_after_filter: filtered.length,
      rejected_for_constraint: rejected,
      day_summaries,
    },
  };
}
