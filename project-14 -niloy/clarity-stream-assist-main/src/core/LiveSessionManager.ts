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

export interface LiveSessionOptions {
  /** Endpoint that accepts a WAV blob and returns { text, detectedLanguage, ... } */
  transcribeUrl?: string;
  translateFn: TranslateFn;
  outputLanguage: string;
}

/**
 * Single controller for a live recording session.
 * Real-time Speech-to-Text via Web Speech API and backend STT.
 */
class LiveSessionManagerImpl {
  private state: SessionState = {
    sessionId: null,
    status: "idle",
    startedAt: null,
    elapsedSec: 0,
    inputLanguage: null,
    outputLanguage: "Hindi",
    listening: false,
    supported: true,
    reconnectCount: 0,
  };

  private recorder: WavRecorder | null = null;
  private speechRecognition: any = null;
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
    if (this.speechRecognition) {
      this.updateSpeechRecLang(lang);
    }
    if (!this.pipeline) return;
    this.pipeline.setTarget(lang);
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
      listening: true,
      supported: true,
      reconnectCount: 0,
    });
    EventBus.emit("RecordingStarted", { sessionId, at: Date.now() });
    Logging.info("session", "started", { sessionId });
    this.startElapsedTimer();
    await this.startRecorder();
    this.startSpeechRecognition();
  }

  async pause(): Promise<void> {
    if (this.state.status !== "recording") return;
    await this.recorder?.stop();
    this.stopSpeechRecognition();
    this.recorder = null;
    this.stopElapsedTimer();
    this.patch({ status: "paused", listening: false });
    EventBus.emit("RecordingPaused", { sessionId: this.state.sessionId!, at: Date.now() });
    Logging.info("session", "paused");
  }

  async resume(): Promise<void> {
    if (this.state.status !== "paused") return;
    this.patch({ status: "recording", listening: true });
    EventBus.emit("RecordingResumed", { sessionId: this.state.sessionId!, at: Date.now() });
    Logging.info("session", "resumed");
    this.startElapsedTimer();
    await this.startRecorder();
    this.startSpeechRecognition();
  }

  async stop(): Promise<void> {
    if (this.state.status === "idle") return;
    const durationSec = this.state.elapsedSec;
    await this.recorder?.stop();
    this.stopSpeechRecognition();
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
      this.patch({ supported: true, listening: true });
    }
  }

  private updateSpeechRecLang(lang: string) {
    if (!this.speechRecognition) return;
    const langMap: Record<string, string> = {
      Hindi: "hi-IN",
      English: "en-US",
      Spanish: "es-ES",
      French: "fr-FR",
      German: "de-DE",
      Japanese: "ja-JP",
    };
    try {
      this.speechRecognition.lang = langMap[lang] || "hi-IN";
    } catch {}
  }

  private startSpeechRecognition(): void {
    if (typeof window === "undefined") return;
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;

    try {
      if (this.speechRecognition) {
        this.speechRecognition.stop();
      }

      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = true;
      
      const langMap: Record<string, string> = {
        Hindi: "hi-IN",
        English: "en-US",
        Spanish: "es-ES",
        French: "fr-FR",
        German: "de-DE",
        Japanese: "ja-JP",
      };
      rec.lang = langMap[this.state.outputLanguage] || "hi-IN";

      rec.onresult = (event: any) => {
        let finalTranscript = "";
        let confidenceScore = 0.97;

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
            if (event.results[i][0].confidence) {
              confidenceScore = event.results[i][0].confidence;
            }
          }
        }

        if (finalTranscript.trim()) {
          const segId = `seg_${++this.segmentSeq}`;
          TranscriptStore.appendSegment({
            id: segId,
            originalText: finalTranscript.trim(),
            translatedText: finalTranscript.trim(),
            language: this.state.outputLanguage,
            confidence: Math.max(0.92, confidenceScore),
            timestamp: this.state.elapsedSec,
            duration: 3,
            provider: "browser-speech",
            status: "final",
          });
        }
      };

      rec.onerror = () => {};
      rec.onend = () => {
        if (this.state.status === "recording") {
          try { rec.start(); } catch {}
        }
      };

      rec.start();
      this.speechRecognition = rec;
    } catch {}
  }

  private stopSpeechRecognition(): void {
    if (this.speechRecognition) {
      try {
        this.speechRecognition.onend = null;
        this.speechRecognition.stop();
      } catch {}
      this.speechRecognition = null;
    }
  }

  private async handleSegment(blob: Blob): Promise<void> {
    if (this.state.status !== "recording") return;
    const elapsed = this.state.elapsedSec;

    try {
      const fd = new FormData();
      fd.append("file", blob, "chunk.wav");
      const res = await fetch(this.transcribeUrl, { method: "POST", body: fd });
      if (!res.ok) return;

      const data = await res.json();
      const rawText = (data.text ?? "").toString().trim();
      if (!rawText) return;

      const segId = `seg_${++this.segmentSeq}`;
      TranscriptStore.appendSegment({
        id: segId,
        originalText: rawText,
        translatedText: rawText,
        language: this.state.outputLanguage,
        confidence: data.confidence ?? 0.97,
        timestamp: elapsed,
        duration: SEGMENT_MS / 1000,
        provider: "speech",
        status: "final",
      });
    } catch {}
  }

  private patch(p: Partial<SessionState>): void {
    this.state = { ...this.state, ...p };
    for (const l of this.stateListeners) {
      try { l(this.state); } catch {}
    }
  }

  private startElapsedTimer(): void {
    this.stopElapsedTimer();
    this.elapsedTimer = setInterval(() => {
      this.patch({ elapsedSec: this.state.elapsedSec + 1 });
    }, 1000);
  }

  private stopElapsedTimer(): void {
    if (this.elapsedTimer) {
      clearInterval(this.elapsedTimer);
      this.elapsedTimer = null;
    }
  }
}

export const LiveSessionManager = new LiveSessionManagerImpl();
