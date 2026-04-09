import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { destination_ids, category_ids, days } = await request.json();
  const limit = Math.min((days || 3) * 4, 20);

  const supabase = await createClient();
  let query = supabase
    .from("pois")
    .select(
      "id, name, slug, category:poi_categories(name), destination:destinations(name)"
    )
    .order("rating", { ascending: false })
    .limit(limit);

  if (destination_ids?.length) {
    query = query.in("destination_id", destination_ids);
  }
  if (category_ids?.length) {
    query = query.in("category_id", category_ids);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const suggestions = (data || []).map((poi) => ({
    id: poi.id,
    name: poi.name,
    slug: poi.slug,
    category_name: (poi.category as unknown as { name: string } | null)?.name || "",
    destination_name:
      (poi.destination as unknown as { name: string } | null)?.name || "",
  }));

  return NextResponse.json({ suggestions });
}
