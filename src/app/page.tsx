import { createClient } from "@/lib/supabase/server";
import { HeroSection } from "@/components/sections/hero-section";
import { FeaturedDestinations } from "@/components/sections/featured-destinations";
import { FeaturedItineraries } from "@/components/sections/featured-itineraries";
import { POIHighlights } from "@/components/sections/poi-highlights";

export default async function HomePage() {
  const supabase = await createClient();

  const [
    { data: destinations },
    { data: itineraries },
    { data: pois },
  ] = await Promise.all([
    supabase.from("destinations").select("*, pois(count)").limit(4),
    supabase
      .from("itineraries")
      .select("*, itinerary_stops(count)")
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("pois")
      .select("*, category:poi_categories(*), destination:destinations(*)")
      .order("rating", { ascending: false })
      .limit(8),
  ]);

  const destinationsWithCount = (destinations || []).map((d) => ({
    ...d,
    poi_count: d.pois?.[0]?.count || 0,
  }));

  const itinerariesWithCount = (itineraries || []).map((i) => ({
    ...i,
    stop_count: i.itinerary_stops?.[0]?.count || 0,
  }));

  return (
    <>
      <HeroSection />
      <FeaturedDestinations destinations={destinationsWithCount} />
      <FeaturedItineraries itineraries={itinerariesWithCount} />
      <POIHighlights pois={pois || []} />
    </>
  );
}
