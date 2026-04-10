import { describe, it, expect } from "vitest";
import { scorePoi, stopsPerDay } from "../scoring";
import type {
  POIWithRelations,
  PlannerRequest,
} from "@/types/database";

function makePoi(overrides: Partial<POIWithRelations> = {}): POIWithRelations {
  return {
    id: "p1",
    destination_id: "d1",
    category_id: "c1",
    name: "Test POI",
    slug: "test-poi",
    description: null,
    short_description: null,
    address: null,
    lat: 44.43,
    lng: 26.1,
    hero_image_url: null,
    rating: 4.5,
    website_url: null,
    phone: null,
    opening_hours: null,
    duration_minutes: 90,
    price_level: 2,
    family_friendly: true,
    indoor: true,
    accessible: true,
    featured_score: 60,
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

describe("scorePoi", () => {
  it("gives full marks when interests, destination and budget all match", () => {
    const s = scorePoi(makePoi(), baseReq);
    expect(s.interest_match).toBe(25);
    expect(s.destination_match).toBe(20);
    expect(s.category_match).toBe(10);
    expect(s.budget_fit).toBe(10);
    expect(s.duration_fit).toBe(10);
    expect(s.constraint_fit).toBe(10);
    expect(s.total).toBeGreaterThan(80);
  });

  it("zeroes interest_match when category isn't in interests", () => {
    const s = scorePoi(makePoi(), { ...baseReq, interests: ["food-drink"] });
    expect(s.interest_match).toBe(0);
  });

  it("gives a neutral score when no interests are picked", () => {
    const s = scorePoi(makePoi(), { ...baseReq, interests: [] });
    expect(s.interest_match).toBe(12);
  });

  it("zeroes destination_match when destination differs", () => {
    const s = scorePoi(makePoi(), { ...baseReq, destination_id: "d2" });
    expect(s.destination_match).toBe(0);
  });

  it("penalises avoid_categories", () => {
    const s = scorePoi(makePoi(), {
      ...baseReq,
      constraints: { avoid_categories: ["museums-culture"] },
    });
    expect(s.category_match).toBe(0);
  });

  it("decays budget_fit linearly with price delta", () => {
    expect(scorePoi(makePoi({ price_level: 0 }), baseReq).budget_fit).toBe(4);
    expect(scorePoi(makePoi({ price_level: 4 }), baseReq).budget_fit).toBe(4);
  });

  it("zeroes constraint_fit when accessibility is required but missing", () => {
    const s = scorePoi(makePoi({ accessible: false }), {
      ...baseReq,
      constraints: { accessible: true },
    });
    expect(s.constraint_fit).toBe(0);
  });

  it("is deterministic — same input produces same output", () => {
    const a = scorePoi(makePoi(), baseReq);
    const b = scorePoi(makePoi(), baseReq);
    expect(a).toEqual(b);
  });
});

describe("stopsPerDay", () => {
  it("returns 3/4/5 for low/moderate/high", () => {
    expect(stopsPerDay("low")).toBe(3);
    expect(stopsPerDay("moderate")).toBe(4);
    expect(stopsPerDay("high")).toBe(5);
  });
});
