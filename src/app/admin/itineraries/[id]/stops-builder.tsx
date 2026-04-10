"use client";

// Manual itinerary stops builder. Add, remove, reorder POIs.
// Reorder uses HTML5 native drag-and-drop (no extra dependency).

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GripVertical, Trash2, Plus, Loader2, Save } from "lucide-react";

interface StopRow {
  id?: string; // undefined for newly-added stops
  poi_id: string;
  stop_order: number;
  notes: string | null;
  duration_minutes: number;
  poi_name: string;
}

interface Props {
  itineraryId: string;
  initialStops: StopRow[];
  allPois: { id: string; name: string; duration_minutes: number }[];
}

export function StopsBuilder({ itineraryId, initialStops, allPois }: Props) {
  const router = useRouter();
  const [stops, setStops] = useState<StopRow[]>(initialStops);
  const [addPoiId, setAddPoiId] = useState<string>(allPois[0]?.id ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const moveStop = (from: number, to: number) => {
    if (from === to || to < 0 || to >= stops.length) return;
    const next = [...stops];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setStops(next.map((s, i) => ({ ...s, stop_order: i + 1 })));
  };

  const addStop = () => {
    if (!addPoiId) return;
    const poi = allPois.find((p) => p.id === addPoiId);
    if (!poi) return;
    setStops([
      ...stops,
      {
        poi_id: poi.id,
        stop_order: stops.length + 1,
        notes: null,
        duration_minutes: poi.duration_minutes ?? 60,
        poi_name: poi.name,
      },
    ]);
  };

  const removeStop = (index: number) => {
    const next = stops.filter((_, i) => i !== index);
    setStops(next.map((s, i) => ({ ...s, stop_order: i + 1 })));
  };

  const updateStop = (index: number, patch: Partial<StopRow>) => {
    setStops(stops.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    const supabase = createClient();

    // Replace strategy: delete all existing rows for this itinerary, then
    // re-insert. Avoids unique-(itinerary_id, stop_order) collisions while
    // reordering.
    const { error: delErr } = await supabase
      .from("itinerary_stops")
      .delete()
      .eq("itinerary_id", itineraryId);
    if (delErr) {
      setError(delErr.message);
      setSaving(false);
      return;
    }

    if (stops.length > 0) {
      const { error: insErr } = await supabase.from("itinerary_stops").insert(
        stops.map((s, i) => ({
          itinerary_id: itineraryId,
          poi_id: s.poi_id,
          stop_order: i + 1,
          notes: s.notes,
          duration_minutes: s.duration_minutes,
        }))
      );
      if (insErr) {
        setError(insErr.message);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    router.refresh();
  };

  return (
    <div className="space-y-4 rounded-xl border border-border/40 bg-card p-6 max-w-3xl">
      {stops.length === 0 ? (
        <p className="text-sm text-muted-foreground">No stops yet.</p>
      ) : (
        <ul className="space-y-2">
          {stops.map((stop, i) => (
            <li
              key={`${stop.id ?? "new"}-${i}`}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex != null) moveStop(dragIndex, i);
                setDragIndex(null);
              }}
              className="flex items-center gap-3 rounded-md border border-border/40 bg-background p-3"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
              <span className="text-sm font-medium text-forest w-6">
                {i + 1}
              </span>
              <span className="flex-1 text-sm">{stop.poi_name}</span>
              <Input
                type="number"
                min="5"
                max="600"
                value={stop.duration_minutes}
                onChange={(e) =>
                  updateStop(i, {
                    duration_minutes: parseInt(e.target.value) || 60,
                  })
                }
                className="w-20 h-8"
                aria-label="Duration in minutes"
              />
              <Input
                value={stop.notes ?? ""}
                onChange={(e) =>
                  updateStop(i, { notes: e.target.value || null })
                }
                placeholder="notes"
                className="flex-1 h-8"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeStop(i)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-2 pt-2 border-t border-border/40">
        <select
          value={addPoiId}
          onChange={(e) => setAddPoiId(e.target.value)}
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {allPois.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <Button type="button" onClick={addStop} variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Add stop
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-md p-2">{error}</p>
      )}

      <Button
        type="button"
        onClick={save}
        disabled={saving}
        className="bg-forest text-cream hover:bg-forest-light"
      >
        {saving ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        Save stops
      </Button>
    </div>
  );
}
