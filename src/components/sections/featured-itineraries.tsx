import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ItineraryCard } from "@/components/cards/itinerary-card";
import type { Itinerary } from "@/types/database";

export function FeaturedItineraries({
  itineraries,
}: {
  itineraries: (Itinerary & { stop_count?: number })[];
}) {
  return (
    <section className="py-16 sm:py-20 bg-cream-dark/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-sm font-semibold text-gold uppercase tracking-wider">
              Curated routes
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-forest">
              Editorial Itineraries
            </h2>
          </div>
          <Link
            href="/itineraries"
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-gold hover:text-terracotta transition-colors"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {itineraries.map((itin) => (
            <ItineraryCard key={itin.id} itinerary={itin} />
          ))}
        </div>
      </div>
    </section>
  );
}
