"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { slugify } from "@/lib/utils";
import type { Destination } from "@/types/database";

export function AdminDestinationForm({
  destination,
}: {
  destination?: Destination;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(destination?.name || "");
  const [slug, setSlug] = useState(destination?.slug || "");
  const [description, setDescription] = useState(
    destination?.description || ""
  );
  const [heroImageUrl, setHeroImageUrl] = useState(
    destination?.hero_image_url || ""
  );
  const [lat, setLat] = useState(destination?.lat?.toString() || "");
  const [lng, setLng] = useState(destination?.lng?.toString() || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      name,
      slug: slug || slugify(name),
      description: description || null,
      hero_image_url: heroImageUrl || null,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
    };

    const url = destination
      ? `/api/destinations/${destination.id}`
      : `/api/destinations`;
    const method = destination ? "PATCH" : "POST";

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

    router.push("/admin/destinations");
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg space-y-4 rounded-xl border border-border/40 bg-card p-6"
    >
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!destination) setSlug(slugify(e.target.value));
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
          placeholder="https://images.unsplash.com/..."
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="lat">Latitude</Label>
          <Input
            id="lat"
            type="number"
            step="any"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            required
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="lng">Longitude</Label>
          <Input
            id="lng"
            type="number"
            step="any"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            required
            className="mt-1.5"
          />
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
        {destination ? "Update" : "Create"} Destination
      </Button>
    </form>
  );
}
