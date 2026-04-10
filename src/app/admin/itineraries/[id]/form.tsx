"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { slugify } from "@/lib/utils";
import type { Itinerary } from "@/types/database";

export function AdminItineraryForm({
  itinerary,
}: {
  itinerary?: Itinerary;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState(itinerary?.title || "");
  const [slug, setSlug] = useState(itinerary?.slug || "");
  const [description, setDescription] = useState(itinerary?.description || "");
  const [heroImageUrl, setHeroImageUrl] = useState(
    itinerary?.hero_image_url || ""
  );
  const [durationDays, setDurationDays] = useState(
    itinerary?.duration_days?.toString() || "1"
  );
  const [difficulty, setDifficulty] = useState(
    itinerary?.difficulty || "easy"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      title,
      slug: slug || slugify(title),
      description: description || null,
      hero_image_url: heroImageUrl || null,
      duration_days: parseInt(durationDays) || 1,
      difficulty,
    };

    const url = itinerary
      ? `/api/itineraries/${itinerary.id}`
      : `/api/itineraries`;
    const method = itinerary ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error || `Request failed (${res.status})`);
        setLoading(false);
        return;
      }
    } catch (e) {
      setError((e as Error).message || "Unknown error");
      setLoading(false);
      return;
    }

    router.push("/admin/itineraries");
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg space-y-4 rounded-xl border border-border/40 bg-card p-6"
    >
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!itinerary) setSlug(slugify(e.target.value));
          }}
          required
          className="mt-1.5"
        />
      </div>
      <div>
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
          className="mt-1.5"
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <div>
        <Label htmlFor="hero_image_url">Hero Image URL</Label>
        <Input
          id="hero_image_url"
          value={heroImageUrl}
          onChange={(e) => setHeroImageUrl(e.target.value)}
          className="mt-1.5"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="duration_days">Duration (days)</Label>
          <Input
            id="duration_days"
            type="number"
            min="1"
            value={durationDays}
            onChange={(e) => setDurationDays(e.target.value)}
            required
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="difficulty">Difficulty</Label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as "easy" | "moderate" | "challenging")}
            className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="easy">Easy</option>
            <option value="moderate">Moderate</option>
            <option value="challenging">Challenging</option>
          </select>
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-md p-2">
          {error}
        </p>
      )}
      <Button
        type="submit"
        disabled={loading}
        className="bg-forest text-cream hover:bg-forest-light"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {itinerary ? "Update" : "Create"} Itinerary
      </Button>
    </form>
  );
}
