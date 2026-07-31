/**
 * LanguageStabilizer — confidence-fusion lock with hysteresis.
 *
 * Applied to a stream of fused LanguageDetectionService results. Design
 * goals, per the AccessAI universal-language spec:
 *
 *   • Never switch language on a single low-confidence prediction.
 *   • Only switch after SUSTAINED, high-confidence evidence across multiple
 *     consecutive segments — regardless of which language is involved.
 *   • Support code-switching: when a segment is flagged `mixed`, keep the
 *     lock but tell the caller the segment is bilingual.
 *   • Language-agnostic: no per-language thresholds — Hindi is treated the
 *     same as Japanese, French, Swahili, or any future addition.
 *
 * Algorithm — evidence accumulator with margin:
 *   • Every observation adds `confidence` points to that language's score.
 *   • Every observation decays every OTHER language's score by `decay`.
 *   • The locked language stays locked until a challenger's score exceeds
 *     it by `switchMargin` AND the challenger has appeared in ≥
 *     `minConsecutive` recent segments at ≥ `minConfidence`.
 *   • First-ever lock requires the same consecutive-high-confidence gate,
 *     so the initial pick isn't a fluke either.
 */

export interface StabilizerOptions {
  minConsecutive?: number;
  minConfidence?: number;
  switchMargin?: number;
  decay?: number;
  windowSize?: number;
}

export interface StabilizerObservation {
  language: string | null | undefined;
  confidence: number;
  mixed?: boolean;
  /** Optional per-language candidates from the fusion layer. */
  candidates?: Array<{ language: string; score: number }>;
}

export interface StabilizerDecision {
  language: string | null;
  locked: boolean;
  mixed: boolean;
  challenger: string | null;
  scores: Record<string, number>;
}

export class LanguageStabilizer {
  private locked: string | null = null;
  private scores = new Map<string, number>();
  private recent: Array<{ language: string; confidence: number }> = [];
  private readonly minConsecutive: number;
  private readonly minConfidence: number;
  private readonly switchMargin: number;
  private readonly decay: number;
  private readonly windowSize: number;

  constructor(opts: StabilizerOptions = {}) {
    this.minConsecutive = opts.minConsecutive ?? 3;
    this.minConfidence = opts.minConfidence ?? 0.6;
    this.switchMargin = opts.switchMargin ?? 0.4;
    this.decay = opts.decay ?? 0.15;
    this.windowSize = opts.windowSize ?? 6;
  }

  get value(): string | null { return this.locked; }

  reset(): void {
    this.locked = null;
    this.scores.clear();
    this.recent = [];
  }

  /**
   * Back-compat single-language shim for older callers. Prefer `observeFused`.
   */
  observe(detected: string | null | undefined, confidence: number): string | null {
    return this.observeFused({ language: detected, confidence }).language;
  }

  observeFused(obs: StabilizerObservation): StabilizerDecision {
    const lang = obs.language ? normalize(obs.language) : null;
    const conf = clamp01(obs.confidence);
    const mixed = !!obs.mixed;

    if (lang) {
      // Accumulate: bump this language, decay every other.
      this.scores.set(lang, (this.scores.get(lang) ?? 0) + conf);
      for (const [k] of this.scores) {
        if (k === lang) continue;
        const next = (this.scores.get(k) ?? 0) - this.decay;
        if (next <= 0) this.scores.delete(k);
        else this.scores.set(k, next);
      }
      // Fold in per-language candidates from the fusion layer at reduced weight.
      if (obs.candidates) {
        for (const c of obs.candidates) {
          const k = normalize(c.language);
          if (k === lang) continue;
          this.scores.set(k, (this.scores.get(k) ?? 0) + c.score * 0.25);
        }
      }
      this.recent.push({ language: lang, confidence: conf });
      if (this.recent.length > this.windowSize) this.recent.shift();
    }

    // Consecutive-high-confidence check for the top challenger.
    const ranked = [...this.scores.entries()].sort((a, b) => b[1] - a[1]);
    const leader = ranked[0]?.[0] ?? null;
    const leaderScore = ranked[0]?.[1] ?? 0;
    const currentScore = this.locked ? this.scores.get(this.locked) ?? 0 : 0;

    const streak = leader ? this.tailStreak(leader) : 0;
    const streakOk = streak >= this.minConsecutive && this.avgTail(leader) >= this.minConfidence;

    if (!this.locked) {
      // First lock: gated by the same evidence rule as switches.
      if (leader && streakOk) this.locked = leader;
    } else if (leader && leader !== this.locked) {
      // Switch only if margin AND streak both clear the bar.
      if (streakOk && (leaderScore - currentScore) >= this.switchMargin) {
        this.locked = leader;
      }
    }

    const scoresSnapshot: Record<string, number> = {};
    for (const [k, v] of ranked) scoresSnapshot[k] = round(v);
    return {
      language: this.locked,
      locked: !!this.locked,
      mixed,
      challenger: leader && leader !== this.locked ? leader : null,
      scores: scoresSnapshot,
    };
  }

  private tailStreak(lang: string): number {
    let n = 0;
    for (let i = this.recent.length - 1; i >= 0; i--) {
      if (this.recent[i].language === lang && this.recent[i].confidence >= this.minConfidence) n++;
      else break;
    }
    return n;
  }
  private avgTail(lang: string | null): number {
    if (!lang) return 0;
    const tail = this.recent.filter((r) => r.language === lang).slice(-this.minConsecutive);
    if (!tail.length) return 0;
    return tail.reduce((s, r) => s + r.confidence, 0) / tail.length;
  }
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}
function normalize(s: string): string {
  return s.trim().replace(/\s+/g, " ").replace(/^./, (c) => c.toUpperCase());
}
function round(n: number): number { return Math.round(n * 1000) / 1000; }
