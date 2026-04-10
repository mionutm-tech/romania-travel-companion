import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminItineraryForm } from "./form";
import { StopsBuilder } from "./stops-builder";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditItineraryPage({ params }: Props) {
  const { id } = await params;

  if (id === "new") {
    return (
      <div>
        <h1 className="font-serif text-2xl font-bold text-forest mb-6">
          New Itinerary
        </h1>
        <AdminItineraryForm />
      </div>
    );
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("itineraries")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();

  const { data: stops } = await supabase
    .from("itinerary_stops")
    .select("*, poi:pois(id, name, slug, duration_minutes)")
    .eq("itinerary_id", id)
    .order("stop_order");

  const { data: pois } = await supabase
    .from("pois")
    .select("id, name, duration_minutes")
    .order("name");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-forest mb-6">
          Edit: {data.title}
        </h1>
        <AdminItineraryForm itinerary={data} />
      </div>

      <div>
        <h2 className="font-serif text-xl font-bold text-forest mb-4">
          Stops
        </h2>
        <StopsBuilder
          itineraryId={id}
          initialStops={
            (stops ?? []).map((s) => ({
              id: s.id,
              poi_id: s.poi_id,
              stop_order: s.stop_order,
              notes: s.notes,
              duration_minutes: s.duration_minutes ?? 60,
              poi_name:
                (s.poi as { name?: string } | null)?.name ?? "(unknown)",
            }))
          }
          allPois={(pois ?? []) as { id: string; name: string; duration_minutes: number }[]}
        />
      </div>
    </div>
  );
}
