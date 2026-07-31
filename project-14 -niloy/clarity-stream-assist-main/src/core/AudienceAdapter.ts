/**
 * AudienceAdapter — rewrites an interpreted sentence for a specific audience
 * while preserving every factual detail. Runs AFTER interpretation and BEFORE
 * speech synthesis. Skipped when profile === "general".
 */

import type { AudienceProfile, IInterpretationProvider } from "@/lib/ai/interfaces";

const PROFILE_INSTRUCTIONS: Record<AudienceProfile, string> = {
  general: "",
  student_school:
    "Rewrite for a school student (ages 12–16). Use simple words and short sentences. Keep every fact.",
  student_university:
    "Rewrite for a university student. Assume some domain background; keep technical terms.",
  professional:
    "Rewrite for a working professional. Be concise and business-appropriate.",
  researcher:
    "Rewrite for a researcher. Preserve precision, technical nuance, and citations.",
  accessibility:
    "Rewrite for cognitive accessibility. Use plain language, short sentences, no idioms.",
};

class AudienceAdapterImpl {
  async adapt(input: {
    text: string;
    language: string;
    profile: AudienceProfile;
    interpreter: IInterpretationProvider;
  }): Promise<string> {
    if (input.profile === "general" || !input.text.trim()) return input.text;
    const instruction = PROFILE_INSTRUCTIONS[input.profile];
    // Route the adaptation through the interpretation provider by asking it
    // to "translate" the text to the SAME target language with an audience
    // instruction embedded in the sourceHint. This keeps the provider
    // interface stable — no new method needed.
    const [out] = await input.interpreter.translateBatch({
      sentences: [input.text],
      target: input.language,
      sourceHint: `${input.language}. AUDIENCE INSTRUCTION: ${instruction} Do not change factual content.`,
    });
    return out?.trim() || input.text;
  }
}

export const AudienceAdapter = new AudienceAdapterImpl();
