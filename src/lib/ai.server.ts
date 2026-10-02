import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage } from "ai";

const MODEL = "openai/gpt-6-astra";
const BASE_URL = "https://ai.gateway.lovable.dev/v1";

function friendlyError(err: unknown): string {
  const e = err as { statusCode?: number; status?: number; message?: string; lastError?: { statusCode?: number } };
  const status = e?.statusCode ?? e?.status ?? e?.lastError?.statusCode;
  if (status === 429) return "The AI is busy right now. Please wait a moment and try again.";
  if (status === 402) return "AI credits have run out for this workspace. Please add credits to continue.";
  if (status === 403) return "AI access is currently blocked for this workspace.";
  if (status === 401) return "The AI service is not configured correctly.";
  return "The AI could not generate a response. Please try again.";
}

/** Streams a Responses call through Lovable AI Gateway and returns the final text. */
export async function runAI(system: string, messages: ModelMessage[]): Promise<string> {
  const apiKey = process.env['LOVABLE_API_KEY'];
  if (!apiKey) throw new Error("The AI service is not configured.");
  const provider = createOpenAI({
    baseURL: BASE_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });
  let streamError: unknown;
  try {
    const result = streamText({
      model: provider.responses(MODEL),
      system,
      messages,
      maxRetries: 1,
      onError: ({ error }) => {
        streamError = error;
      },
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    });
    const text = (await result.text).trim();
    if (streamError) throw streamError;
    if (!text) throw new Error("empty");
    return text;
  } catch (err) {
    console.error("AI gateway error", err);
    throw new Error(friendlyError(streamError ?? err));
  }
}

/** Fetches a web page and returns readable text (truncated). */
export async function fetchPageText(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; WorkplaceAssistant/1.0)", Accept: "text/html,text/plain,*/*" },
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return `[Could not open link: HTTP ${res.status}]`;
    const raw = await res.text();
    const text = raw
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&#39;|&apos;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, " ")
      .trim();
    return text.slice(0, 12000) || "[Link opened but no readable text found]";
  } catch {
    return "[Could not open link: the site did not respond]";
  }
}
