"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles } from "lucide-react";
import { slugify } from "@/lib/utils";
import type {
  POI,
  PublishStatus,
  DataQualityStatus,
  BestTimeOfDay,
} from "@/types/database";
import type { PoiDraft } from "@/lib/ai/poi-prompt";

interface Props {
  poi?: POI;
  destinations: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}

export function AdminPOIForm({ poi, destinations, categories }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(poi?.name || "");
  const [slug, setSlug] = useState(poi?.slug || "");
  const [destinationId, setDestinationId] = useState(
    poi?.destination_id || destinations[0]?.id || ""
  );
  const [categoryId, setCategoryId] = useState(
    poi?.category_id || categories[0]?.id || ""
  );
  const [description, setDescription] = useState(poi?.description || "");
  const [shortDescription, setShortDescription] = useState(
    poi?.short_description || ""
  );
  const [address, setAddress] = useState(poi?.address || "");
  const [lat, setLat] = useState(poi?.lat?.toString() || "");
  const [lng, setLng] = useState(poi?.lng?.toString() || "");
  const [heroImageUrl, setHeroImageUrl] = useState(poi?.hero_image_url || "");
  const [rating, setRating] = useState(poi?.rating?.toString() || "");
  const [websiteUrl, setWebsiteUrl] = useState(poi?.website_url || "");
  const [phone, setPhone] = useState(poi?.phone || "");

  const [durationMinutes, setDurationMinutes] = useState(
    poi?.duration_minutes?.toString() || "60"
  );
  const [priceLevel, setPriceLevel] = useState(
    poi?.price_level?.toString() || "0"
  );
  const [familyFriendly, setFamilyFriendly] = useState(
    poi?.family_friendly ?? true
  );
  const [indoor, setIndoor] = useState(poi?.indoor ?? false);
  const [accessible, setAccessible] = useState(poi?.accessible ?? false);
  const [featuredScore, setFeaturedScore] = useState(
    poi?.featured_score?.toString() || "0"
  );
  const [bestTimeOfDay, setBestTimeOfDay] = useState<BestTimeOfDay>(
    poi?.best_time_of_day || "any"
  );
  const [publishStatus, setPublishStatus] = useState<PublishStatus>(
    poi?.publish_status || "draft"
  );
  const [dataQualityStatus, setDataQualityStatus] = useState<DataQualityStatus>(
    poi?.data_quality_status || "raw"
  );

  // AI draft assistant state. The panel only shows after a successful
  // /generate-draft call. Applying a suggestion only updates form
  // state — the admin still has to click Update POI to persist.
  const [aiDraft, setAiDraft] = useState<PoiDraft | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const canGenerate = name.trim() !== "" && destinationId !== "" && categoryId !== "";

  const handleGenerateDraft = async () => {
    if (!canGenerate) {
      setAiError("Name, destination, and category are required.");
      return;
    }
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch(`/api/pois/generate-draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          destination_id: destinationId,
          category_id: categoryId,
          address: address || null,
          duration_minutes: parseInt(durationMinutes) || null,
          price_level: parseInt(priceLevel) || 0,
          family_friendly: familyFriendly,
          indoor,
          accessible,
          poi_id: poi?.id,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        const issueText = json.issues
          ? `: ${json.issues
              .map(
                (i: { path: (string | number)[]; message: string }) =>
                  `${i.path.join(".")} ${i.message}`
              )
              .join("; ")}`
          : "";
        setAiError(
          `${json.error || `Request failed (${res.status})`}${issueText}`
        );
        return;
      }
      setAiDraft(json.draft as PoiDraft);
    } catch (e) {
      setAiError((e as Error).message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      name,
      slug: slug || slugify(name),
      destination_id: destinationId,
      category_id: categoryId,
      description: description || null,
      short_description: shortDescription || null,
      address: address || null,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      hero_image_url: heroImageUrl || null,
      rating: rating ? parseFloat(rating) : null,
      website_url: websiteUrl || null,
      phone: phone || null,
      duration_minutes: parseInt(durationMinutes) || 60,
      price_level: parseInt(priceLevel) || 0,
      family_friendly: familyFriendly,
      indoor,
      accessible,
      featured_score: parseInt(featuredScore) || 0,
      best_time_of_day: bestTimeOfDay,
      publish_status: publishStatus,
      data_quality_status: dataQualityStatus,
    };

    const url = poi ? `/api/pois/${poi.id}` : `/api/pois`;
    const method = poi ? "PATCH" : "POST";

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

    router.push("/admin/pois");
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl space-y-4 rounded-xl border border-border/40 bg-card p-6"
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
        <Label htmlFor="short_description">Short description (1 line)</Label>
        <Input
          id="short_description"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          maxLength={200}
          className="mt-1.5"
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
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

      <div className="border-t border-border/40 pt-4">
        <h3 className="font-semibold text-forest mb-3">Planner attributes</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="duration_minutes">Duration (minutes)</Label>
            <Input
              id="duration_minutes"
              type="number"
              min="5"
              max="600"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="price_level">Price level (0-4)</Label>
            <Input
              id="price_level"
              type="number"
              min="0"
              max="4"
              value={priceLevel}
              onChange={(e) => setPriceLevel(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="featured_score">Featured score (0-100)</Label>
            <Input
              id="featured_score"
              type="number"
              min="0"
              max="100"
              value={featuredScore}
              onChange={(e) => setFeaturedScore(e.target.value)}
              className="mt-1.5"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <Label htmlFor="best_time_of_day">Best time of day</Label>
            <select
              id="best_time_of_day"
              value={bestTimeOfDay}
              onChange={(e) =>
                setBestTimeOfDay(e.target.value as BestTimeOfDay)
              }
              className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {(
                [
                  "any",
                  "morning",
                  "midday",
                  "afternoon",
                  "evening",
                  "night",
                ] as BestTimeOfDay[]
              ).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-end gap-3 pb-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={familyFriendly}
                onChange={(e) => setFamilyFriendly(e.target.checked)}
              />
              Family friendly
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={indoor}
                onChange={(e) => setIndoor(e.target.checked)}
              />
              Indoor
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={accessible}
                onChange={(e) => setAccessible(e.target.checked)}
              />
              Accessible
            </label>
          </div>
        </div>
      </div>

      <div className="border-t border-border/40 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-forest">AI draft assistant</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerateDraft}
            disabled={aiLoading || !canGenerate}
          >
            {aiLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Generate draft
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mb-2">
          Fill in name, destination, and category first. Then Claude
          will draft a suggested set of editorial values from those
          inputs. Suggestions are <strong>never auto-applied</strong> —
          click <em>Apply</em> on each field you want, then save.
        </p>
          {aiError && (
            <p className="text-sm text-red-600 bg-red-50 rounded-md p-2 mb-2">
              {aiError}
            </p>
          )}
          {aiDraft && (
            <div className="space-y-3 rounded-md border border-border/40 bg-muted/30 p-3">
              <DraftField
                label="Short description"
                value={aiDraft.short_description}
                onApply={() => setShortDescription(aiDraft.short_description)}
              />
              <DraftField
                label="Long description"
                value={aiDraft.long_description}
                onApply={() => setDescription(aiDraft.long_description)}
                multiline
              />
              <DraftField
                label="Best time of day"
                value={aiDraft.best_time_of_day}
                onApply={() =>
                  setBestTimeOfDay(aiDraft.best_time_of_day as BestTimeOfDay)
                }
              />
              <DraftField
                label="Suggested duration (min)"
                value={String(aiDraft.suggested_duration_minutes)}
                onApply={() =>
                  setDurationMinutes(String(aiDraft.suggested_duration_minutes))
                }
              />
              <DraftField
                label="Suggested tags"
                value={aiDraft.suggested_tags.join(", ")}
                hint="Reference only — no matching POI field yet."
              />
              <DraftField
                label="Editorial summary"
                value={aiDraft.editorial_summary}
                hint="Internal note from the model. Reference only."
                multiline
              />
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setAiDraft(null)}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          )}
      </div>

      <div className="border-t border-border/40 pt-4">
        <h3 className="font-semibold text-forest mb-3">Lifecycle</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="publish_status">Publish status</Label>
            <select
              id="publish_status"
              value={publishStatus}
              onChange={(e) =>
                setPublishStatus(e.target.value as PublishStatus)
              }
              className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="draft">draft</option>
              <option value="review">review</option>
              <option value="published">published</option>
            </select>
          </div>
          <div>
            <Label htmlFor="data_quality_status">Data quality</Label>
            <select
              id="data_quality_status"
              value={dataQualityStatus}
              onChange={(e) =>
                setDataQualityStatus(e.target.value as DataQualityStatus)
              }
              className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="raw">raw</option>
              <option value="enriched">enriched</option>
              <option value="reviewed">reviewed</option>
            </select>
          </div>
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
        {poi ? "Update" : "Create"} POI
      </Button>
    </form>
  );
}

function DraftField({
  label,
  value,
  onApply,
  hint,
  multiline,
}: {
  label: string;
  value: string;
  onApply?: () => void;
  hint?: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        {onApply && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={onApply}
          >
            Apply
          </Button>
        )}
      </div>
      <p
        className={`text-sm text-foreground whitespace-pre-wrap ${
          multiline ? "" : ""
        }`}
      >
        {value}
      </p>
      {hint && (
        <p className="text-xs text-muted-foreground mt-1 italic">{hint}</p>
      )}
    </div>
  );
}
