import { EventBus } from "./EventBus";
import { Logging } from "./Logging";
import { ProviderManager } from "./ProviderManager";
import { TranscriptStore } from "./TranscriptStore";
import { TranslationMemory } from "./TranslationMemory";
import type { TranscriptSegment } from "./types";

/**
 * TranslationPipeline
 *
 * - Serial async queue keyed by segment id (preserves order per language).
 * - Skips already-translated segments.
 * - Prevents duplicate in-flight requests.
 * - Cancels stale requests when target language changes.
 * - Passes a session glossary + translation memory so recurring terms
 *   translate the same way across every segment.
 * - Emits TranslationCompleted / TranslationFailed events per segment.
 */

export type TranslateFn = (input: {
  sentences: string[];
  target: string;
  sourceHint?: string;
  glossary?: { keepAsIs?: string[]; mappings?: Array<[string, string]> };
}) => Promise<{ translations: string[] }>;

interface QueueItem {
  segmentId: string;
  text: string;
  target: string;
  sourceHint?: string;
  enqueuedAt: number;
}

export class TranslationPipeline {
  private queue: QueueItem[] = [];
  private inFlight = new Set<string>(); // `${id}:${target}`
  private done = new Set<string>();
  private currentTarget: string | null = null;
  private processing = false;
  private stopped = false;

  constructor(private translateFn: TranslateFn) {}

  setTarget(target: string): void {
    if (this.currentTarget === target) return;
    Logging.info("translation", "target_changed", { from: this.currentTarget, to: target });
    this.currentTarget = target;
    // A new target invalidates all prior work; segments will be re-queued as needed.
    this.done.clear();
    this.inFlight.clear();
    this.queue = [];
  }

  /** Enqueue a finalized segment for translation into the current target. */
  enqueue(segment: TranscriptSegment): void {
    if (this.stopped) return;
    if (!this.currentTarget || this.currentTarget === "off") return;
    // Don't translate if the original is already in the target language.
    if (matchesLang(segment.language, this.currentTarget)) return;
    const key = `${segment.id}:${this.currentTarget}`;
    if (this.done.has(key) || this.inFlight.has(key)) return;
    const mixed = Boolean(segment.meta?.mixed);
    const sourceHint = mixed
      ? `${segment.language || "auto"} (mixed / code-switched — integrate foreign words naturally)`
      : segment.language || undefined;
    this.queue.push({
      segmentId: segment.id,
      text: segment.originalText,
      target: this.currentTarget,
      sourceHint,
      enqueuedAt: Date.now(),
    });
    void this.pump();
  }

  private async pump(): Promise<void> {
    if (this.processing) return;
    this.processing = true;
    try {
      while (this.queue.length && !this.stopped) {
        // Take a small batch, but only from the current target.
        const target = this.currentTarget!;
        const batch: QueueItem[] = [];
        while (this.queue.length && batch.length < 4) {
          const next = this.queue[0];
          if (next.target !== target) { this.queue.shift(); continue; }
          const key = `${next.segmentId}:${next.target}`;
          if (this.done.has(key) || this.inFlight.has(key)) { this.queue.shift(); continue; }
          batch.push(next);
          this.inFlight.add(key);
          this.queue.shift();
        }
        if (!batch.length) continue;

        const started = Date.now();
        try {
          const glossary = TranslationMemory.getPromptGlossary(target);
          // Choose the most specific source hint present in the batch;
          // when at least one item is code-switched, mark the whole batch as mixed.
          const hint = batch.find((b) => /mixed/i.test(b.sourceHint ?? ""))?.sourceHint
            ?? batch.find((b) => b.sourceHint)?.sourceHint;
          const res = await ProviderManager.call(
            { kind: "translation", provider: "translation-chain", attempts: 3 },
            () => this.translateFn({
              sentences: batch.map((b) => b.text),
              target,
              sourceHint: hint,
              glossary,
            }),
          );
          const latency = Date.now() - started;
          batch.forEach((item, i) => {
            const translated = res.translations[i];
            const key = `${item.segmentId}:${item.target}`;
            this.inFlight.delete(key);
            if (!translated) {
              TranscriptStore.updateSegment(item.segmentId, { status: "failed" });
              EventBus.emit("TranslationFailed", {
                segmentId: item.segmentId, target: item.target,
                error: "empty translation",
              });
              return;
            }
            this.done.add(key);
            // Grow the session memory so recurring source terms translate the same way.
            TranslationMemory.learn(item.target, item.text, translated);
            // Only apply if the target hasn't changed under us.
            if (this.currentTarget !== item.target) return;
            TranscriptStore.updateSegment(item.segmentId, {
              translatedText: translated,
              status: "translated",
            });
            EventBus.emit("TranslationCompleted", {
              segmentId: item.segmentId,
              target: item.target,
              text: translated,
              latencyMs: latency,
            });
          });
        } catch (err) {
          const msg = (err as Error)?.message ?? String(err);
          Logging.error("translation", "batch_failed", { size: batch.length, err: msg });
          batch.forEach((item) => {
            const key = `${item.segmentId}:${item.target}`;
            this.inFlight.delete(key);
            // Do NOT mark done — let a future re-enqueue retry.
            EventBus.emit("TranslationFailed", {
              segmentId: item.segmentId, target: item.target, error: msg,
            });
          });
        }
      }
    } finally {
      this.processing = false;
    }
  }

  stop(): void {
    this.stopped = true;
    this.queue = [];
    this.inFlight.clear();
  }

  reset(): void {
    this.stopped = false;
    this.done.clear();
    this.inFlight.clear();
    this.queue = [];
  }
}

function matchesLang(a: string, b: string): boolean {
  if (!a || !b) return false;
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}
