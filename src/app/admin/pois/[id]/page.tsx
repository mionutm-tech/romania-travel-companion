import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminPOIForm } from "./form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPOIPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: destinations }, { data: categories }] = await Promise.all([
    supabase.from("destinations").select("id, name").order("name"),
    supabase.from("poi_categories").select("id, name").order("name"),
  ]);

  if (id === "new") {
    return (
      <div>
        <h1 className="font-serif text-2xl font-bold text-forest mb-6">
          New POI
        </h1>
        <AdminPOIForm
          destinations={destinations || []}
          categories={categories || []}
        />
      </div>
    );
  }

  const { data: poi } = await supabase
    .from("pois")
    .select("*")
    .eq("id", id)
    .single();

  if (!poi) notFound();

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-forest mb-6">
        Edit: {poi.name}
      </h1>
      <AdminPOIForm
        poi={poi}
        destinations={destinations || []}
        categories={categories || []}
      />
    </div>
  );
}
