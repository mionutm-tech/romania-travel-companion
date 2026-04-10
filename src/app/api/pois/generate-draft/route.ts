import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  generatePoiDraft,
  MissingApiKeyError,
} from "@/lib/ai/generate-poi-draft";
import type { PoiPromptInput } from "@/lib/ai/poi-prompt";

// Body-driven so the same endpoint serves both flows:
//   - existing POI: body includes poi_id → suggestion is also persisted
//     to poi_drafts as an audit row.
//   - new POI: poi_id omitted → suggestion is returned but NOT persisted
//     (poi_drafts.poi_id is NOT NULL, and there's no row to point at yet).
const BodySchema = z.object({
  name: z.string().min(1),
  destination_id: z.string().min(1),
  category_id: z.string().min(1),
  address: z.string().nullish(),
  duration_minutes: z.number().int().nullish(),
  price_level: z.number().int().min(0).max(4).nullish(),
  family_friendly: z.boolean().optional(),
  indoor: z.boolean().optional(),
  accessible: z.boolean().optional(),
  poi_id: z.string().min(1).optional(),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Auth: must be a signed-in admin.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Parse + validate body.
  let body;
  try {
    body = BodySchema.parse(await request.json());
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid body", issues: e.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Resolve destination + category display names.
  const [{ data: dest }, { data: cat }] = await Promise.all([
    supabase
      .from("destinations")
      .select("name")
      .eq("id", body.destination_id)
      .single(),
    supabase
      .from("poi_categories")
      .select("name")
      .eq("id", body.category_id)
      .single(),
  ]);

  if (!dest?.name || !cat?.name) {
    return NextResponse.json(
      { error: "Unknown destination or category" },
      { status: 422 }
    );
  }

  // For existing POIs, also pull tag names so the model can use them.
  let tagNames: string[] = [];
  if (body.poi_id) {
    const { data: tagRows } = await supabase
      .from("poi_tag_links")
      .select("tag:poi_tags(name)")
      .eq("poi_id", body.poi_id);
    tagNames =
      (tagRows ?? [])
        .map((row) => {
          const t = row.tag as { name?: string } | { name?: string }[] | null;
          if (!t) return null;
          if (Array.isArray(t)) return t[0]?.name ?? null;
          return t.name ?? null;
        })
        .filter((n): n is string => typeof n === "string");
  }

  const promptInput: PoiPromptInput = {
    name: body.name,
    destination: dest.name,
    category: cat.name,
    tags: tagNames,
    address: body.address ?? null,
    duration_minutes: body.duration_minutes ?? null,
    price_level: body.price_level ?? null,
    family_friendly: body.family_friendly,
    indoor: body.indoor,
    accessible: body.accessible,
  };

  // Call Claude.
  let draft;
  try {
    draft = await generatePoiDraft(promptInput);
  } catch (e) {
    if (e instanceof MissingApiKeyError) {
      return NextResponse.json(
        { error: "AI generation not configured" },
        { status: 503 }
      );
    }
    if (e instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Model output failed schema validation",
          issues: e.issues,
        },
        { status: 422 }
      );
    }
    return NextResponse.json(
      { error: (e as Error).message || "AI generation failed" },
      { status: 500 }
    );
  }

  // Audit trail: only when a POI row already exists.
  let draftId: string | null = null;
  if (body.poi_id) {
    const { data: draftRow, error: insertErr } = await supabase
      .from("poi_drafts")
      .insert({
        poi_id: body.poi_id,
        field: "ai_bundle",
        content: JSON.stringify(draft),
        source: "ai",
        status: "pending",
        created_by: user.id,
      })
      .select("id")
      .single();
    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }
    draftId = draftRow.id;
  }

  return NextResponse.json({ draft, draft_id: draftId });
}
