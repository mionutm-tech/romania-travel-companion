import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { POICard } from "@/components/cards/poi-card";
import type { POIWithRelations } from "@/types/database";

export function POIHighlights({ pois }: { pois: POIWithRelations[] }) {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-sm font-semibold text-gold uppercase tracking-wider">
              Must-see places
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-forest">
              Top-Rated Spots
            </h2>
          </div>
          <Link
            href="/map"
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-gold hover:text-terracotta transition-colors"
          >
            Explore map
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {pois.map((poi) => (
            <POICard key={poi.id} poi={poi} />
          ))}
        </div>
      </div>
    </section>
  );
}
