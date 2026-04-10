import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ParsedPOI } from "@/lib/importer";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

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

  // Resolve destination + category slugs once.
  const { data: destinations } = await supabase
    .from("destinations")
    .select("id, slug");
  const { data: categories } = await supabase
    .from("poi_categories")
    .select("id, slug");

  const destBySlug = new Map(
    (destinations ?? []).map((d) => [d.slug, d.id as string])
  );
  const catBySlug = new Map(
    (categories ?? []).map((c) => [c.slug, c.id as string])
  );

  const { data: rows, error: rowsErr } = await supabase
    .from("import_rows")
    .select("*")
    .eq("job_id", id)
    .eq("status", "ready")
    .order("row_index");

  if (rowsErr) {
    return NextResponse.json({ error: rowsErr.message }, { status: 500 });
  }

  let imported = 0;
  let failed = 0;

  for (const row of rows ?? []) {
    const parsed = row.parsed as ParsedPOI | null;
    if (!parsed) {
      failed++;
      continue;
    }
    const destination_id = destBySlug.get(parsed.destination_slug);
    const category_id = catBySlug.get(parsed.category_slug);
    if (!destination_id || !category_id) {
      failed++;
      await supabase
        .from("import_rows")
        .update({
          status: "error",
          error: !destination_id
            ? `Unknown destination_slug "${parsed.destination_slug}"`
            : `Unknown category_slug "${parsed.category_slug}"`,
        })
        .eq("id", row.id);
      continue;
    }

    const insertPayload = {
      destination_id,
      category_id,
      name: parsed.name,
      slug: parsed.slug,
      description: parsed.description,
      short_description: parsed.short_description,
      address: parsed.address,
      lat: parsed.lat,
      lng: parsed.lng,
      hero_image_url: parsed.hero_image_url,
      rating: parsed.rating,
      website_url: parsed.website_url,
      phone: parsed.phone,
      duration_minutes: parsed.duration_minutes,
      price_level: parsed.price_level,
      family_friendly: parsed.family_friendly,
      indoor: parsed.indoor,
      accessible: parsed.accessible,
      featured_score: parsed.featured_score,
      best_time_of_day: parsed.best_time_of_day,
      publish_status: "draft",
      data_quality_status: "raw",
    };

    const { data: poi, error: insertErr } = await supabase
      .from("pois")
      .insert(insertPayload)
      .select("id")
      .single();

    if (insertErr || !poi) {
      failed++;
      await supabase
        .from("import_rows")
        .update({ status: "error", error: insertErr?.message ?? "insert failed" })
        .eq("id", row.id);
      continue;
    }

    imported++;
    await supabase
      .from("import_rows")
      .update({ status: "imported", poi_id: poi.id })
      .eq("id", row.id);
  }

  await supabase
    .from("import_jobs")
    .update({
      status: "committed",
      imported_rows: imported,
      failed_rows: failed,
    })
    .eq("id", id);

  return NextResponse.json({ imported, failed });
}
