/**
 * TurnManager — decides WHEN an interpretation should actually fire.
 *
 * The STT layer produces finalized segments frequently, sometimes several
 * per real "conversational thought". A professional simultaneous interpreter
 * does NOT re-voice every fragment — they wait a beat, batch what's clearly
 * one sentence/idea, then speak.
 *
 * TurnManager does exactly that, without adding perceptible latency:
 *
 *  - Every incoming final segment resets a short IDLE window.
 *  - If more finals arrive within that window, they MERGE into the same
 *    "turn buffer" (same speaker, same trailing thought).
 *  - The turn flushes when EITHER
 *       (a) the idle window elapses (natural conversational pause), OR
 *       (b) the buffered text already ends on a strong terminator AND
 *           carries at least MIN_TURN_WORDS words (a completed thought).
 *  - An explicit `flushNow()` handles session stop / interruption.
 *
 * The manager is deliberately UI-agnostic — it just calls the `onTurn`
 * callback with the coalesced text + the ORIGINATING segment. The
 * InterpreterService uses that segment for transcript updates so the on-screen
 * spoken-side highlight still aligns with the last transcript row.
 */

import type { TranscriptSegment } from "./types";

const IDLE_MS = 700;              // "beat" between fragments
const HARD_FLUSH_MS = 2400;       // never sit on a buffer longer than this
const MIN_TURN_WORDS = 6;         // "complete thought" floor for early flush
const TERMINATORS = /[.!?…。！？।۔]$/u;

export interface TurnManagerOptions {
  onTurn: (payload: {
    text: string;
    lastSegment: TranscriptSegment;
    segmentIds: string[];
  }) => void;
}

export class TurnManager {
  private buffer: TranscriptSegment[] = [];
  private idleTimer: ReturnType<typeof setTimeout> | null = null;
  private hardTimer: ReturnType<typeof setTimeout> | null = null;
  constructor(private opts: TurnManagerOptions) {}

  push(seg: TranscriptSegment): void {
    const text = seg.originalText?.trim();
    if (!text || text === "…") return;
    // Same-content dedup — STT sometimes re-finalizes the same fragment.
    const last = this.buffer[this.buffer.length - 1];
    if (last && last.originalText.trim() === text) return;
    this.buffer.push(seg);

    // Early flush: buffer already reads as a complete thought.
    const merged = this.mergedText();
    if (
      TERMINATORS.test(merged) &&
      wordCount(merged) >= MIN_TURN_WORDS
    ) {
      this.armIdle(300); // still wait a short beat in case another final follows
    } else {
      this.armIdle(IDLE_MS);
    }
    this.armHard();
  }

  flushNow(): void {
    this.clearTimers();
    this.flush();
  }

  reset(): void {
    this.clearTimers();
    this.buffer = [];
  }

  private armIdle(ms: number): void {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => this.flush(), ms);
  }

  private armHard(): void {
    if (this.hardTimer) return;
    this.hardTimer = setTimeout(() => this.flush(), HARD_FLUSH_MS);
  }

  private clearTimers(): void {
    if (this.idleTimer) { clearTimeout(this.idleTimer); this.idleTimer = null; }
    if (this.hardTimer) { clearTimeout(this.hardTimer); this.hardTimer = null; }
  }

  private mergedText(): string {
    return this.buffer.map((s) => s.originalText.trim()).join(" ").replace(/\s{2,}/g, " ").trim();
  }

  private flush(): void {
    this.clearTimers();
    if (!this.buffer.length) return;
    const text = this.mergedText();
    const ids = this.buffer.map((s) => s.id);
    const last = this.buffer[this.buffer.length - 1];
    this.buffer = [];
    if (!text) return;
    try { this.opts.onTurn({ text, lastSegment: last, segmentIds: ids }); }
    catch { /* callers handle their own errors */ }
  }
}

function wordCount(s: string): number {
  return (s.trim().match(/\S+/g) ?? []).length;
}
