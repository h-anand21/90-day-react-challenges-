/**
 * Shared helper: call any chat/text model through the Lovable AI Gateway,
 * OR call Google's Generative Language API directly for `google/*` models
 * when a `GOOGLE_API_KEY` is configured.
 *
 * All failure modes are surfaced as user-friendly `Error` messages so that
 * UI layers (SummaryPanel, AIChat, translation pipeline) can display them
 * verbatim without leaking raw HTTP details.
 */

const LOVABLE_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const GOOGLE_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export type GatewayMessage = { role: "system" | "user" | "assistant"; content: string };

export class GeminiKeyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeminiKeyError";
  }
}

export async function callGatewayChat(opts: {
  model: string;
  messages: GatewayMessage[];
  temperature?: number;
  jsonMode?: boolean;
}): Promise<string> {
  const isGoogleModel = opts.model.startsWith("google/");
  const googleKey = process.env.GOOGLE_API_KEY;
  const lovableKey = process.env.LOVABLE_API_KEY;

  // Prefer direct Google API for google/* models when GOOGLE_API_KEY is set.
  if (isGoogleModel && googleKey) {
    return callGoogleDirect({ ...opts, apiKey: googleKey });
  }

  // Fall back to Lovable AI Gateway.
  if (!lovableKey) {
    if (isGoogleModel) {
      throw new GeminiKeyError(
        "Google AI is not configured. Add your Google AI Studio API key as GOOGLE_API_KEY in project settings, then try again.",
      );
    }
    throw new Error("AI service is not configured. Please contact the site administrator.");
  }

  // GPT-5 family only supports the default temperature (1); omit the field for those models.
  const supportsTemperature = !/^openai\/gpt-5/.test(opts.model);
  let res: Response;
  try {
    res = await fetch(LOVABLE_GATEWAY, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": lovableKey },
      body: JSON.stringify({
        model: opts.model,
        messages: opts.messages,
        ...(supportsTemperature ? { temperature: opts.temperature ?? 0.3 } : {}),
        ...(opts.jsonMode ? { response_format: { type: "json_object" } } : {}),
      }),
    });
  } catch (err) {
    throw new Error("Could not reach the AI service. Check your internet connection and try again.");
  }

  if (res.status === 401 || res.status === 403) {
    throw new Error("AI service rejected the request (authentication failed). Please contact the site administrator.");
  }
  if (res.status === 429) throw new Error("The AI service is busy right now. Please wait a moment and try again.");
  if (res.status === 402) throw new Error("AI credits have run out. Please top up credits to continue.");
  if (!res.ok) throw new Error(`The AI service is temporarily unavailable (status ${res.status}). Please try again shortly.`);
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return json.choices?.[0]?.message?.content?.trim() ?? "";
}

async function callGoogleDirect(opts: {
  model: string;
  messages: GatewayMessage[];
  temperature?: number;
  jsonMode?: boolean;
  apiKey: string;
}): Promise<string> {
  // "google/gemini-2.5-flash" -> "gemini-2.5-flash"
  const modelId = opts.model.replace(/^google\//, "");

  const systemText = opts.messages
    .filter((m) => m.role === "system")
    .map((m) => m.content)
    .join("\n\n");
  const contents = opts.messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: opts.temperature ?? 0.3,
      ...(opts.jsonMode ? { responseMimeType: "application/json" } : {}),
    },
  };
  if (systemText) body.systemInstruction = { parts: [{ text: systemText }] };

  const url = `${GOOGLE_BASE}/${encodeURIComponent(modelId)}:generateContent`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": opts.apiKey },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new GeminiKeyError(
      "Could not reach Google AI. Check your internet connection and try again.",
    );
  }

  if (res.status === 400 || res.status === 401 || res.status === 403) {
    // Google returns 400 for malformed keys, 401/403 for invalid/expired ones.
    let detail = "";
    try {
      const j = (await res.json()) as { error?: { message?: string; status?: string } };
      detail = j?.error?.message ?? "";
    } catch {
      /* ignore */
    }
    const looksLikeKeyProblem =
      /API key|API_KEY|permission|unauthenticated|forbidden|invalid/i.test(detail) ||
      res.status !== 400;
    if (looksLikeKeyProblem) {
      throw new GeminiKeyError(
        "Your Google AI Studio API key (GOOGLE_API_KEY) is missing, invalid, or lacks access to Gemini. " +
          "Open Google AI Studio → Get API Key, then update GOOGLE_API_KEY in project settings.",
      );
    }
    throw new Error(`Google AI rejected the request: ${detail || "bad request"}.`);
  }
  if (res.status === 429) {
    throw new Error(
      "Google AI rate limit reached. Please wait a minute and try again, or upgrade your Google AI quota.",
    );
  }
  if (res.status >= 500) {
    throw new Error("Google AI is temporarily unavailable. Please try again in a few moments.");
  }
  if (!res.ok) {
    throw new Error(`Google AI request failed (status ${res.status}). Please try again.`);
  }

  const json = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
    promptFeedback?: { blockReason?: string };
  };
  if (json.promptFeedback?.blockReason) {
    throw new Error(
      `Google AI blocked this request (${json.promptFeedback.blockReason}). Try rephrasing the input.`,
    );
  }
  const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim() ?? "";
  return text;
}
