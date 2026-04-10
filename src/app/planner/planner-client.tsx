"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ActivityLevel,
  PlannerRequest,
  PlannerResult,
} from "@/types/database";
import { TripResult } from "@/components/planner/trip-result";
import { DebugPanel } from "@/components/planner/debug-panel";

interface PlannerProps {
  destinations: { id: string; name: string; slug: string }[];
  categories: { id: string; name: string; slug: string }[];
}

export function PlannerClient({ destinations, categories }: PlannerProps) {
  const [destinationId, setDestinationId] = useState<string>("");
  const [interests, setInterests] = useState<string[]>([]);
  const [days, setDays] = useState("3");
  const [budget, setBudget] = useState("2");
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [familyFriendly, setFamilyFriendly] = useState(false);
  const [indoorOnly, setIndoorOnly] = useState(false);
  const [accessible, setAccessible] = useState(false);

  const [result, setResult] = useState<PlannerResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleInterest = (slug: string) =>
    setInterests((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
    );

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    const payload: PlannerRequest = {
      destination_id: destinationId || undefined,
      duration_days: Math.max(1, Math.min(14, parseInt(days) || 3)),
      budget_level: Math.max(0, Math.min(4, parseInt(budget) || 2)),
      activity_level: activity,
      interests,
      constraints: {
        family_friendly: familyFriendly || undefined,
        indoor_only: indoorOnly || undefined,
        accessible: accessible || undefined,
      },
    };
    try {
      const res = await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to generate plan");
        setResult(null);
      } else {
        setResult(data);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <Label className="text-base font-semibold text-forest">
          Destination
        </Label>
        <p className="text-sm text-muted-foreground mb-3">
          Pick one — leave on &ldquo;Anywhere&rdquo; for a country-wide plan.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setDestinationId("")}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors border",
              destinationId === ""
                ? "bg-forest text-cream border-forest"
                : "bg-card text-muted-foreground border-border hover:border-forest/30"
            )}
          >
            Anywhere
          </button>
          {destinations.map((dest) => (
            <button
              key={dest.id}
              type="button"
              onClick={() => setDestinationId(dest.id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors border",
                destinationId === dest.id
                  ? "bg-forest text-cream border-forest"
                  : "bg-card text-muted-foreground border-border hover:border-forest/30"
              )}
            >
              {dest.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-semibold text-forest">
          Interests
        </Label>
        <p className="text-sm text-muted-foreground mb-3">
          Pick the categories you care about most.
        </p>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggleInterest(cat.slug)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors border",
                interests.includes(cat.slug)
                  ? "bg-gold text-forest border-gold"
                  : "bg-card text-muted-foreground border-border hover:border-gold/30"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="days" className="text-base font-semibold text-forest">
            Days
          </Label>
          <Input
            id="days"
            type="number"
            min="1"
            max="14"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className="mt-2"
          />
        </div>
        <div>
          <Label
            htmlFor="budget"
            className="text-base font-semibold text-forest"
          >
            Budget (0-4)
          </Label>
          <Input
            id="budget"
            type="number"
            min="0"
            max="4"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="mt-2"
          />
        </div>
        <div>
          <Label
            htmlFor="activity"
            className="text-base font-semibold text-forest"
          >
            Pace
          </Label>
          <select
            id="activity"
            value={activity}
            onChange={(e) => setActivity(e.target.value as ActivityLevel)}
            className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="low">Relaxed (3 stops/day)</option>
            <option value="moderate">Moderate (4 stops/day)</option>
            <option value="high">Packed (5 stops/day)</option>
          </select>
        </div>
      </div>

      <div>
        <Label className="text-base font-semibold text-forest">
          Constraints
        </Label>
        <div className="flex flex-wrap gap-4 mt-3 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={familyFriendly}
              onChange={(e) => setFamilyFriendly(e.target.checked)}
            />
            Family friendly only
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={indoorOnly}
              onChange={(e) => setIndoorOnly(e.target.checked)}
            />
            Indoor only
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={accessible}
              onChange={(e) => setAccessible(e.target.checked)}
            />
            Accessible only
          </label>
        </div>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full sm:w-auto bg-forest text-cream hover:bg-forest-light"
        size="lg"
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-4 w-4" />
        )}
        Generate itinerary
      </Button>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-md p-3">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-8">
          <h2 className="font-serif text-2xl font-bold text-forest mb-4">
            Your itinerary
          </h2>
          <TripResult result={result} />
          <DebugPanel result={result} />
        </div>
      )}
    </div>
  );
}
