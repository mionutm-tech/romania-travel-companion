"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlannerProps {
  destinations: { id: string; name: string; slug: string }[];
  categories: { id: string; name: string; slug: string }[];
}

interface SuggestedPOI {
  id: string;
  name: string;
  slug: string;
  category_name: string;
  destination_name: string;
}

export function PlannerClient({ destinations, categories }: PlannerProps) {
  const [selectedDests, setSelectedDests] = useState<string[]>([]);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [days, setDays] = useState("3");
  const [results, setResults] = useState<SuggestedPOI[] | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleDest = (id: string) =>
    setSelectedDests((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );

  const toggleCat = (id: string) =>
    setSelectedCats((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination_ids: selectedDests,
          category_ids: selectedCats,
          days: parseInt(days) || 3,
        }),
      });
      const data = await res.json();
      setResults(data.suggestions || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Destinations */}
      <div>
        <Label className="text-base font-semibold text-forest">
          Where do you want to go?
        </Label>
        <p className="text-sm text-muted-foreground mb-3">
          Select one or more destinations.
        </p>
        <div className="flex flex-wrap gap-2">
          {destinations.map((dest) => (
            <button
              key={dest.id}
              onClick={() => toggleDest(dest.id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors border",
                selectedDests.includes(dest.id)
                  ? "bg-forest text-cream border-forest"
                  : "bg-card text-muted-foreground border-border hover:border-forest/30"
              )}
            >
              {dest.name}
            </button>
          ))}
        </div>
      </div>

      {/* Interests */}
      <div>
        <Label className="text-base font-semibold text-forest">
          What are you interested in?
        </Label>
        <p className="text-sm text-muted-foreground mb-3">
          Pick the categories that excite you.
        </p>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => toggleCat(cat.id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors border",
                selectedCats.includes(cat.id)
                  ? "bg-gold text-forest border-gold"
                  : "bg-card text-muted-foreground border-border hover:border-gold/30"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div>
        <Label htmlFor="days" className="text-base font-semibold text-forest">
          How many days?
        </Label>
        <Input
          id="days"
          type="number"
          min="1"
          max="14"
          value={days}
          onChange={(e) => setDays(e.target.value)}
          className="mt-2 w-32"
        />
      </div>

      {/* Generate */}
      <Button
        onClick={handleGenerate}
        disabled={loading || (selectedDests.length === 0 && selectedCats.length === 0)}
        className="w-full sm:w-auto bg-forest text-cream hover:bg-forest-light"
        size="lg"
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-4 w-4" />
        )}
        Generate Itinerary
      </Button>

      {/* Results */}
      {results !== null && (
        <div className="mt-8">
          <h2 className="font-serif text-2xl font-bold text-forest mb-4">
            {results.length > 0
              ? "Your Suggested Itinerary"
              : "No Results"}
          </h2>
          {results.length === 0 ? (
            <p className="text-muted-foreground">
              No matching places found. Try broadening your selection.
            </p>
          ) : (
            <div className="space-y-3">
              {results.map((poi, idx) => (
                <Link key={poi.id} href={`/pois/${poi.slug}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest text-cream text-sm font-bold">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-forest">
                          {poi.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {poi.destination_name}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {poi.category_name}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
