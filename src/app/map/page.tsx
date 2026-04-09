import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { MapPageClient } from "./map-client";

export const metadata: Metadata = {
  title: "Discovery Map",
  description:
    "Explore Romania's best places on an interactive map. Filter by category and discover hidden gems.",
};

export default async function MapPage() {
  const supabase = await createClient();

  const [{ data: pois }, { data: categories }] = await Promise.all([
    supabase
      .from("pois")
      .select("*, category:poi_categories(*), destination:destinations(*)")
      .order("name"),
    supabase.from("poi_categories").select("*").order("name"),
  ]);

  return (
    <MapPageClient pois={pois || []} categories={categories || []} />
  );
}
