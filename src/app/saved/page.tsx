"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/shared/page-header";
import { POICard } from "@/components/cards/poi-card";
import { ItineraryCard } from "@/components/cards/itinerary-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Heart, Route, MapPin } from "lucide-react";
import Link from "next/link";
import type { POIWithRelations, Itinerary } from "@/types/database";

export default function SavedPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [savedPois, setSavedPois] = useState<POIWithRelations[]>([]);
  const [savedItineraries, setSavedItineraries] = useState<
    (Itinerary & { stop_count?: number })[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const supabase = createClient();

    Promise.all([
      supabase
        .from("user_saved_pois")
        .select(
          "poi:pois(*, category:poi_categories(*), destination:destinations(*))"
        )
        .eq("user_id", user.id),
      supabase
        .from("user_saved_itineraries")
        .select("itinerary:itineraries(*, itinerary_stops(count))")
        .eq("user_id", user.id),
    ]).then(([poisRes, itinRes]) => {
      setSavedPois(
        (poisRes.data || [])
          .map((r: Record<string, unknown>) => r.poi)
          .filter(Boolean) as unknown as POIWithRelations[]
      );
      setSavedItineraries(
        (itinRes.data || [])
          .map((r: Record<string, unknown>) => {
            const itin = r.itinerary as Record<string, unknown> | null;
            if (!itin) return null;
            const stops = itin.itinerary_stops as { count: number }[] | undefined;
            return {
              ...itin,
              stop_count: stops?.[0]?.count || 0,
            };
          })
          .filter(Boolean) as unknown as (Itinerary & { stop_count?: number })[]
      );
      setLoading(false);
    });
  }, [user, authLoading, router]);

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-10 w-48 mb-4" />
        <Skeleton className="h-5 w-72 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Saved Items"
        description="Your bookmarked places and itineraries for your Romania trip."
      />

      <Tabs defaultValue="pois">
        <TabsList className="mb-6">
          <TabsTrigger value="pois" className="gap-1.5">
            <Heart className="h-4 w-4" />
            Places ({loading ? "..." : savedPois.length})
          </TabsTrigger>
          <TabsTrigger value="itineraries" className="gap-1.5">
            <Route className="h-4 w-4" />
            Itineraries ({loading ? "..." : savedItineraries.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pois">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
              ))}
            </div>
          ) : savedPois.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedPois.map((poi) => (
                <POICard key={poi.id} poi={poi} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Heart className="h-8 w-8 text-muted-foreground" />}
              title="No saved places yet"
              description="Explore destinations and tap the heart icon to save your favorites."
              action={
                <Link href="/map">
                  <Button variant="outline">
                    <MapPin className="mr-2 h-4 w-4" />
                    Explore the Map
                  </Button>
                </Link>
              }
            />
          )}
        </TabsContent>

        <TabsContent value="itineraries">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="aspect-[16/9] rounded-xl" />
              ))}
            </div>
          ) : savedItineraries.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedItineraries.map((itin) => (
                <ItineraryCard
                  key={itin.id}
                  itinerary={itin as Itinerary & { stop_count?: number }}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Route className="h-8 w-8 text-muted-foreground" />}
              title="No saved itineraries yet"
              description="Browse our curated itineraries and save the ones that inspire you."
              action={
                <Link href="/itineraries">
                  <Button variant="outline">
                    <Route className="mr-2 h-4 w-4" />
                    Browse Itineraries
                  </Button>
                </Link>
              }
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
