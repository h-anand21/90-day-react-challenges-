import type { ILanguageDetectionProvider, LanguageDetectionResult } from "../../interfaces";

/**
 * Script-based language detector. Zero-network, universal, always available.
 *
 * Works by counting Unicode-script character frequencies and mapping the
 * dominant script(s) to language candidates. This is the ONLY detector that
 * can never rate-limit or fail — it anchors the fusion vote for scripts that
 * unambiguously identify a language (Devanagari, Bengali, Tamil, Telugu,
 * Kannada, Malayalam, Gurmukhi, Gujarati, Arabic, Hangul, Hiragana/Katakana,
 * Han, Thai, Cyrillic, Greek, Hebrew, Ethiopic, etc.).
 *
 * For Latin-script languages (English, French, Spanish, German, Portuguese,
 * Italian, Turkish, Vietnamese, Indonesian) the script alone is ambiguous, so
 * we return "Latin" with low confidence and let LLM/STT detectors decide.
 *
 * When two scripts co-exist meaningfully (e.g. Devanagari + Latin) the
 * detector flags `mixed: true` and returns per-script candidates so the
 * fusion layer knows to preserve code-switching.
 */

type ScriptId =
  | "latin" | "devanagari" | "bengali" | "tamil" | "telugu" | "kannada"
  | "malayalam" | "gurmukhi" | "gujarati" | "arabic" | "han" | "hiragana"
  | "katakana" | "hangul" | "thai" | "cyrillic" | "greek" | "hebrew"
  | "ethiopic";

const SCRIPT_TO_LANGUAGES: Record<ScriptId, string[]> = {
  latin: ["English", "French", "Spanish", "German", "Portuguese", "Italian",
          "Turkish", "Vietnamese", "Indonesian"],
  devanagari: ["Hindi", "Marathi"],
  bengali: ["Bengali"],
  tamil: ["Tamil"],
  telugu: ["Telugu"],
  kannada: ["Kannada"],
  malayalam: ["Malayalam"],
  gurmukhi: ["Punjabi"],
  gujarati: ["Gujarati"],
  arabic: ["Arabic", "Urdu"],
  han: ["Chinese"],
  hiragana: ["Japanese"],
  katakana: ["Japanese"],
  hangul: ["Korean"],
  thai: ["Thai"],
  cyrillic: ["Russian"],
  greek: ["Greek"],
  hebrew: ["Hebrew"],
  ethiopic: ["Amharic"],
};

// Regex per script (Unicode property escapes; supported in all modern V8/JSC).
const SCRIPT_REGEX: Record<ScriptId, RegExp> = {
  latin:       /\p{Script=Latin}/gu,
  devanagari:  /\p{Script=Devanagari}/gu,
  bengali:     /\p{Script=Bengali}/gu,
  tamil:       /\p{Script=Tamil}/gu,
  telugu:      /\p{Script=Telugu}/gu,
  kannada:     /\p{Script=Kannada}/gu,
  malayalam:   /\p{Script=Malayalam}/gu,
  gurmukhi:    /\p{Script=Gurmukhi}/gu,
  gujarati:    /\p{Script=Gujarati}/gu,
  arabic:      /\p{Script=Arabic}/gu,
  han:         /\p{Script=Han}/gu,
  hiragana:    /\p{Script=Hiragana}/gu,
  katakana:    /\p{Script=Katakana}/gu,
  hangul:      /\p{Script=Hangul}/gu,
  thai:        /\p{Script=Thai}/gu,
  cyrillic:    /\p{Script=Cyrillic}/gu,
  greek:       /\p{Script=Greek}/gu,
  hebrew:      /\p{Script=Hebrew}/gu,
  ethiopic:    /\p{Script=Ethiopic}/gu,
};

/**
 * Rough diacritic / stopword signal for Latin-script languages. Confidence
 * stays modest — a full-language decision is left to the LLM detector — but
 * this pushes the fusion vote in the right direction for common cases.
 */
function guessLatinLanguage(text: string): { language: string; confidence: number } {
  const lower = ` ${text.toLowerCase()} `;
  const signals: Array<{ language: string; pattern: RegExp; weight: number }> = [
    { language: "German",     pattern: /[äöüß]|(?: der | die | das | und | nicht | ich | mit )/g, weight: 0.6 },
    { language: "French",     pattern: /[àâçéèêëîïôûùüÿœæ]|(?: le | la | les | est | avec | pour | dans | nous )/g, weight: 0.6 },
    { language: "Spanish",    pattern: /[áéíóúñü¿¡]|(?: el | la | los | las | que | pero | como | está )/g, weight: 0.6 },
    { language: "Portuguese", pattern: /[ãõáéíóúâêôç]|(?: você | não | está | também | então | fazer )/g, weight: 0.6 },
    { language: "Italian",    pattern: /(?: che | non | sono | anche | perché | della | questo | però )/g, weight: 0.6 },
    { language: "Turkish",    pattern: /[çğıöşü]|(?: bir | için | değil | çok | çünkü )/g, weight: 0.6 },
    { language: "Vietnamese", pattern: /[ăâđêôơư]|[àáảãạằắẳẵặầấẩẫậ]/g, weight: 0.7 },
    { language: "Indonesian", pattern: /(?: yang | tidak | dengan | untuk | adalah | dari | akan )/g, weight: 0.6 },
    { language: "English",    pattern: /(?: the | and | you | with | this | that | have | for | are | not )/g, weight: 0.55 },
  ];
  let best = { language: "English", score: 0.15 };
  for (const s of signals) {
    const hits = (lower.match(s.pattern) || []).length;
    if (!hits) continue;
    const score = Math.min(0.9, 0.2 + hits * s.weight * 0.05);
    if (score > best.score) best = { language: s.language, score };
  }
  return { language: best.language, confidence: best.score };
}

export class ScriptLanguageDetectionProvider implements ILanguageDetectionProvider {
  readonly name = "script";
  isAvailable(): boolean { return true; }

  async detect({ text }: { text?: string }): Promise<LanguageDetectionResult> {
    const t = (text ?? "").normalize("NFC");
    if (!t || t.trim().length < 1) {
      return { language: "unknown", confidence: 0 };
    }
    // Count characters per script (letters only).
    const counts: Partial<Record<ScriptId, number>> = {};
    let total = 0;
    for (const script of Object.keys(SCRIPT_REGEX) as ScriptId[]) {
      const n = (t.match(SCRIPT_REGEX[script]) || []).length;
      if (n) { counts[script] = n; total += n; }
    }
    if (!total) return { language: "unknown", confidence: 0 };

    // Rank scripts by share.
    const ranked = (Object.entries(counts) as Array<[ScriptId, number]>)
      .sort((a, b) => b[1] - a[1])
      .map(([s, n]) => ({ script: s, share: n / total }));

    const primary = ranked[0];
    const secondary = ranked[1];
    // Japanese: Hiragana or Katakana dominance overrides Han sharing.
    if (counts.hiragana || counts.katakana) {
      const jpShare = ((counts.hiragana ?? 0) + (counts.katakana ?? 0) + (counts.han ?? 0)) / total;
      const mixed = hasMeaningfulLatin(counts.latin ?? 0, total);
      return {
        language: "Japanese",
        confidence: 0.85 + Math.min(0.1, jpShare * 0.1),
        mixed,
        candidates: buildCandidates(ranked, t),
      };
    }
    // Korean / Chinese / Thai / Arabic / Hebrew / Cyrillic / Greek / Ethiopic /
    // Indic scripts: primary script → single-language mapping.
    if (primary.script !== "latin") {
      const langs = SCRIPT_TO_LANGUAGES[primary.script];
      const language = langs[0];
      const mixed = hasMeaningfulLatin(counts.latin ?? 0, total)
        || (secondary && secondary.script !== "latin" && secondary.share > 0.15);
      // Arabic script → Arabic vs Urdu is disambiguated by the LLM detector;
      // return the wider Arabic label at modest confidence so the LLM vote can
      // flip it to Urdu without a fight.
      const confidence = primary.script === "arabic"
        ? 0.6 + Math.min(0.2, primary.share * 0.2)
        : 0.85 + Math.min(0.1, primary.share * 0.1);
      return {
        language,
        confidence,
        mixed,
        candidates: buildCandidates(ranked, t),
      };
    }
    // Latin-dominant: fall back to diacritic/stopword heuristics.
    const latin = guessLatinLanguage(t);
    const mixed = secondary && secondary.share > 0.15;
    return {
      language: latin.language,
      confidence: latin.confidence,
      mixed,
      candidates: buildCandidates(ranked, t),
    };
  }
}

function hasMeaningfulLatin(latinCount: number, total: number): boolean {
  const share = total ? latinCount / total : 0;
  return latinCount >= 4 && share >= 0.1 && share <= 0.9;
}

function buildCandidates(
  ranked: Array<{ script: ScriptId; share: number }>,
  text: string,
): Array<{ language: string; confidence: number }> {
  const out: Array<{ language: string; confidence: number }> = [];
  for (const r of ranked.slice(0, 3)) {
    if (r.script === "latin") {
      const latin = guessLatinLanguage(text);
      out.push({ language: latin.language, confidence: latin.confidence * r.share });
    } else {
      const lang = SCRIPT_TO_LANGUAGES[r.script][0];
      out.push({ language: lang, confidence: Math.min(0.95, 0.7 + r.share * 0.25) });
    }
  }
  return out;
}
