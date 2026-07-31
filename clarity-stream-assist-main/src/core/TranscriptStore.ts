import { EventBus } from "./EventBus";
import type { TranscriptSegment } from "./types";

type Listener = (segments: TranscriptSegment[]) => void;

/**
 * Centralized transcript store. Single source of truth for every module
 * (UI, translation pipeline, context manager, export service, analytics).
 */
class TranscriptStoreImpl {
  private segments: TranscriptSegment[] = [];
  private byId = new Map<string, TranscriptSegment>();
  private listeners = new Set<Listener>();
  private snapshotCache: TranscriptSegment[] = [];

  appendSegment(seg: TranscriptSegment): void {
    if (this.byId.has(seg.id)) {
      this.updateSegment(seg.id, seg);
      return;
    }
    this.segments.push(seg);
    this.byId.set(seg.id, seg);
    this.refreshSnapshot();
    EventBus.emit("TranscriptUpdated", { segment: seg });
    this.notify();
  }

  updateSegment(id: string, patch: Partial<TranscriptSegment>): void {
    const cur = this.byId.get(id);
    if (!cur) return;
    Object.assign(cur, patch);
    this.refreshSnapshot();
    EventBus.emit("TranscriptUpdated", { segment: cur });
    this.notify();
  }

  deleteSegment(id: string): void {
    if (!this.byId.delete(id)) return;
    this.segments = this.segments.filter((s) => s.id !== id);
    this.refreshSnapshot();
    this.notify();
  }

  get(id: string): TranscriptSegment | undefined { return this.byId.get(id); }

  getAll(): TranscriptSegment[] { return this.snapshotCache; }

  getSnapshot = (): TranscriptSegment[] => this.snapshotCache;

  search(query: string): TranscriptSegment[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return this.segments.filter(
      (s) =>
        s.originalText.toLowerCase().includes(q) ||
        (s.translatedText ?? "").toLowerCase().includes(q),
    );
  }

  export(format: "txt" | "json" | "md"): string {
    if (format === "json") return JSON.stringify(this.segments, null, 2);
    if (format === "md") {
      return this.segments
        .map((s) => `**[${fmt(s.timestamp)}]** ${s.originalText}${s.translatedText ? `\n> ${s.translatedText}` : ""}`)
        .join("\n\n");
    }
    return this.segments
      .map((s) => `[${fmt(s.timestamp)}] ${s.originalText}${s.translatedText ? ` — ${s.translatedText}` : ""}`)
      .join("\n");
  }

  clear(): void {
    this.segments = [];
    this.byId.clear();
    this.refreshSnapshot();
    this.notify();
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private refreshSnapshot(): void {
    this.snapshotCache = this.segments.slice();
  }

  private notify(): void {
    for (const l of this.listeners) {
      try { l(this.snapshotCache); } catch (e) { /* ignore listener errors */ }
    }
  }
}

function fmt(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export const TranscriptStore = new TranscriptStoreImpl();
