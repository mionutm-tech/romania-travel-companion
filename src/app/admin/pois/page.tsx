import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil } from "lucide-react";

export default async function AdminPOIsPage() {
  const supabase = await createClient();
  const { data: pois } = await supabase
    .from("pois")
    .select("*, category:poi_categories(name), destination:destinations(name)")
    .order("name");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold text-forest">POIs</h1>
        <Link href="/admin/pois/new">
          <Button className="bg-forest text-cream hover:bg-forest-light">
            <Plus className="mr-2 h-4 w-4" />
            Add POI
          </Button>
        </Link>
      </div>

      <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-semibold text-forest">Name</th>
              <th className="text-left p-3 font-semibold text-forest">
                Destination
              </th>
              <th className="text-left p-3 font-semibold text-forest">
                Category
              </th>
              <th className="text-left p-3 font-semibold text-forest">
                Rating
              </th>
              <th className="text-right p-3 font-semibold text-forest">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {(pois || []).map((poi) => (
              <tr key={poi.id} className="border-t border-border/20">
                <td className="p-3 font-medium">{poi.name}</td>
                <td className="p-3 text-muted-foreground">
                  {(poi.destination as { name: string } | null)?.name}
                </td>
                <td className="p-3">
                  <Badge variant="secondary" className="text-xs">
                    {(poi.category as { name: string } | null)?.name}
                  </Badge>
                </td>
                <td className="p-3 text-muted-foreground">
                  {poi.rating || "-"}
                </td>
                <td className="p-3 text-right">
                  <Link href={`/admin/pois/${poi.id}`}>
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
