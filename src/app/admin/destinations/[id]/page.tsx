import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminDestinationForm } from "./form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditDestinationPage({ params }: Props) {
  const { id } = await params;

  if (id === "new") {
    return (
      <div>
        <h1 className="font-serif text-2xl font-bold text-forest mb-6">
          New Destination
        </h1>
        <AdminDestinationForm />
      </div>
    );
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("destinations")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-forest mb-6">
        Edit: {data.name}
      </h1>
      <AdminDestinationForm destination={data} />
    </div>
  );
}
