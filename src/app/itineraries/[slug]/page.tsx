import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MapView } from "@/components/map/map-view";
import { SaveButton } from "@/components/shared/save-button";
import { Badge } from "@/components/ui/badge";
import { DIFFICULTY_LABELS } from "@/lib/constants";
import { Clock, MapPin, Route, ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("itineraries")
    .select("title, description")
    .eq("slug", slug)
    .single();
  if (!data) return { title: "Not Found" };
  return { title: data.title, description: data.description || undefined };
}

export default async function ItineraryPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: itinerary } = await supabase
    .from("itineraries")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!itinerary) notFound();

  const { data: stops } = await supabase
    .from("itinerary_stops")
    .select(
      "*, poi:pois(*, category:poi_categories(*), destination:destinations(*))"
    )
    .eq("itinerary_id", itinerary.id)
    .order("stop_order");

  const stopList = stops || [];
  const routeCoords: [number, number][] = stopList
    .filter((s) => s.poi)
    .map((s) => [s.poi.lng, s.poi.lat]);

  const poisForMap = stopList
    .filter((s) => s.poi)
    .map((s) => s.poi);

  return (
    <div>
      {/* Hero */}
      <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
        {itinerary.hero_image_url ? (
          <Image
            src={itinerary.hero_image_url}
            alt={itinerary.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="h-full w-full editorial-gradient" />
        )}
        <div className="hero-overlay absolute inset-0" />

        <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
          <Link
            href="/itineraries"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/80 backdrop-blur-sm px-3 py-1.5 text-sm font-medium text-forest hover:bg-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All Itineraries
          </Link>
        </div>

        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <SaveButton itemId={itinerary.id} itemType="itinerary" />
        </div>

        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
          <div className="mx-auto max-w-4xl">
            <div className="flex gap-2 mb-3">
              <Badge className="bg-gold/90 text-forest border-0">
                <Clock className="mr-1 h-3 w-3" />
                {itinerary.duration_days} day
                {itinerary.duration_days !== 1 ? "s" : ""}
              </Badge>
              <Badge className="bg-cream/80 text-forest border-0">
                {DIFFICULTY_LABELS[itinerary.difficulty]}
              </Badge>
              <Badge className="bg-cream/80 text-forest border-0">
                <Route className="mr-1 h-3 w-3" />
                {stopList.length} stops
              </Badge>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-cream">
              {itinerary.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {itinerary.description && (
          <p className="text-lg text-muted-foreground leading-relaxed mb-10">
            {itinerary.description}
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Stops */}
          <div className="lg:col-span-3">
            <h2 className="font-serif text-2xl font-bold text-forest mb-6">
              Stops
            </h2>
            <div className="space-y-0">
              {stopList.map((stop, idx) => (
                <div key={stop.id} className="relative flex gap-4">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest text-cream text-sm font-bold">
                      {idx + 1}
                    </div>
                    {idx < stopList.length - 1 && (
                      <div className="w-px flex-1 bg-border my-1" />
                    )}
                  </div>

                  {/* Stop content */}
                  <div className="pb-8 flex-1">
                    {stop.poi ? (
                      <Link
                        href={`/pois/${stop.poi.slug}`}
                        className="block group"
                      >
                        <div className="rounded-xl border border-border/40 bg-card p-4 transition-all hover:shadow-md hover:border-gold/30">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-serif text-lg font-semibold text-forest group-hover:text-gold transition-colors">
                                {stop.poi.name}
                              </h3>
                              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {stop.poi.destination?.name}
                                {stop.poi.category && (
                                  <> &middot; {stop.poi.category.name}</>
                                )}
                              </p>
                            </div>
                            {stop.duration_minutes && (
                              <Badge
                                variant="secondary"
                                className="shrink-0 text-xs"
                              >
                                <Clock className="mr-1 h-3 w-3" />
                                {stop.duration_minutes}m
                              </Badge>
                            )}
                          </div>
                          {stop.notes && (
                            <p className="mt-2 text-sm text-muted-foreground">
                              {stop.notes}
                            </p>
                          )}
                        </div>
                      </Link>
                    ) : (
                      <div className="rounded-xl border border-border/40 bg-card p-4">
                        <p className="text-sm text-muted-foreground">
                          Stop data unavailable
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-2">
            <h2 className="font-serif text-2xl font-bold text-forest mb-6">
              Route Map
            </h2>
            <div className="h-80 lg:h-[28rem] rounded-xl overflow-hidden border border-border/40 sticky top-24">
              <MapView pois={poisForMap} route={routeCoords} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
