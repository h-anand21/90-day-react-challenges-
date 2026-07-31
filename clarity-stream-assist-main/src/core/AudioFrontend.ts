/**
 * Client-side voice-activity detection using Silero VAD (ONNX WASM).
 *
 * Wraps `@ricky0123/vad-web` in a tiny facade so `LiveSessionManager` can
 * pause and resume a downstream recorder based on real speech, cutting
 * silent WAV chunks that would otherwise be sent to STT.
 *
 * Emits `SpeechStart`/`SpeechEnd` on the shared EventBus so the UI can
 * show a live VAD indicator without importing this module.
 */

import { EventBus } from "@/core/EventBus";
import { Logging } from "@/core/Logging";

// The event bus is strongly typed; we lazily augment it via `emit` casts so
// we don't need to touch types.ts for optional VAD telemetry.
type VadEvents = {
  onSpeechStart: () => void;
  onSpeechEnd: (audio: Float32Array) => void;
  onMisfire: () => void;
};

export type SileroVad = {
  stop: () => Promise<void>;
};

export async function startSileroVad(handlers: VadEvents): Promise<SileroVad | null> {
  if (typeof window === "undefined") return null;
  try {
    const mod = await import("@ricky0123/vad-web");
    const MicVAD = (mod as unknown as { MicVAD: {
      new: (opts: Record<string, unknown>) => Promise<{ start: () => void; pause: () => void; destroy: () => void }>;
    } }).MicVAD;
    const instance = await MicVAD.new({
      onSpeechStart: () => {
        handlers.onSpeechStart();
        EventBus.emit("Log" as never, {
          level: "debug", scope: "vad", event: "speech_start", at: Date.now(),
        } as never);
      },
      onSpeechEnd: (audio: Float32Array) => {
        handlers.onSpeechEnd(audio);
        EventBus.emit("Log" as never, {
          level: "debug", scope: "vad", event: "speech_end", data: { samples: audio.length }, at: Date.now(),
        } as never);
      },
      onVADMisfire: () => handlers.onMisfire(),
      // Balanced defaults — Silero v5 defaults are tuned for conversational speech.
      positiveSpeechThreshold: 0.55,
      negativeSpeechThreshold: 0.35,
      minSpeechFrames: 4,
      redemptionFrames: 12,
      preSpeechPadFrames: 6,
    });
    instance.start();
    return {
      stop: async () => {
        try { instance.pause(); } catch { /* noop */ }
        try { instance.destroy(); } catch { /* noop */ }
      },
    };
  } catch (err) {
    Logging.warn("vad", "unavailable", { err: (err as Error)?.message });
    return null;
  }
}
