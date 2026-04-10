// Anthropic helper that turns a PoiPromptInput into a validated
// PoiDraft. Boring on purpose: no retries, no streaming, no caching.
//
// Throws MissingApiKeyError if ANTHROPIC_API_KEY is not set so the
// API route can return 503 with a clear message instead of leaking
// an SDK error.

import Anthropic from "@anthropic-ai/sdk";
import {
  buildPoiPrompt,
  parsePoiDraftResponse,
  type PoiDraft,
  type PoiPromptInput,
} from "./poi-prompt";

export class MissingApiKeyError extends Error {
  constructor() {
    super("ANTHROPIC_API_KEY is not set");
    this.name = "MissingApiKeyError";
  }
}

const DEFAULT_MODEL = "claude-sonnet-4-6";

export async function generatePoiDraft(
  input: PoiPromptInput,
  opts: { model?: string } = {}
): Promise<PoiDraft> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new MissingApiKeyError();

  const client = new Anthropic({ apiKey });
  const { system, user } = buildPoiPrompt(input);

  const response = await client.messages.create({
    model: opts.model ?? DEFAULT_MODEL,
    max_tokens: 1500,
    system,
    messages: [{ role: "user", content: user }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Model returned no text content");
  }

  return parsePoiDraftResponse(textBlock.text);
}
