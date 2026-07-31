import type { ILanguageDetectionProvider, LanguageDetectionResult } from "../../interfaces";
import { callGatewayChat } from "../text-gateway";

/**
 * LLM-based language detection. Works on text (transcripts) and returns a
 * simple {language, confidence} tuple. Cheap, model-agnostic.
 */
export class GeminiLanguageDetectionProvider implements ILanguageDetectionProvider {
  readonly name = "gemini";
  private model = "google/gemini-2.5-flash-lite";

  isAvailable(): boolean { return !!process.env.LOVABLE_API_KEY || !!process.env.GOOGLE_API_KEY; }

  async detect({ text }: { text?: string }): Promise<LanguageDetectionResult> {
    if (!text || text.trim().length < 2) {
      return { language: "unknown", confidence: 0 };
    }
    const raw = await callGatewayChat({
      model: this.model,
      temperature: 0,
      jsonMode: true,
      messages: [
        {
          role: "system",
          content:
            "Identify the primary human language of the input. " +
            'Return STRICT JSON: {"language":"<English name>","confidence":<0..1>,"mixed":<bool>}. ' +
            "Use the English language name (e.g. English, Hindi, Spanish, Mandarin Chinese).",
        },
        { role: "user", content: text.slice(0, 1000) },
      ],
    });
    try {
      const parsed = JSON.parse(raw);
      return {
        language: String(parsed.language ?? "unknown"),
        confidence: Number(parsed.confidence ?? 0.5),
        mixed: Boolean(parsed.mixed),
      };
    } catch {
      return { language: "unknown", confidence: 0 };
    }
  }
}
