import type {
  IInterpretationValidator,
  InterpretationValidationInput,
  InterpretationValidationResult,
} from "../../interfaces";

/**
 * Zero-cost interpretation validator. Runs deterministic sanity checks:
 *   - non-empty
 *   - length ratio inside 0.4..2.5 of source (avoids truncation/hallucination)
 *   - KEEP_AS_IS terms preserved verbatim
 *   - not identical to source unless source language == target language
 */
export class HeuristicInterpretationValidator implements IInterpretationValidator {
  readonly name = "heuristic";
  isAvailable(): boolean { return true; }

  async validate(input: InterpretationValidationInput): Promise<InterpretationValidationResult> {
    const issues: string[] = [];
    const src = input.source.trim();
    const dst = input.translation.trim();

    if (!dst) issues.push("empty translation");
    else {
      const ratio = dst.length / Math.max(1, src.length);
      if (ratio < 0.4) issues.push(`too short (ratio ${ratio.toFixed(2)})`);
      if (ratio > 2.5) issues.push(`too long (ratio ${ratio.toFixed(2)})`);
      for (const term of input.glossary?.keepAsIs ?? []) {
        if (!term) continue;
        if (src.toLowerCase().includes(term.toLowerCase())
            && !dst.toLowerCase().includes(term.toLowerCase())) {
          issues.push(`missing term "${term}"`);
        }
      }
      if (input.sourceLanguage && input.targetLanguage
          && input.sourceLanguage.toLowerCase() !== input.targetLanguage.toLowerCase()
          && dst === src) {
        issues.push("translation identical to source");
      }
    }
    const score = Math.max(0, 1 - issues.length * 0.35);
    return { ok: issues.length === 0, score, issues };
  }
}
