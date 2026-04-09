"use client";

import { useState, useCallback } from "react";
import { MapView } from "@/components/map/map-view";
import { CategoryFilter } from "@/components/shared/category-filter";
import { RatingDisplay } from "@/components/shared/rating-display";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MapPin, List, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import type { POIWithRelations, POICategory } from "@/types/database";

export function MapPageClient({
  pois,
  categories,
}: {
  pois: POIWithRelations[];
  categories: POICategory[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPoi, setSelectedPoi] = useState<POIWithRelations | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filtered = selectedCategory
    ? pois.filter((p) => p.category?.slug === selectedCategory)
    : pois;

  const handleMarkerClick = useCallback((poi: POIWithRelations) => {
    setSelectedPoi(poi);
  }, []);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border/40">
        <h2 className="font-serif text-xl font-bold text-forest mb-3">
          Discover Places
        </h2>
        <CategoryFilter
          categories={categories}
          selected={selectedCategory}
          onChange={setSelectedCategory}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          {filtered.length} place{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.map((poi) => (
          <Link
            key={poi.id}
            href={`/pois/${poi.slug}`}
            className={cn(
              "flex gap-3 p-3 border-b border-border/20 hover:bg-muted/50 transition-colors",
              selectedPoi?.id === poi.id && "bg-muted/80"
            )}
          >
            <div className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden">
              {poi.hero_image_url ? (
                <Image
                  src={poi.hero_image_url}
                  alt={poi.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="h-full w-full bg-muted flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-muted-foreground/40" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-forest truncate">
                {poi.name}
              </h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3" />
                {poi.destination?.name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {poi.category?.name}
                </Badge>
                {poi.rating && (
                  <RatingDisplay rating={poi.rating} className="scale-75 origin-left" />
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-96 flex-col border-r border-border/40 bg-card">
        <SidebarContent />
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapView
          pois={filtered}
          onMarkerClick={handleMarkerClick}
          className="h-full"
        />

        {/* Mobile list toggle */}
        <div className="lg:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger
              render={<Button className="shadow-lg bg-forest text-cream hover:bg-forest-light rounded-full px-5" />}
            >
              <List className="mr-2 h-4 w-4" />
              List ({filtered.length})
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop filter bar on map */}
        <div className="hidden lg:block absolute top-4 left-4 right-4 z-10">
          <div className="inline-flex rounded-xl bg-white/90 backdrop-blur-sm px-4 py-2 shadow-md border border-border/20">
            <CategoryFilter
              categories={categories}
              selected={selectedCategory}
              onChange={setSelectedCategory}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
