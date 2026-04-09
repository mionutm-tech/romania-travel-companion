import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MapView } from "@/components/map/map-view";
import { RatingDisplay } from "@/components/shared/rating-display";
import { TagList } from "@/components/shared/tag-list";
import { SaveButton } from "@/components/shared/save-button";
import { POICard } from "@/components/cards/poi-card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Globe,
  Phone,
  Clock,
  ArrowLeft,
} from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("pois")
    .select("name, description")
    .eq("slug", slug)
    .single();
  if (!data) return { title: "Not Found" };
  return { title: data.name, description: data.description || undefined };
}

export default async function POIPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: poi } = await supabase
    .from("pois")
    .select(
      "*, category:poi_categories(*), destination:destinations(*)"
    )
    .eq("slug", slug)
    .single();

  if (!poi) notFound();

  const [{ data: tagLinks }, { data: relatedPois }] = await Promise.all([
    supabase
      .from("poi_tag_links")
      .select("tag:poi_tags(*)")
      .eq("poi_id", poi.id),
    supabase
      .from("pois")
      .select("*, category:poi_categories(*), destination:destinations(*)")
      .eq("destination_id", poi.destination_id)
      .neq("id", poi.id)
      .limit(3),
  ]);

  const tags = (tagLinks || []).map((l: Record<string, unknown>) => l.tag).filter(Boolean) as import("@/types/database").POITag[];
  const hours = poi.opening_hours as Record<string, string> | null;

  return (
    <div>
      {/* Hero */}
      <div className="relative h-72 sm:h-96 lg:h-[28rem] overflow-hidden">
        {poi.hero_image_url ? (
          <Image
            src={poi.hero_image_url}
            alt={poi.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="h-full w-full bg-forest" />
        )}
        <div className="hero-overlay absolute inset-0" />

        <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
          <Link
            href={`/destinations/${poi.destination?.slug || ""}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/80 backdrop-blur-sm px-3 py-1.5 text-sm font-medium text-forest hover:bg-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {poi.destination?.name}
          </Link>
        </div>

        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <SaveButton itemId={poi.id} itemType="poi" />
        </div>

        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
          <div className="mx-auto max-w-4xl">
            <Badge className="bg-gold/90 text-forest border-0 mb-3">
              {poi.category?.name}
            </Badge>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-cream">
              {poi.name}
            </h1>
            {poi.rating && (
              <RatingDisplay
                rating={poi.rating}
                className="mt-3 [&_span]:text-cream/70 [&_svg]:text-gold"
              />
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main */}
          <div className="lg:col-span-2 space-y-8">
            {poi.description && (
              <div>
                <h2 className="font-serif text-xl font-semibold text-forest mb-3">
                  About
                </h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {poi.description}
                </p>
              </div>
            )}

            {tags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-forest mb-2">Tags</h3>
                <TagList tags={tags} />
              </div>
            )}

            {/* Map */}
            <div>
              <h2 className="font-serif text-xl font-semibold text-forest mb-3">
                Location
              </h2>
              <div className="h-64 rounded-xl overflow-hidden border border-border/40">
                <MapView
                  pois={[poi]}
                  center={[poi.lng, poi.lat]}
                  zoom={14}
                  interactive={false}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-xl border border-border/40 bg-card p-5 space-y-4">
              <h3 className="font-serif text-lg font-semibold text-forest">
                Details
              </h3>

              {poi.address && (
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="h-4 w-4 mt-0.5 text-gold shrink-0" />
                  <span className="text-muted-foreground">{poi.address}</span>
                </div>
              )}

              {poi.website_url && (
                <div className="flex items-start gap-3 text-sm">
                  <Globe className="h-4 w-4 mt-0.5 text-gold shrink-0" />
                  <a
                    href={poi.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold hover:text-terracotta underline-offset-2 hover:underline truncate"
                  >
                    Visit website
                  </a>
                </div>
              )}

              {poi.phone && (
                <div className="flex items-start gap-3 text-sm">
                  <Phone className="h-4 w-4 mt-0.5 text-gold shrink-0" />
                  <span className="text-muted-foreground">{poi.phone}</span>
                </div>
              )}

              {hours && Object.keys(hours).length > 0 && (
                <div className="flex items-start gap-3 text-sm">
                  <Clock className="h-4 w-4 mt-0.5 text-gold shrink-0" />
                  <div className="space-y-0.5 text-muted-foreground">
                    {Object.entries(hours).map(([day, time]) => (
                      <div key={day} className="flex justify-between gap-4">
                        <span className="capitalize font-medium">{day}</span>
                        <span>{time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related POIs */}
        {(relatedPois || []).length > 0 && (
          <div className="mt-16">
            <h2 className="font-serif text-2xl font-bold text-forest mb-6">
              More in {poi.destination?.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {(relatedPois || []).map((p) => (
                <POICard key={p.id} poi={p} variant="compact" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
