import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { PlannerClient } from "./planner-client";

export const metadata: Metadata = {
  title: "Trip Planner",
  description:
    "Plan your Romanian adventure. Select your interests, budget, and pace to get a personalized itinerary.",
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
        description="Tell us your interests, pace, and budget — we'll plan a day-by-day Romanian itinerary."
      />
      <PlannerClient
        destinations={destinations || []}
        categories={categories || []}
      />
    </div>
  );
}
