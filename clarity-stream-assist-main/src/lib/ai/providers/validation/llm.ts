import type {
  IInterpretationValidator,
  InterpretationValidationInput,
  InterpretationValidationResult,
} from "../../interfaces";
import { callGatewayChat } from "../text-gateway";

/**
 * Optional LLM-based validator. Slower and more expensive; enable by setting
 * VALIDATION_MODE=llm. Judges the translation on meaning, tone and completeness.
 */
export class LLMInterpretationValidator implements IInterpretationValidator {
  readonly name = "llm";
  private model = "google/gemini-2.5-flash-lite";

  isAvailable(): boolean { return !!process.env.LOVABLE_API_KEY; }

  async validate(input: InterpretationValidationInput): Promise<InterpretationValidationResult> {
    const raw = await callGatewayChat({
      model: this.model,
      temperature: 0,
      jsonMode: true,
      messages: [
        {
          role: "system",
          content:
            "You are a translation QA judge. Score the translation on meaning preservation, " +
            "tone, and completeness. Return STRICT JSON: " +
            '{"ok":<bool>,"score":<0..1>,"issues":[<string>]}.',
        },
        {
          role: "user",
          content:
            `SOURCE (${input.sourceLanguage ?? "auto"}): ${input.source}\n` +
            `TRANSLATION (${input.targetLanguage}): ${input.translation}`,
        },
      ],
    });
    try {
      const parsed = JSON.parse(raw);
      return {
        ok: Boolean(parsed.ok),
        score: Number(parsed.score ?? 0.5),
        issues: Array.isArray(parsed.issues) ? parsed.issues.map(String) : [],
      };
    } catch {
      return { ok: true, score: 0.5, issues: [] };
    }
  }
}
