import { useSyncExternalStore } from "react";
import { TranscriptStore } from "@/core/TranscriptStore";
import type { TranscriptSegment } from "@/core/types";

export function useTranscript(): TranscriptSegment[] {
  return useSyncExternalStore(
    (fn) => TranscriptStore.subscribe(fn),
    TranscriptStore.getSnapshot,
    TranscriptStore.getSnapshot,
  );
}
