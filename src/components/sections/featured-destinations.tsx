import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DestinationCard } from "@/components/cards/destination-card";
import type { DestinationWithCount } from "@/types/database";

export function FeaturedDestinations({
  destinations,
}: {
  destinations: DestinationWithCount[];
}) {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-sm font-semibold text-gold uppercase tracking-wider">
              Where to go
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-forest">
              Featured Destinations
            </h2>
          </div>
          <Link
            href="/destinations"
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-gold hover:text-terracotta transition-colors"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {destinations.map((dest) => (
            <DestinationCard key={dest.id} destination={dest} variant="hero" />
          ))}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link
            href="/destinations"
            className="inline-flex items-center gap-1 text-sm font-medium text-gold"
          >
            View all destinations
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
