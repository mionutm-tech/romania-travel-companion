import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Landmark, Route, Users } from "lucide-react";

export default async function AdminPage() {
  const supabase = await createClient();

  const [
    { count: destCount },
    { count: poiCount },
    { count: itinCount },
    { count: userCount },
  ] = await Promise.all([
    supabase.from("destinations").select("*", { count: "exact", head: true }),
    supabase.from("pois").select("*", { count: "exact", head: true }),
    supabase.from("itineraries").select("*", { count: "exact", head: true }),
    supabase.from("users").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "Destinations", count: destCount || 0, icon: MapPin },
    { label: "POIs", count: poiCount || 0, icon: Landmark },
    { label: "Itineraries", count: itinCount || 0, icon: Route },
    { label: "Users", count: userCount || 0, icon: Users },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-forest mb-8">
        Dashboard
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest/5">
                <stat.icon className="h-6 w-6 text-forest" />
              </div>
              <div>
                <p className="text-2xl font-bold text-forest">{stat.count}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
