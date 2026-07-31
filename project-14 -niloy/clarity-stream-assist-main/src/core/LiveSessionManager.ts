import { startWavRecorder, type WavRecorder } from "@/lib/wav-recorder";
import { Analytics } from "./Analytics";
import { EventBus } from "./EventBus";
import { LanguageStabilizer } from "./LanguageStabilizer";
import { Logging } from "./Logging";
import { ProviderHealth } from "./ProviderHealth";
import { ProviderManager } from "./ProviderManager";
import { refineTranscript, splitSentences } from "./TranscriptRefiner";
import { TranscriptStore } from "./TranscriptStore";
import { TranslationMemory } from "./TranslationMemory";
import { TranslationPipeline, type TranslateFn } from "./TranslationPipeline";
import type { SessionState, TranscriptSegment } from "./types";
import { sleep } from "./ErrorRecovery";

const SEGMENT_MS = 5000;
const LOW_CONFIDENCE = 0.55;

export interface LiveSessionOptions {
  /** Endpoint that accepts a WAV blob and returns { text, detectedLanguage, ... } */
  transcribeUrl?: string;
  translateFn: TranslateFn;
  outputLanguage: string;
}

/**
 * Single controller for a live recording session. Owns:
 *   - microphone lifecycle
 *   - speech provider request loop
 *   - reconnect + error recovery
 *   - translation pipeline
 *   - transcript store writes
 *   - all lifecycle events
 *
 * The UI never talks to Deepgram/Gemini/etc directly — only to this manager
 * via `useLiveSession` (which subscribes to the transcript store + event bus).
 */
class LiveSessionManagerImpl {
  private state: SessionState = {
    sessionId: null,
    status: "idle",
    startedAt: null,
    elapsedSec: 0,
    inputLanguage: null,
    outputLanguage: "English",
    listening: false,
    supported: true,
    reconnectCount: 0,
  };

  private recorder: WavRecorder | null = null;
  private pipeline: TranslationPipeline | null = null;
  private transcribeUrl = "/api/transcribe";
  private stateListeners = new Set<(s: SessionState) => void>();
  private elapsedTimer: ReturnType<typeof setInterval> | null = null;
  private segmentSeq = 0;
  private stabilizer = new LanguageStabilizer({ minConsecutive: 3, minConfidence: 0.65 });

  configure(opts: Partial<LiveSessionOptions>): void {
    if (opts.transcribeUrl) this.transcribeUrl = opts.transcribeUrl;
    if (opts.translateFn) {
      if (!this.pipeline) this.pipeline = new TranslationPipeline(opts.translateFn);
      else this.pipeline = new TranslationPipeline(opts.translateFn);
    }
    if (opts.outputLanguage) this.setOutputLanguage(opts.outputLanguage);
  }

  getState(): SessionState { return { ...this.state }; }

  subscribe(fn: (s: SessionState) => void): () => void {
    this.stateListeners.add(fn);
    return () => this.stateListeners.delete(fn);
  }

  setOutputLanguage(lang: string): void {
    this.patch({ outputLanguage: lang });
    if (!this.pipeline) return;
    this.pipeline.setTarget(lang);
    // Re-enqueue finalized segments whose translation doesn't match.
    for (const seg of TranscriptStore.getAll()) {
      if (seg.status === "final" || seg.status === "translated") {
        this.pipeline.enqueue(seg);
      }
    }
  }

  async start(): Promise<void> {
    if (this.state.status === "recording") return;
    if (this.state.status === "paused") return this.resume();

    const supported = typeof window !== "undefined"
      && !!navigator.mediaDevices?.getUserMedia
      && (typeof AudioContext !== "undefined" || typeof (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext !== "undefined");
    if (!supported) {
      this.patch({ supported: false });
      Logging.warn("session", "unsupported_environment");
      return;
    }

    const sessionId = `sess_${Date.now().toString(36)}`;
    TranscriptStore.clear();
    Analytics.reset();
    this.pipeline?.reset();
    TranslationMemory.reset();
    this.stabilizer.reset();
    this.segmentSeq = 0;
    this.patch({ inputLanguage: null });

    this.patch({
      sessionId,
      status: "recording",
      startedAt: Date.now(),
      elapsedSec: 0,
      listening: false,
      supported: true,
      reconnectCount: 0,
    });
    EventBus.emit("RecordingStarted", { sessionId, at: Date.now() });
    Logging.info("session", "started", { sessionId });
    this.startElapsedTimer();
    await this.startRecorder();
  }

  async pause(): Promise<void> {
    if (this.state.status !== "recording") return;
    await this.recorder?.stop();
    this.recorder = null;
    this.stopElapsedTimer();
    this.patch({ status: "paused", listening: false });
    EventBus.emit("RecordingPaused", { sessionId: this.state.sessionId!, at: Date.now() });
    Logging.info("session", "paused");
  }

  async resume(): Promise<void> {
    if (this.state.status !== "paused") return;
    this.patch({ status: "recording" });
    EventBus.emit("RecordingResumed", { sessionId: this.state.sessionId!, at: Date.now() });
    Logging.info("session", "resumed");
    this.startElapsedTimer();
    await this.startRecorder();
  }

  async stop(): Promise<void> {
    if (this.state.status === "idle") return;
    const durationSec = this.state.elapsedSec;
    await this.recorder?.stop();
    this.recorder = null;
    this.stopElapsedTimer();
    this.patch({ status: "idle", listening: false });
    EventBus.emit("RecordingStopped", {
      sessionId: this.state.sessionId!, at: Date.now(), durationSec,
    });
    Logging.info("session", "stopped", { durationSec });
  }

  private async startRecorder(): Promise<void> {
    try {
      const rec = await startWavRecorder({
        segmentMs: SEGMENT_MS,
        onSegment: (blob) => this.handleSegment(blob),
      });
      this.recorder = rec;
      this.patch({ listening: true });
      ProviderHealth.setConnectionState("speech", "primary", "connected");
    } catch (err) {
      Logging.error("session", "recorder_start_failed", { err: (err as Error)?.message });
      this.patch({ supported: false, listening: false });
    }
  }

  private async handleSegment(blob: Blob): Promise<void> {
    if (this.state.status !== "recording") return;
    const elapsed = this.state.elapsedSec;
    const startedAt = Date.now();

    // Provisional partial segment so the UI can show "recognizing…" state.
    const provisionalId = `seg_${++this.segmentSeq}`;
    const provisional: TranscriptSegment = {
      id: provisionalId,
      originalText: "…",
      language: this.state.inputLanguage ?? "",
      confidence: 0,
      timestamp: elapsed,
      duration: SEGMENT_MS / 1000,
      provider: "speech",
      status: "partial",
    };
    TranscriptStore.appendSegment(provisional);

    try {
      const data = await ProviderManager.call(
        { kind: "speech", provider: "primary", attempts: 3 },
        async () => {
          const fd = new FormData();
          fd.append("file", blob, "chunk.wav");
          const res = await fetch(this.transcribeUrl, { method: "POST", body: fd });
          if (!res.ok) throw new Error(`transcribe HTTP ${res.status}`);
          return (await res.json()) as {
            text?: string;
            detectedLanguage?: string;
            confidence?: number | null;
            languageConfidence?: number | null;
            mixed?: boolean;
            candidates?: Array<{ language: string; score: number }>;
            model?: string;
            usage?: unknown;
          };
        },
      );

      const latency = Date.now() - startedAt;
      Analytics.recordSpeechLatency(latency);

      const rawText = (data.text ?? "").toString().trim();
      if (!rawText) {
        TranscriptStore.deleteSegment(provisionalId);
        return;
      }

      // ---- Multi-source language lock (fusion + hysteresis + margin) ---
      const langConf = typeof data.languageConfidence === "number" ? data.languageConfidence : 0.8;
      const decision = this.stabilizer.observeFused({
        language: data.detectedLanguage,
        confidence: langConf,
        mixed: data.mixed,
        candidates: data.candidates,
      });
      const detected = decision.language || this.state.inputLanguage || data.detectedLanguage || "";
      if (detected && detected !== this.state.inputLanguage) {
        this.patch({ inputLanguage: detected });
      }

      // ---- Post-processing: filler removal, dedup, punctuation ---------
      const utteranceConf = typeof data.confidence === "number" ? data.confidence : 0.9;
      const refined = refineTranscript(rawText, {
        language: detected,
        glossary: TranslationMemory.getCasingGlossary(),
        stripFillers: utteranceConf >= 0.4,
      });
      const displayText = refined || rawText;

      // Split into sentences; keep provisional as first, add the rest.
      const sentences = splitSentences(displayText, detected);
      const lowConf = utteranceConf < LOW_CONFIDENCE;
      const mixed = Boolean(data.mixed);
      sentences.forEach((sentence, i) => {
        const id = i === 0 ? provisionalId : `seg_${++this.segmentSeq}`;
        const seg: TranscriptSegment = {
          id,
          originalText: sentence,
          language: detected,
          confidence: utteranceConf,
          timestamp: elapsed,
          duration: SEGMENT_MS / 1000,
          provider: data.model ?? "speech-primary",
          status: "final",
          meta: {
            raw: i === 0 ? rawText : undefined,
            lowConfidence: lowConf || undefined,
            languageConfidence: langConf,
            mixed: mixed || undefined,
          },
        };
        if (i === 0) TranscriptStore.updateSegment(id, seg);
        else TranscriptStore.appendSegment(seg);
        this.pipeline?.enqueue(seg);
      });
    } catch (err) {
      TranscriptStore.deleteSegment(provisionalId);
      Analytics.incrementFailure();
      Logging.error("session", "segment_failed", { err: (err as Error)?.message });
      // Recover: if the recorder died mid-flight, try to bring it back.
      await this.tryReconnect();
    }
  }

  private async tryReconnect(): Promise<void> {
    if (this.state.status !== "recording") return;
    if (this.recorder) return;
    EventBus.emit("ConnectionLost", { reason: "recorder inactive" });
    Logging.warn("session", "reconnect_attempting");
    const downFrom = Date.now();
    let attempt = 0;
    while (this.state.status === "recording" && attempt < 5) {
      attempt++;
      try {
        await sleep(Math.min(4000, 500 * Math.pow(2, attempt - 1)));
        await this.startRecorder();
        if (this.recorder) {
          const downMs = Date.now() - downFrom;
          this.patch({ reconnectCount: this.state.reconnectCount + 1 });
          Analytics.incrementReconnect();
          EventBus.emit("ConnectionRecovered", { downMs });
          Logging.info("session", "reconnected", { attempts: attempt, downMs });
          return;
        }
      } catch (err) {
        Logging.warn("session", "reconnect_attempt_failed", { attempt, err: (err as Error)?.message });
      }
    }
  }

  private startElapsedTimer(): void {
    this.stopElapsedTimer();
    this.elapsedTimer = setInterval(() => {
      if (this.state.status === "recording") {
        this.patch({ elapsedSec: this.state.elapsedSec + 1 });
      }
    }, 1000);
  }

  private stopElapsedTimer(): void {
    if (this.elapsedTimer) {
      clearInterval(this.elapsedTimer);
      this.elapsedTimer = null;
    }
  }

  private patch(next: Partial<SessionState>): void {
    this.state = { ...this.state, ...next };
    for (const l of this.stateListeners) { try { l(this.state); } catch { /* noop */ } }
  }
}

export const LiveSessionManager = new LiveSessionManagerImpl();
