import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { PlannerClient } from "./planner-client";

export const metadata: Metadata = {
  title: "Trip Planner",
  description:
    "Plan your Romanian adventure. Select your interests, dates, and destinations to get a personalized itinerary.",
};

export default async function PlannerPage() {
  const supabase = await createClient();

  const [{ data: destinations }, { data: categories }] = await Promise.all([
    supabase.from("destinations").select("id, name, slug").order("name"),
    supabase.from("poi_categories").select("id, name, slug").order("name"),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Trip Planner"
        description="Tell us what you love, and we'll suggest the perfect Romanian itinerary for you."
      />
      <PlannerClient
        destinations={destinations || []}
        categories={categories || []}
      />
    </div>
  );
}
