import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { RatingDisplay } from "@/components/shared/rating-display";
import { SaveButton } from "@/components/shared/save-button";
import { cn } from "@/lib/utils";
import type { POIWithRelations } from "@/types/database";
import { MapPin } from "lucide-react";

interface POICardProps {
  poi: POIWithRelations;
  variant?: "default" | "compact";
  showSaveButton?: boolean;
}

export function POICard({
  poi,
  variant = "default",
  showSaveButton = true,
}: POICardProps) {
  return (
    <Link href={`/pois/${poi.slug}`} className="group block">
      <div className="card-hover relative overflow-hidden rounded-xl bg-card border border-border/40">
        <div
          className={cn(
            "relative overflow-hidden",
            variant === "compact" ? "aspect-[3/2]" : "aspect-[4/3]"
          )}
        >
          {poi.hero_image_url ? (
            <Image
              src={poi.hero_image_url}
              alt={poi.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <MapPin className="h-10 w-10 text-muted-foreground/40" />
            </div>
          )}
          <div className="absolute top-3 left-3">
            <Badge className="bg-forest/80 text-cream backdrop-blur-sm border-0 text-xs">
              {poi.category.name}
            </Badge>
          </div>
          {showSaveButton && (
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <SaveButton itemId={poi.id} itemType="poi" />
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-serif text-lg font-semibold text-forest line-clamp-1 group-hover:text-gold transition-colors">
            {poi.name}
          </h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {poi.destination.name}
          </p>
          {poi.rating && (
            <RatingDisplay rating={poi.rating} className="mt-2" />
          )}
          {variant !== "compact" && poi.description && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {poi.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
