import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { DestinationCard } from "@/components/cards/destination-card";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = {
  title: "Destinations",
  description: "Explore Romania's most captivating cities and regions.",
};

export default async function DestinationsPage() {
  const supabase = await createClient();
  const { data: destinations } = await supabase
    .from("destinations")
    .select("*, pois(count)")
    .order("name");

  const items = (destinations || []).map((d) => ({
    ...d,
    poi_count: d.pois?.[0]?.count || 0,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Destinations"
        description="From cosmopolitan Bucharest to medieval Transylvania, discover Romania's diverse cities."
      />

      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((dest) => (
            <DestinationCard key={dest.id} destination={dest} variant="hero" />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No destinations yet"
          description="Check back soon for curated Romanian destinations."
        />
      )}
    </div>
  );
}
