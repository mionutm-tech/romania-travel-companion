import { describe, it, expect } from "vitest";
import { buildPlan } from "../planner-engine";
import type {
  POIWithRelations,
  PlannerRequest,
} from "@/types/database";

let nextId = 0;
function makePoi(overrides: Partial<POIWithRelations> = {}): POIWithRelations {
  nextId++;
  return {
    id: `p${nextId}`,
    destination_id: "d1",
    category_id: "c1",
    name: `POI ${nextId}`,
    slug: `poi-${nextId}`,
    description: null,
    short_description: null,
    address: null,
    lat: 44.43 + nextId * 0.01,
    lng: 26.1 + nextId * 0.01,
    hero_image_url: null,
    rating: 4.0,
    website_url: null,
    phone: null,
    opening_hours: null,
    duration_minutes: 90,
    price_level: 2,
    family_friendly: true,
    indoor: true,
    accessible: true,
    featured_score: 50,
    best_time_of_day: "any",
    publish_status: "published",
    data_quality_status: "reviewed",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    category: { id: "c1", name: "Museum", slug: "museums-culture", icon: null },
    destination: {
      id: "d1",
      name: "Bucharest",
      slug: "bucharest",
      description: null,
      hero_image_url: null,
      lat: 44.43,
      lng: 26.1,
      created_at: "2026-01-01T00:00:00Z",
    },
    ...overrides,
  };
}

const baseReq: PlannerRequest = {
  destination_id: "d1",
  duration_days: 2,
  budget_level: 2,
  activity_level: "moderate",
  interests: ["museums-culture"],
  constraints: {},
};

describe("buildPlan", () => {
  it("filters out unpublished POIs", () => {
    const pois = [
      makePoi(),
      makePoi({ publish_status: "draft" }),
      makePoi({ publish_status: "review" }),
    ];
    const r = buildPlan(pois, baseReq);
    expect(r.debug.candidates_after_filter).toBe(1);
    expect(r.debug.rejected_for_constraint).toHaveLength(2);
  });

  it("respects accessible constraint", () => {
    const pois = [
      makePoi({ accessible: true }),
      makePoi({ accessible: false }),
    ];
    const r = buildPlan(pois, {
      ...baseReq,
      constraints: { accessible: true },
    });
    expect(r.debug.candidates_after_filter).toBe(1);
  });

  it("assigns day_number 1..N", () => {
    const pois = Array.from({ length: 12 }, () => makePoi());
    const r = buildPlan(pois, { ...baseReq, duration_days: 3 });
    const days = new Set(r.stops.map((s) => s.day_number));
    expect([...days].sort()).toEqual([1, 2, 3]);
  });

  it("limits stops to duration_days * stops_per_day", () => {
    const pois = Array.from({ length: 30 }, () => makePoi());
    const r = buildPlan(pois, {
      ...baseReq,
      duration_days: 2,
      activity_level: "low",
    });
    expect(r.stops).toHaveLength(2 * 3);
  });

  it("starts each day at 09:00", () => {
    const pois = Array.from({ length: 10 }, () => makePoi());
    const r = buildPlan(pois, { ...baseReq, duration_days: 2 });
    const day1Stops = r.stops.filter((s) => s.day_number === 1);
    const day2Stops = r.stops.filter((s) => s.day_number === 2);
    expect(day1Stops[0].start_time).toBe("09:00");
    expect(day2Stops[0].start_time).toBe("09:00");
  });

  it("is deterministic — same input → identical result", () => {
    const pois1 = Array.from({ length: 8 }, (_, i) =>
      makePoi({
        id: `same-${i}`,
        lat: 44 + i * 0.01,
        lng: 26 + i * 0.01,
      })
    );
    nextId = 0;
    const pois2 = Array.from({ length: 8 }, (_, i) =>
      makePoi({
        id: `same-${i}`,
        lat: 44 + i * 0.01,
        lng: 26 + i * 0.01,
      })
    );
    const a = buildPlan(pois1, baseReq);
    const b = buildPlan(pois2, baseReq);
    expect(a.stops.map((s) => s.poi.id)).toEqual(b.stops.map((s) => s.poi.id));
    expect(a.fit_score).toBe(b.fit_score);
  });

  it("fit_score is 0 when no stops", () => {
    const r = buildPlan([], baseReq);
    expect(r.fit_score).toBe(0);
    expect(r.stops).toHaveLength(0);
  });
});
