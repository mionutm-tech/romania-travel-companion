import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { POICard } from "@/components/cards/poi-card";
import { EmptyState } from "@/components/shared/empty-state";
import { MapPin } from "lucide-react";
import { DestinationMapFilter } from "./destination-client";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("destinations")
    .select("name, description")
    .eq("slug", slug)
    .single();

  if (!data) return { title: "Not Found" };
  return { title: data.name, description: data.description || undefined };
}

export default async function DestinationPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: destination } = await supabase
    .from("destinations")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!destination) notFound();

  const [{ data: pois }, { data: categories }] = await Promise.all([
    supabase
      .from("pois")
      .select("*, category:poi_categories(*), destination:destinations(*)")
      .eq("destination_id", destination.id)
      .order("rating", { ascending: false }),
    supabase.from("poi_categories").select("*").order("name"),
  ]);

  return (
    <div>
      {/* Hero */}
      <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
        {destination.hero_image_url ? (
          <Image
            src={destination.hero_image_url}
            alt={destination.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="h-full w-full bg-forest" />
        )}
        <div className="hero-overlay absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
          <div className="mx-auto max-w-7xl">
            <p className="flex items-center gap-1.5 text-sm text-cream/70 mb-2">
              <MapPin className="h-3.5 w-3.5" />
              Romania
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-cream">
              {destination.name}
            </h1>
            {destination.description && (
              <p className="mt-3 text-cream/70 max-w-xl text-base sm:text-lg">
                {destination.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {(pois || []).length > 0 ? (
          <DestinationMapFilter
            pois={pois || []}
            categories={categories || []}
          />
        ) : (
          <EmptyState
            title="No places yet"
            description={`We're still curating POIs for ${destination.name}. Check back soon!`}
          />
        )}
      </div>
    </div>
  );
}
