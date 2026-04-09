import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const type = new URL(request.url).searchParams.get("type") || "poi";
  const table =
    type === "itinerary" ? "user_saved_itineraries" : "user_saved_pois";
  const select =
    type === "itinerary"
      ? "itinerary:itineraries(*)"
      : "poi:pois(*, category:poi_categories(*), destination:destinations(*))";

  const { data, error } = await supabase
    .from(table)
    .select(select)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { item_id, item_type } = await request.json();
  const table =
    item_type === "itinerary" ? "user_saved_itineraries" : "user_saved_pois";
  const idColumn = item_type === "itinerary" ? "itinerary_id" : "poi_id";

  const { error } = await supabase
    .from(table)
    .insert({ user_id: user.id, [idColumn]: item_id });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ saved: true }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { item_id, item_type } = await request.json();
  const table =
    item_type === "itinerary" ? "user_saved_itineraries" : "user_saved_pois";
  const idColumn = item_type === "itinerary" ? "itinerary_id" : "poi_id";

  const { error } = await supabase
    .from(table)
    .delete()
    .eq("user_id", user.id)
    .eq(idColumn, item_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ saved: false });
}
