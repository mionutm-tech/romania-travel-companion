import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminItineraryForm } from "./form";

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

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-forest mb-6">
        Edit: {data.title}
      </h1>
      <AdminItineraryForm itinerary={data} />
    </div>
  );
}
