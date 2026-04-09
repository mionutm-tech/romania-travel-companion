import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";

export default async function AdminDestinationsPage() {
  const supabase = await createClient();
  const { data: destinations } = await supabase
    .from("destinations")
    .select("*")
    .order("name");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold text-forest">
          Destinations
        </h1>
        <Link href="/admin/destinations/new">
          <Button className="bg-forest text-cream hover:bg-forest-light">
            <Plus className="mr-2 h-4 w-4" />
            Add Destination
          </Button>
        </Link>
      </div>

      <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-semibold text-forest">Name</th>
              <th className="text-left p-3 font-semibold text-forest">Slug</th>
              <th className="text-left p-3 font-semibold text-forest">
                Coordinates
              </th>
              <th className="text-right p-3 font-semibold text-forest">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {(destinations || []).map((dest) => (
              <tr key={dest.id} className="border-t border-border/20">
                <td className="p-3 font-medium">{dest.name}</td>
                <td className="p-3 text-muted-foreground">{dest.slug}</td>
                <td className="p-3 text-muted-foreground">
                  {dest.lat.toFixed(4)}, {dest.lng.toFixed(4)}
                </td>
                <td className="p-3 text-right">
                  <Link href={`/admin/destinations/${dest.id}`}>
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
