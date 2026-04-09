"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { slugify } from "@/lib/utils";
import type { POI } from "@/types/database";

interface Props {
  poi?: POI;
  destinations: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}

export function AdminPOIForm({ poi, destinations, categories }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(poi?.name || "");
  const [slug, setSlug] = useState(poi?.slug || "");
  const [destinationId, setDestinationId] = useState(
    poi?.destination_id || destinations[0]?.id || ""
  );
  const [categoryId, setCategoryId] = useState(
    poi?.category_id || categories[0]?.id || ""
  );
  const [description, setDescription] = useState(poi?.description || "");
  const [address, setAddress] = useState(poi?.address || "");
  const [lat, setLat] = useState(poi?.lat?.toString() || "");
  const [lng, setLng] = useState(poi?.lng?.toString() || "");
  const [heroImageUrl, setHeroImageUrl] = useState(poi?.hero_image_url || "");
  const [rating, setRating] = useState(poi?.rating?.toString() || "");
  const [websiteUrl, setWebsiteUrl] = useState(poi?.website_url || "");
  const [phone, setPhone] = useState(poi?.phone || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const payload = {
      name,
      slug: slug || slugify(name),
      destination_id: destinationId,
      category_id: categoryId,
      description: description || null,
      address: address || null,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      hero_image_url: heroImageUrl || null,
      rating: rating ? parseFloat(rating) : null,
      website_url: websiteUrl || null,
      phone: phone || null,
    };

    if (poi) {
      await supabase.from("pois").update(payload).eq("id", poi.id);
    } else {
      await supabase.from("pois").insert(payload);
    }

    router.push("/admin/pois");
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
            if (!poi) setSlug(slugify(e.target.value));
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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="destination">Destination</Label>
          <select
            id="destination"
            value={destinationId}
            onChange={(e) => setDestinationId(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
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
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="mt-1.5"
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
      <div>
        <Label htmlFor="hero_image_url">Hero Image URL</Label>
        <Input
          id="hero_image_url"
          value={heroImageUrl}
          onChange={(e) => setHeroImageUrl(e.target.value)}
          className="mt-1.5"
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="rating">Rating (0-5)</Label>
          <Input
            id="rating"
            type="number"
            step="0.1"
            min="0"
            max="5"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1.5"
          />
        </div>
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="bg-forest text-cream hover:bg-forest-light"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {poi ? "Update" : "Create"} POI
      </Button>
    </form>
  );
}
