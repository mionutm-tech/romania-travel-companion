import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Clock, Route, MapPin } from "lucide-react";
import { SaveButton } from "@/components/shared/save-button";
import { DIFFICULTY_LABELS } from "@/lib/constants";
import type { Itinerary } from "@/types/database";

interface ItineraryCardProps {
  itinerary: Itinerary & { stop_count?: number };
  showSaveButton?: boolean;
}

export function ItineraryCard({
  itinerary,
  showSaveButton = true,
}: ItineraryCardProps) {
  return (
    <Link href={`/itineraries/${itinerary.slug}`} className="group block">
      <div className="card-hover relative overflow-hidden rounded-xl bg-card border border-border/40">
        <div className="relative aspect-[16/9] overflow-hidden">
          {itinerary.hero_image_url ? (
            <Image
              src={itinerary.hero_image_url}
              alt={itinerary.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-forest">
              <Route className="h-10 w-10 text-cream/20" />
            </div>
          )}
          <div className="hero-overlay absolute inset-0" />
          <div className="absolute bottom-3 left-3 flex gap-2">
            <Badge className="bg-gold/90 text-forest backdrop-blur-sm border-0 text-xs">
              <Clock className="mr-1 h-3 w-3" />
              {itinerary.duration_days} day{itinerary.duration_days !== 1 ? "s" : ""}
            </Badge>
            <Badge className="bg-cream/80 text-forest backdrop-blur-sm border-0 text-xs">
              {DIFFICULTY_LABELS[itinerary.difficulty]}
            </Badge>
          </div>
          {showSaveButton && (
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <SaveButton itemId={itinerary.id} itemType="itinerary" />
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-serif text-lg font-semibold text-forest line-clamp-1 group-hover:text-gold transition-colors">
            {itinerary.title}
          </h3>
          {itinerary.description && (
            <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
              {itinerary.description}
            </p>
          )}
          {itinerary.stop_count !== undefined && (
            <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {itinerary.stop_count} stops
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
