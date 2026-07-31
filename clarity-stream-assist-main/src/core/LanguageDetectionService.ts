/**
 * LanguageDetectionService — independent, multi-provider language ID.
 *
 * The Speech Recognition provider is only ONE of many voters. This service
 * runs every available detector in parallel and fuses their outputs into a
 * single decision using weighted voting:
 *
 *   final_score(lang) = Σ over voters v: weight(v) * confidence_v(lang)
 *
 * Voters:
 *   1. STT metadata      — high weight when confident (audio-native)
 *   2. Script detector   — anchor for non-Latin scripts (never fails)
 *   3. LLM text detector — disambiguates Latin languages + Arabic/Urdu
 *
 * The design targets every supported language equally: no hardcoded
 * preferences, no per-language special cases beyond generic script rules.
 * Adding a new language means registering it in the script map — nothing
 * else changes.
 *
 * The service returns the fused decision *and* the per-language candidates
 * so downstream code (LanguageStabilizer) can implement locking, hysteresis
 * and code-switching.
 */

import { getLanguageDetectionService } from "@/lib/ai/services";
import { ScriptLanguageDetectionProvider } from "@/lib/ai/providers/language/script";
import type { LanguageDetectionResult } from "@/lib/ai/interfaces";

export type Vote = {
  source: string;
  language: string;
  confidence: number;
  weight: number;
  candidates?: Array<{ language: string; confidence: number }>;
  mixed?: boolean;
};

export type FusedDetection = {
  language: string;
  confidence: number;
  mixed: boolean;
  candidates: Array<{ language: string; score: number }>;
  votes: Vote[];
};

export type STTHint = {
  language?: string | null;
  confidence?: number | null;
};

const DEFAULT_WEIGHTS = {
  stt: 0.9,     // audio-native — trusted, but not sole voter
  script: 1.0,  // deterministic on non-Latin scripts
  llm: 1.0,     // strong on longer text
};

class LanguageDetectionServiceImpl {
  private script = new ScriptLanguageDetectionProvider();

  /**
   * Run every available detector and fuse. `text` should be the STT transcript.
   * `sttHint` carries the provider's own language guess (optional).
   */
  async detect(input: { text: string; sttHint?: STTHint }): Promise<FusedDetection> {
    const text = (input.text ?? "").trim();
    const votes: Vote[] = [];

    // ---- Voter 1: STT metadata ----------------------------------------
    if (input.sttHint?.language) {
      const conf = clamp01(input.sttHint.confidence ?? 0.7);
      // Shorter transcripts → less trustworthy STT metadata.
      const lengthPenalty = text.length < 12 ? 0.6 : 1;
      votes.push({
        source: "stt",
        language: normalize(input.sttHint.language),
        confidence: conf,
        weight: DEFAULT_WEIGHTS.stt * lengthPenalty,
      });
    }

    // ---- Voter 2: script detector (always available) ------------------
    let mixedFlag = false;
    try {
      const r = await this.script.detect({ text });
      if (r.language && r.language !== "unknown") {
        votes.push({
          source: "script",
          language: normalize(r.language),
          confidence: r.confidence,
          weight: DEFAULT_WEIGHTS.script,
          candidates: r.candidates,
          mixed: r.mixed,
        });
        if (r.mixed) mixedFlag = true;
      }
    } catch {
      /* impossible — script detector has no I/O */
    }

    // ---- Voter 3: LLM text detector -----------------------------------
    if (text.length >= 6) {
      try {
        const detector = getLanguageDetectionService();
        const r: LanguageDetectionResult = await detector.detect({ text });
        if (r.language && r.language !== "unknown") {
          votes.push({
            source: "llm",
            language: normalize(r.language),
            confidence: clamp01(r.confidence),
            weight: DEFAULT_WEIGHTS.llm,
            mixed: r.mixed,
          });
          if (r.mixed) mixedFlag = true;
        }
      } catch {
        /* LLM detector optional; keep going */
      }
    }

    // ---- Fusion: weighted vote per language ---------------------------
    const bucket = new Map<string, { score: number; totalWeight: number }>();
    let totalWeight = 0;
    for (const v of votes) {
      totalWeight += v.weight;
      const key = v.language;
      const cur = bucket.get(key) ?? { score: 0, totalWeight: 0 };
      cur.score += v.weight * v.confidence;
      cur.totalWeight += v.weight;
      bucket.set(key, cur);
      // Attach candidate weight-mass too, so the script detector's
      // "Latin-dominant but a bit of Devanagari" signal contributes to the
      // Hindi bucket even when the primary vote is English.
      if (v.candidates) {
        for (const c of v.candidates) {
          if (normalize(c.language) === key) continue;
          const kk = normalize(c.language);
          const cc = bucket.get(kk) ?? { score: 0, totalWeight: 0 };
          cc.score += v.weight * c.confidence * 0.5;
          bucket.set(kk, cc);
        }
      }
    }

    if (bucket.size === 0) {
      return {
        language: "unknown",
        confidence: 0,
        mixed: false,
        candidates: [],
        votes,
      };
    }

    const ranked = [...bucket.entries()]
      .map(([language, { score }]) => ({
        language,
        score: totalWeight > 0 ? score / totalWeight : score,
      }))
      .sort((a, b) => b.score - a.score);

    const top = ranked[0];
    const second = ranked[1];
    // Detect code-switching: a strong secondary candidate that isn't just
    // Latin bleed-through (< 20-point gap from the winner).
    const codeSwitch = !!(second && (top.score - second.score) < 0.2 && second.score >= 0.25);

    return {
      language: top.language,
      confidence: clamp01(top.score),
      mixed: mixedFlag || codeSwitch,
      candidates: ranked.slice(0, 4),
      votes,
    };
  }
}

export const LanguageDetectionService = new LanguageDetectionServiceImpl();

function clamp01(n: number | null | undefined): number {
  if (n === null || n === undefined || !Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, Number(n)));
}
function normalize(lang: string): string {
  return lang.trim().replace(/\s+/g, " ").replace(/^./, (c) => c.toUpperCase());
}
