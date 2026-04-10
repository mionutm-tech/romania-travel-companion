"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin } from "lucide-react";
import type { PlannerResult } from "@/types/database";

export function TripResult({ result }: { result: PlannerResult }) {
  if (result.stops.length === 0) {
    return (
      <p className="text-muted-foreground">
        No matching POIs. Try relaxing your constraints or picking different
        interests.
      </p>
    );
  }

  // group by day
  const days = new Map<number, typeof result.stops>();
  for (const stop of result.stops) {
    if (!days.has(stop.day_number)) days.set(stop.day_number, []);
    days.get(stop.day_number)!.push(stop);
  }

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-border/40 bg-card p-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Trip fit score</span>
        <span className="font-serif text-2xl font-bold text-forest">
          {result.fit_score}/100
        </span>
      </div>

      {Array.from(days.entries()).map(([day, stops]) => {
        const summary = result.debug.day_summaries.find((d) => d.day === day);
        return (
          <div key={day}>
            <h3 className="font-serif text-xl font-bold text-forest mb-1">
              Day {day}
            </h3>
            {summary && (
              <p className="text-xs text-muted-foreground mb-3">
                {Math.round(summary.total_minutes / 60)}h activity ·{" "}
                {summary.total_km}km between stops
              </p>
            )}
            <div className="space-y-2">
              {stops.map((stop) => (
                <Link
                  key={`${stop.day_number}-${stop.stop_order}`}
                  href={`/pois/${stop.poi.slug}`}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest text-cream text-sm font-bold">
                        {stop.stop_order}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-forest">
                          {stop.poi.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {stop.start_time} · {stop.duration_minutes}min
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {stop.poi.destination.name}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {stop.poi.category.name}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
