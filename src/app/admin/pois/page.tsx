import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PublishStatusBadge } from "@/components/admin/status-badge";
import { Plus, Pencil, Upload } from "lucide-react";
import type { PublishStatus } from "@/types/database";

const STATUS_OPTIONS: ("all" | PublishStatus)[] = [
  "all",
  "draft",
  "review",
  "published",
];

export default async function AdminPOIsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter: "all" | PublishStatus =
    status === "draft" || status === "review" || status === "published"
      ? status
      : "all";

  const supabase = await createClient();
  let query = supabase
    .from("pois")
    .select("*, category:poi_categories(name), destination:destinations(name)")
    .order("name");
  if (filter !== "all") {
    query = query.eq("publish_status", filter);
  }
  const { data: pois } = await query;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold text-forest">POIs</h1>
        <div className="flex items-center gap-2">
          <Link href="/admin/imports">
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Imports
            </Button>
          </Link>
          <Link href="/admin/pois/new">
            <Button className="bg-forest text-cream hover:bg-forest-light">
              <Plus className="mr-2 h-4 w-4" />
              Add POI
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {STATUS_OPTIONS.map((opt) => {
          const active = opt === filter;
          const href =
            opt === "all" ? "/admin/pois" : `/admin/pois?status=${opt}`;
          return (
            <Link key={opt} href={href}>
              <Badge
                variant={active ? "default" : "secondary"}
                className={
                  active
                    ? "bg-forest text-cream hover:bg-forest"
                    : "cursor-pointer"
                }
              >
                {opt}
              </Badge>
            </Link>
          );
        })}
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
                Status
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
                <td className="p-3">
                  <PublishStatusBadge
                    status={(poi.publish_status as PublishStatus) ?? "draft"}
                  />
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
