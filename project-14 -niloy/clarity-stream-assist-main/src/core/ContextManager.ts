import { TranscriptStore } from "./TranscriptStore";
import type { TranscriptSegment } from "./types";

export type ContextPurpose = "translate" | "summary" | "chat" | "search";

const WINDOW_BY_PURPOSE: Record<ContextPurpose, { segments: number; chars: number }> = {
  translate: { segments: 6,   chars: 800   }, // last few sentences give plenty of context, low tokens
  chat:      { segments: 60,  chars: 12000 },
  summary:   { segments: 500, chars: 40000 }, // effectively "all of it, capped"
  search:    { segments: 500, chars: 40000 },
};

/**
 * Rolling context window builder. Trims by segment count and char budget so
 * token usage stays bounded regardless of session length.
 */
class ContextManagerImpl {
  getContext(purpose: ContextPurpose, extra?: TranscriptSegment[]): string {
    const cfg = WINDOW_BY_PURPOSE[purpose];
    const src = extra ?? TranscriptStore.getAll();
    const tail = src.slice(-cfg.segments);
    const joined = tail.map((s) => s.originalText).join(" ");
    if (joined.length <= cfg.chars) return joined;
    // Trim from the front, keeping the most recent context.
    return joined.slice(joined.length - cfg.chars);
  }

  getRecent(n: number): TranscriptSegment[] {
    return TranscriptStore.getAll().slice(-n);
  }
}

export const ContextManager = new ContextManagerImpl();
