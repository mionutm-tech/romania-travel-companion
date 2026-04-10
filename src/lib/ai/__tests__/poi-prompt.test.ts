import { describe, expect, it } from "vitest";
import {
  PoiDraftSchema,
  buildPoiPrompt,
  parsePoiDraftResponse,
  type PoiDraft,
  type PoiPromptInput,
} from "../poi-prompt";

const sampleInput: PoiPromptInput = {
  name: "Village Museum",
  destination: "Bucharest",
  category: "Museums & Culture",
  tags: ["outdoor", "history"],
  address: "Șoseaua Kiseleff 28-30",
  duration_minutes: 120,
  price_level: 1,
  family_friendly: true,
  indoor: false,
  accessible: true,
};

const validDraft: PoiDraft = {
  short_description:
    "An open-air museum showcasing traditional Romanian rural architecture.",
  long_description:
    "The Village Museum is an open-air ethnographic museum in northern Bucharest. It collects authentic peasant houses, churches, and workshops relocated from villages across Romania, arranged so visitors can walk through several centuries of rural life. Allow about two hours to see the main paths.",
  suggested_tags: ["museum", "outdoor", "history", "family"],
  best_time_of_day: "morning",
  suggested_duration_minutes: 120,
  editorial_summary:
    "Used the supplied address and category. Avoided specific founding dates since none were provided.",
};

describe("buildPoiPrompt", () => {
  it("is deterministic for the same input", () => {
    const a = buildPoiPrompt(sampleInput);
    const b = buildPoiPrompt(sampleInput);
    expect(a).toEqual(b);
  });

  it("includes the editorial rules in the system prompt", () => {
    const { system } = buildPoiPrompt(sampleInput);
    expect(system).toMatch(/do not invent facts/i);
    expect(system).toMatch(/concise and factual/i);
    expect(system).toMatch(/json/i);
  });

  it("includes only fields that are present in the user prompt", () => {
    const { user } = buildPoiPrompt({
      name: "Test",
      destination: "Cluj-Napoca",
      category: "Parks & Nature",
    });
    expect(user).toContain("name: Test");
    expect(user).toContain("destination: Cluj-Napoca");
    expect(user).toContain("category: Parks & Nature");
    expect(user).not.toContain("address:");
    expect(user).not.toContain("price_level:");
    expect(user).not.toContain("family_friendly:");
  });

  it("formats price_level using $ shorthand", () => {
    const { user } = buildPoiPrompt({ ...sampleInput, price_level: 3 });
    expect(user).toContain("price_level: $$$");
  });

  it("formats price_level: 0 as free", () => {
    const { user } = buildPoiPrompt({ ...sampleInput, price_level: 0 });
    expect(user).toContain("price_level: free");
  });
});

describe("PoiDraftSchema", () => {
  it("accepts a valid draft", () => {
    expect(() => PoiDraftSchema.parse(validDraft)).not.toThrow();
  });

  it("rejects a too-short short_description", () => {
    expect(() =>
      PoiDraftSchema.parse({ ...validDraft, short_description: "tiny" })
    ).toThrow();
  });

  it("rejects a too-long short_description", () => {
    expect(() =>
      PoiDraftSchema.parse({
        ...validDraft,
        short_description: "x".repeat(201),
      })
    ).toThrow();
  });

  it("rejects an invalid best_time_of_day enum value", () => {
    expect(() =>
      PoiDraftSchema.parse({ ...validDraft, best_time_of_day: "dawn" })
    ).toThrow();
  });

  it("rejects an empty suggested_tags array", () => {
    expect(() =>
      PoiDraftSchema.parse({ ...validDraft, suggested_tags: [] })
    ).toThrow();
  });

  it("rejects suggested_duration_minutes out of range", () => {
    expect(() =>
      PoiDraftSchema.parse({
        ...validDraft,
        suggested_duration_minutes: 1000,
      })
    ).toThrow();
  });

  it("rejects a non-integer suggested_duration_minutes", () => {
    expect(() =>
      PoiDraftSchema.parse({
        ...validDraft,
        suggested_duration_minutes: 60.5,
      })
    ).toThrow();
  });
});

describe("parsePoiDraftResponse", () => {
  it("parses a clean JSON object", () => {
    const text = JSON.stringify(validDraft);
    expect(parsePoiDraftResponse(text)).toEqual(validDraft);
  });

  it("tolerates leading prose around the JSON", () => {
    const text = `Sure! Here is the JSON:\n\n${JSON.stringify(validDraft)}\n\nLet me know.`;
    expect(parsePoiDraftResponse(text)).toEqual(validDraft);
  });

  it("throws on missing JSON", () => {
    expect(() => parsePoiDraftResponse("no json here")).toThrow();
  });

  it("throws on schema-invalid JSON", () => {
    const bad = { ...validDraft, best_time_of_day: "dawn" };
    expect(() => parsePoiDraftResponse(JSON.stringify(bad))).toThrow();
  });
});
