// CSV/JSON importer for POI bulk upload.
//
// Required columns: name, destination_slug, category_slug, lat, lng
// Optional columns: slug, description, short_description, address,
//   hero_image_url, rating, website_url, phone, duration_minutes,
//   price_level, family_friendly, indoor, accessible, featured_score,
//   best_time_of_day
//
// All imported POIs are inserted with publish_status='draft' and
// data_quality_status='raw' so an admin must explicitly publish them.

import { slugify } from "./utils";

export interface ParsedRow {
  raw: Record<string, string>;
  parsed?: ParsedPOI;
  error?: string;
}

export interface ParsedPOI {
  name: string;
  slug: string;
  destination_slug: string;
  category_slug: string;
  description: string | null;
  short_description: string | null;
  address: string | null;
  lat: number;
  lng: number;
  hero_image_url: string | null;
  rating: number | null;
  website_url: string | null;
  phone: string | null;
  duration_minutes: number;
  price_level: number;
  family_friendly: boolean;
  indoor: boolean;
  accessible: boolean;
  featured_score: number;
  best_time_of_day: string;
}

// ---------- CSV parsing (RFC-4180 ish) ----------

export function parseCsv(text: string): Record<string, string>[] {
  const rows = csvToRows(text);
  if (rows.length === 0) return [];
  const header = rows[0].map((h) => h.trim());
  return rows.slice(1).map((row) => {
    const obj: Record<string, string> = {};
    header.forEach((key, i) => {
      obj[key] = (row[i] ?? "").trim();
    });
    return obj;
  });
}

function csvToRows(text: string): string[][] {
  const out: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let i = 0;
  let inQuotes = false;
  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += ch;
      i++;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (ch === ",") {
      cur.push(field);
      field = "";
      i++;
      continue;
    }
    if (ch === "\n" || ch === "\r") {
      cur.push(field);
      field = "";
      // skip blank lines
      if (cur.length > 1 || cur[0] !== "") out.push(cur);
      cur = [];
      // skip \r\n pair
      if (ch === "\r" && text[i + 1] === "\n") i += 2;
      else i++;
      continue;
    }
    field += ch;
    i++;
  }
  // flush last field/row
  if (field.length > 0 || cur.length > 0) {
    cur.push(field);
    if (cur.length > 1 || cur[0] !== "") out.push(cur);
  }
  return out;
}

// ---------- JSON parsing ----------

export function parseJson(text: string): Record<string, string>[] {
  const data = JSON.parse(text);
  if (!Array.isArray(data)) {
    throw new Error("JSON import must be an array of objects");
  }
  return data.map((item) => {
    const obj: Record<string, string> = {};
    if (item && typeof item === "object") {
      for (const [k, v] of Object.entries(item)) {
        obj[k] = v == null ? "" : String(v);
      }
    }
    return obj;
  });
}

// ---------- Validation ----------

const REQUIRED = ["name", "destination_slug", "category_slug", "lat", "lng"];

function asBool(v: string | undefined, fallback: boolean): boolean {
  if (v == null || v === "") return fallback;
  const s = v.toLowerCase().trim();
  return s === "true" || s === "1" || s === "yes" || s === "y";
}

function asInt(v: string | undefined, fallback: number): number {
  if (v == null || v === "") return fallback;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

function asFloat(v: string | undefined): number | null {
  if (v == null || v === "") return null;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

const VALID_TIMES = new Set([
  "morning",
  "midday",
  "afternoon",
  "evening",
  "night",
  "any",
]);

export function validateRow(raw: Record<string, string>): ParsedRow {
  for (const k of REQUIRED) {
    if (!raw[k] || raw[k].trim() === "") {
      return { raw, error: `Missing required field "${k}"` };
    }
  }
  const lat = parseFloat(raw.lat);
  const lng = parseFloat(raw.lng);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    return { raw, error: `Invalid lat "${raw.lat}"` };
  }
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    return { raw, error: `Invalid lng "${raw.lng}"` };
  }
  const rating = asFloat(raw.rating);
  if (rating != null && (rating < 0 || rating > 5)) {
    return { raw, error: `Rating must be 0-5, got "${raw.rating}"` };
  }
  const priceLevel = asInt(raw.price_level, 0);
  if (priceLevel < 0 || priceLevel > 4) {
    return { raw, error: `price_level must be 0-4, got "${raw.price_level}"` };
  }
  const featuredScore = asInt(raw.featured_score, 0);
  if (featuredScore < 0 || featuredScore > 100) {
    return {
      raw,
      error: `featured_score must be 0-100, got "${raw.featured_score}"`,
    };
  }
  const bestTime = (raw.best_time_of_day || "any").trim();
  if (!VALID_TIMES.has(bestTime)) {
    return { raw, error: `Invalid best_time_of_day "${bestTime}"` };
  }

  const parsed: ParsedPOI = {
    name: raw.name.trim(),
    slug: (raw.slug && raw.slug.trim()) || slugify(raw.name),
    destination_slug: raw.destination_slug.trim(),
    category_slug: raw.category_slug.trim(),
    description: raw.description?.trim() || null,
    short_description: raw.short_description?.trim() || null,
    address: raw.address?.trim() || null,
    lat,
    lng,
    hero_image_url: raw.hero_image_url?.trim() || null,
    rating,
    website_url: raw.website_url?.trim() || null,
    phone: raw.phone?.trim() || null,
    duration_minutes: asInt(raw.duration_minutes, 60),
    price_level: priceLevel,
    family_friendly: asBool(raw.family_friendly, true),
    indoor: asBool(raw.indoor, false),
    accessible: asBool(raw.accessible, false),
    featured_score: featuredScore,
    best_time_of_day: bestTime,
  };
  return { raw, parsed };
}

export function validateAll(rows: Record<string, string>[]): ParsedRow[] {
  return rows.map(validateRow);
}
