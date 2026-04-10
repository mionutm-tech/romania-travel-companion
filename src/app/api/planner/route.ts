import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildPlan } from "@/lib/planner-engine";
import type {
  PlannerRequest,
  POIWithRelations,
} from "@/types/database";

function validateRequest(body: unknown): PlannerRequest | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const duration_days = Number(b.duration_days);
  const budget_level = Number(b.budget_level);
  const activity_level = b.activity_level as PlannerRequest["activity_level"];
  if (!Number.isFinite(duration_days) || duration_days < 1 || duration_days > 14)
    return null;
  if (!Number.isFinite(budget_level) || budget_level < 0 || budget_level > 4)
    return null;
  if (!["low", "moderate", "high"].includes(activity_level)) return null;

  return {
    destination_id:
      typeof b.destination_id === "string" && b.destination_id
        ? b.destination_id
        : undefined,
    duration_days,
    budget_level,
    activity_level,
    interests: Array.isArray(b.interests)
      ? (b.interests as unknown[]).filter(
          (s): s is string => typeof s === "string"
        )
      : [],
    constraints:
      b.constraints && typeof b.constraints === "object"
        ? (b.constraints as PlannerRequest["constraints"])
        : {},
  };
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const req = validateRequest(body);
  if (!req) {
    return NextResponse.json(
      { error: "Invalid planner request" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Pull all published POIs (with destination + category) — small dataset
  // for now (~hundreds at most). If this grows we can pre-filter on
  // destination_id server-side.
  let q = supabase
    .from("pois")
    .select(
      "*, category:poi_categories(*), destination:destinations(*)"
    )
    .eq("publish_status", "published");
  if (req.destination_id) q = q.eq("destination_id", req.destination_id);

  const { data: pois, error } = await q;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const result = buildPlan((pois ?? []) as POIWithRelations[], req);

  // Persist plan + stops (best effort — don't fail the request on insert err)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let plan_id: string | null = null;
  try {
    const { data: plan } = await supabase
      .from("generated_trip_plans")
      .insert({
        user_id: user?.id ?? null,
        destination_id: req.destination_id ?? null,
        duration_days: req.duration_days,
        budget_level: req.budget_level,
        activity_level: req.activity_level,
        interests: req.interests,
        constraints: req.constraints,
        fit_score: result.fit_score,
        debug: result.debug,
      })
      .select("id")
      .single();
    if (plan) {
      plan_id = plan.id;
      if (result.stops.length > 0) {
        await supabase.from("generated_trip_stops").insert(
          result.stops.map((s) => ({
            plan_id: plan.id,
            poi_id: s.poi.id,
            day_number: s.day_number,
            stop_order: s.stop_order,
            start_time: s.start_time,
            duration_minutes: s.duration_minutes,
          }))
        );
      }
    }
  } catch {
    // ignore — planner result is still returned
  }

  return NextResponse.json({ ...result, plan_id });
}
