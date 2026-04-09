import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DestinationWithCount } from "@/types/database";

interface DestinationCardProps {
  destination: DestinationWithCount;
  variant?: "default" | "hero";
}

export function DestinationCard({
  destination,
  variant = "default",
}: DestinationCardProps) {
  return (
    <Link href={`/destinations/${destination.slug}`} className="group block">
      <div
        className={cn(
          "card-hover relative overflow-hidden rounded-xl",
          variant === "hero" ? "aspect-[3/4] sm:aspect-[4/5]" : "aspect-[4/3]"
        )}
      >
        {destination.hero_image_url ? (
          <Image
            src={destination.hero_image_url}
            alt={destination.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-forest">
            <MapPin className="h-12 w-12 text-cream/20" />
          </div>
        )}
        <div className="hero-overlay absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-cream">
            {destination.name}
          </h3>
          {destination.poi_count > 0 && (
            <p className="mt-1 text-sm text-cream/70">
              {destination.poi_count} place{destination.poi_count !== 1 ? "s" : ""} to explore
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
