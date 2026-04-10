// Reusable prompt + schema for POI draft generation.
//
// This module is pure: no I/O, no SDK imports. It can be unit-tested
// without any network or env vars. The wrapper that actually calls
// Claude lives in `./generate-poi-draft.ts`.

import { z } from "zod";

export const BEST_TIME_VALUES = [
  "morning",
  "midday",
  "afternoon",
  "evening",
  "night",
  "any",
] as const;

export const PoiDraftSchema = z.object({
  short_description: z.string().min(20).max(200),
  long_description: z.string().min(80).max(1200),
  suggested_tags: z.array(z.string().min(2).max(30)).min(1).max(8),
  best_time_of_day: z.enum(BEST_TIME_VALUES),
  suggested_duration_minutes: z.number().int().min(15).max(480),
  editorial_summary: z.string().min(40).max(400),
});

export type PoiDraft = z.infer<typeof PoiDraftSchema>;

export interface PoiPromptInput {
  name: string;
  destination: string; // destination name, e.g. "Bucharest"
  category: string; // category name, e.g. "Museums & Culture"
  tags?: string[];
  address?: string | null;
  duration_minutes?: number | null;
  price_level?: number | null; // 0..4
  family_friendly?: boolean;
  indoor?: boolean;
  accessible?: boolean;
}

const SYSTEM_PROMPT = `You are an editorial assistant for a Romania travel guide.
Your job is to draft useful, factual point-of-interest content that a
human editor will review before publishing.

Editorial rules — follow them strictly:
- Be concise and factual. Write for a tourist who needs to decide whether to visit.
- Do NOT be promotional. Avoid superlatives ("must-see", "world-class", "stunning") unless they are clearly justified by the inputs.
- Do NOT invent facts. If you are not sure about hours, prices, history, or specific claims, omit them rather than guess.
- Do not fabricate dates, names, or numbers. Generic context is fine ("a baroque-era church", "in the old town") but specific dates are not.
- Use neutral, encyclopedic English.
- Do not mention sources, the prompt, yourself, or the JSON format.

Output: a single JSON object that matches this exact shape and nothing else
(no markdown fences, no commentary):

{
  "short_description": string  // 20-200 chars, one sentence shown in cards
  "long_description":  string  // 80-1200 chars, 1-3 short paragraphs for the POI page
  "suggested_tags":    string[] // 1-8 short lowercase tags (2-30 chars each)
  "best_time_of_day":  one of "morning" | "midday" | "afternoon" | "evening" | "night" | "any"
  "suggested_duration_minutes": integer between 15 and 480
  "editorial_summary": string  // 40-400 chars, internal note for the editor explaining your choices and any uncertainty
}`;

function formatBool(v: boolean | undefined): string | null {
  if (v === undefined) return null;
  return v ? "yes" : "no";
}

function formatPriceLevel(level: number | null | undefined): string | null {
  if (level === null || level === undefined) return null;
  const labels = ["free", "$", "$$", "$$$", "$$$$"];
  return labels[level] ?? String(level);
}

/**
 * Render the prompt as a deterministic key/value list. Same input
 * always produces the same string, so the prompt builder is
 * snapshot-testable.
 */
export function buildPoiPrompt(input: PoiPromptInput): {
  system: string;
  user: string;
} {
  const lines: string[] = [];
  lines.push(`name: ${input.name}`);
  lines.push(`destination: ${input.destination}`);
  lines.push(`category: ${input.category}`);

  if (input.tags && input.tags.length > 0) {
    lines.push(`tags: ${input.tags.join(", ")}`);
  }
  if (input.address) {
    lines.push(`address: ${input.address}`);
  }
  if (input.duration_minutes != null) {
    lines.push(`current_duration_minutes: ${input.duration_minutes}`);
  }
  const price = formatPriceLevel(input.price_level);
  if (price !== null) {
    lines.push(`price_level: ${price}`);
  }
  const family = formatBool(input.family_friendly);
  if (family !== null) lines.push(`family_friendly: ${family}`);
  const indoor = formatBool(input.indoor);
  if (indoor !== null) lines.push(`indoor: ${indoor}`);
  const accessible = formatBool(input.accessible);
  if (accessible !== null) lines.push(`accessible: ${accessible}`);

  const user = `Draft POI content for the following point of interest. Use only the facts below — do not invent anything else.

${lines.join("\n")}

Respond with the JSON object only.`;

  return { system: SYSTEM_PROMPT, user };
}

/**
 * Parse a model response into a validated PoiDraft. Tolerates a stray
 * code fence or leading prose by extracting the first {...} block,
 * then runs Zod validation. Throws on any failure.
 */
export function parsePoiDraftResponse(text: string): PoiDraft {
  const trimmed = text.trim();
  let jsonText = trimmed;

  if (!trimmed.startsWith("{")) {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      throw new Error("No JSON object found in model response");
    }
    jsonText = trimmed.slice(start, end + 1);
  }

  let raw: unknown;
  try {
    raw = JSON.parse(jsonText);
  } catch (e) {
    throw new Error(`Model response was not valid JSON: ${(e as Error).message}`);
  }

  return PoiDraftSchema.parse(raw);
}
