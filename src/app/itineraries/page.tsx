import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { ItineraryCard } from "@/components/cards/itinerary-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Route } from "lucide-react";

export const metadata: Metadata = {
  title: "Itineraries",
  description:
    "Curated travel itineraries for exploring Romania, from weekend city breaks to multi-day adventures.",
};

export default async function ItinerariesPage() {
  const supabase = await createClient();
  const { data: itineraries } = await supabase
    .from("itineraries")
    .select("*, itinerary_stops(count)")
    .order("created_at", { ascending: false });

  const items = (itineraries || []).map((i) => ({
    ...i,
    stop_count: i.itinerary_stops?.[0]?.count || 0,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Itineraries"
        description="Curated routes through Romania's best destinations, designed for every kind of traveler."
      />

      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((itin) => (
            <ItineraryCard key={itin.id} itinerary={itin} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Route className="h-8 w-8 text-muted-foreground" />}
          title="No itineraries yet"
          description="We're crafting editorial itineraries. Check back soon!"
        />
      )}
    </div>
  );
}
