/**
 * SpeakerProfile — session-scoped, non-biometric memory about who is talking.
 *
 * We do NOT identify speakers. We only observe surface features of the
 * utterances arriving this session — dominant source language, apparent
 * register (formal / neutral / casual), pacing (short vs. long turns),
 * and a rolling terminology set — so the interpreter prompt can stay
 * consistent turn-over-turn.
 *
 * Reset on session start/stop.
 */

export type Register = "formal" | "neutral" | "casual";

export interface SpeakerObservation {
  source: string;
  sourceLanguage?: string;
  targetLanguage: string;
  wordCount: number;
  at: number;
}

export interface SpeakerProfileSnapshot {
  dominantSourceLanguage?: string;
  targetLanguage?: string;
  register: Register;
  avgWordsPerTurn: number;
  turnCount: number;
  terminology: string[];
}

const FORMAL_HINTS = /\b(therefore|furthermore|whereas|shall|regarding|kindly|please|hereby|pursuant)\b/i;
const CASUAL_HINTS = /\b(yeah|yep|nope|gonna|wanna|kinda|lol|haha|dude|guys|okay|ok|hey)\b/i;
// Extract likely domain nouns: capitalised multi-word phrases, CamelCase, or
// long lowercase nouns that repeat. Kept intentionally simple.
const TERM_RX = /\b([A-Z][a-zA-Z0-9]{2,}(?:\s+[A-Z][a-zA-Z0-9]{2,}){0,2})\b/g;

class SpeakerProfileImpl {
  private turns: SpeakerObservation[] = [];
  private languageCounts = new Map<string, number>();
  private formalHits = 0;
  private casualHits = 0;
  private termCounts = new Map<string, number>();
  private currentTarget?: string;

  observe(obs: SpeakerObservation): void {
    this.turns.push(obs);
    if (this.turns.length > 40) this.turns = this.turns.slice(-40);
    if (obs.sourceLanguage) {
      this.languageCounts.set(obs.sourceLanguage, (this.languageCounts.get(obs.sourceLanguage) ?? 0) + 1);
    }
    this.currentTarget = obs.targetLanguage;
    if (FORMAL_HINTS.test(obs.source)) this.formalHits++;
    if (CASUAL_HINTS.test(obs.source)) this.casualHits++;
    let m: RegExpExecArray | null;
    const rx = new RegExp(TERM_RX.source, "g");
    while ((m = rx.exec(obs.source))) {
      const key = m[1].trim();
      if (key.length > 40) continue;
      this.termCounts.set(key, (this.termCounts.get(key) ?? 0) + 1);
    }
  }

  snapshot(): SpeakerProfileSnapshot {
    let dominantLang: string | undefined;
    let best = 0;
    for (const [lang, n] of this.languageCounts) {
      if (n > best) { best = n; dominantLang = lang; }
    }
    const total = this.turns.length || 1;
    const words = this.turns.reduce((a, t) => a + t.wordCount, 0);
    let register: Register = "neutral";
    if (this.formalHits > this.casualHits && this.formalHits >= 2) register = "formal";
    else if (this.casualHits > this.formalHits && this.casualHits >= 2) register = "casual";
    const terms = [...this.termCounts.entries()]
      .filter(([, n]) => n >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([t]) => t);
    return {
      dominantSourceLanguage: dominantLang,
      targetLanguage: this.currentTarget,
      register,
      avgWordsPerTurn: Math.round(words / total),
      turnCount: this.turns.length,
      terminology: terms,
    };
  }

  /** Compact one-line profile card for the interpreter system prompt. */
  toPromptCard(): string {
    const s = this.snapshot();
    if (s.turnCount === 0) return "";
    const parts: string[] = [];
    if (s.dominantSourceLanguage) parts.push(`speaker's usual source language: ${s.dominantSourceLanguage}`);
    parts.push(`observed register: ${s.register}`);
    parts.push(`typical turn length: ~${s.avgWordsPerTurn} words`);
    if (s.terminology.length) parts.push(`recurring terms to keep consistent: ${s.terminology.join(", ")}`);
    return `Session speaker profile (use to keep register and terminology consistent):\n- ${parts.join("\n- ")}`;
  }

  reset(): void {
    this.turns = [];
    this.languageCounts.clear();
    this.termCounts.clear();
    this.formalHits = 0;
    this.casualHits = 0;
    this.currentTarget = undefined;
  }
}

export const SpeakerProfile = new SpeakerProfileImpl();
