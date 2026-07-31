/**
 * Language-aware transcript refinement.
 *
 * Runs on the client after the STT provider returns a finalized segment.
 * All per-language behaviour (fillers, sentence terminator, capitalization
 * rules, sentence splitter) is read from `LanguageQualityRegistry` so every
 * supported language — Latin, Devanagari, Arabic, CJK, Thai, etc. — gets
 * the same quality treatment. Unlisted languages fall back to a
 * script-inferred profile.
 *
 * Never invents information. If unsure, leaves the text alone.
 * The RAW original is preserved by the caller in `segment.meta.raw`.
 */

import { LanguageQualityRegistry } from "./LanguageQualityRegistry";

export interface RefineOptions {
  language?: string;
  glossary?: Record<string, string>; // canonical spelling per lowercase term
  stripFillers?: boolean;
}

export function refineTranscript(input: string, opts: RefineOptions = {}): string {
  if (!input) return "";
  const profile = LanguageQualityRegistry.get(opts.language);

  // Preserve original whitespace conventions per script. Thai does not use
  // inter-word spaces; only collapse runs of ASCII whitespace, don't insert
  // new spaces or trim script-native whitespace.
  let text = input.replace(/[ \t]+/g, " ").replace(/\s*\n+\s*/g, " ").trim();

  // ---- 1. Filler removal (per-language) ---------------------------------
  if (opts.stripFillers !== false) {
    for (const rx of profile.fillerPhrases) text = text.replace(rx, "");
    if (profile.fillers.length) {
      const set = new Set(profile.fillers.map((f) => f.toLowerCase()));
      // Split into tokens preserving whitespace + punctuation so we can
      // remove filler words without corrupting non-Latin scripts.
      text = text
        .split(/(\s+|[,.;:!?…。！？،؛؟।۔])/u)
        .filter((tok) => !set.has(tok.trim().toLowerCase()))
        .join("");
    }
  }

  // ---- 2. Collapse immediate word repeats (works for any script) --------
  //   "the the plan" → "the plan"; "मैं मैं जा रहा" → "मैं जा रहा"
  text = text.replace(/(\p{L}[\p{L}\p{M}']{0,20})(\s+\1\b)+/giu, "$1");

  // ---- 3. Whitespace + punctuation spacing ------------------------------
  text = text
    .replace(/\s+([,.;:!?…。！？،؛؟।۔])/gu, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();

  // ---- 4. Sentence-initial capitalization (only for cased scripts) ------
  if (profile.capitalizeSentences) {
    text = text.replace(/(^|[.!?…]\s+)(\p{Ll})/gu, (_, p, c) => p + c.toUpperCase());
    if (profile.bcp47.startsWith("en")) text = text.replace(/\bi\b/g, "I");
  }

  // ---- 5. Terminal punctuation ------------------------------------------
  const term = profile.terminalPunctuation;
  if (term && text && !/[.!?…。！？।۔]$/u.test(text)) text += term;

  // ---- 6. Glossary canonical casing (best-effort for Latin terms) -------
  if (opts.glossary) {
    for (const [k, v] of Object.entries(opts.glossary)) {
      if (!k || !v) continue;
      const rx = new RegExp(`\\b${escapeRx(k)}\\b`, "gi");
      text = text.replace(rx, v);
    }
  }

  return text;
}

function escapeRx(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Split refined text into readable sentences using the language's own
 *  sentence-terminator conventions (Devanagari `।`, Arabic `۔`, CJK `。！？`). */
export function splitSentences(text: string, language?: string): string[] {
  const profile = LanguageQualityRegistry.get(language);
  return text
    .replace(/[ \t]+/g, " ")
    .trim()
    .split(profile.sentenceSplitter)
    .map((s) => s.trim())
    .filter(Boolean);
}
