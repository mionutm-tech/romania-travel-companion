import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil } from "lucide-react";
import { DIFFICULTY_LABELS } from "@/lib/constants";

export default async function AdminItinerariesPage() {
  const supabase = await createClient();
  const { data: itineraries } = await supabase
    .from("itineraries")
    .select("*, itinerary_stops(count)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold text-forest">
          Itineraries
        </h1>
        <Link href="/admin/itineraries/new">
          <Button className="bg-forest text-cream hover:bg-forest-light">
            <Plus className="mr-2 h-4 w-4" />
            Add Itinerary
          </Button>
        </Link>
      </div>

      <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-semibold text-forest">Title</th>
              <th className="text-left p-3 font-semibold text-forest">Days</th>
              <th className="text-left p-3 font-semibold text-forest">
                Difficulty
              </th>
              <th className="text-left p-3 font-semibold text-forest">Stops</th>
              <th className="text-right p-3 font-semibold text-forest">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {(itineraries || []).map((itin) => (
              <tr key={itin.id} className="border-t border-border/20">
                <td className="p-3 font-medium">{itin.title}</td>
                <td className="p-3 text-muted-foreground">
                  {itin.duration_days}
                </td>
                <td className="p-3">
                  <Badge variant="secondary" className="text-xs">
                    {DIFFICULTY_LABELS[itin.difficulty] || itin.difficulty}
                  </Badge>
                </td>
                <td className="p-3 text-muted-foreground">
                  {itin.itinerary_stops?.[0]?.count || 0}
                </td>
                <td className="p-3 text-right">
                  <Link href={`/admin/itineraries/${itin.id}`}>
                    <Button variant="ghost" size="sm">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
