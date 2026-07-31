import { EventBus } from "./EventBus";
import type { ProviderKind } from "./types";

export interface AnalyticsSnapshot {
  sessionStartedAt: number | null;
  recordingDurationSec: number;
  wordsTranscribed: number;
  segments: number;
  averageConfidence: number;
  translationLatencyMs: number;
  speechLatencyMs: number;
  providerLatencyMs: Record<string, number>;
  providerSwitches: number;
  reconnectCount: number;
  apiFailures: number;
}

class AnalyticsImpl {
  private startedAt: number | null = null;
  private stoppedAt: number | null = null;
  private words = 0;
  private segments = 0;
  private confidenceSum = 0;
  private translationLatencies: number[] = [];
  private speechLatencies: number[] = [];
  private providerLatencies = new Map<string, number[]>();
  private providerSwitches = 0;
  private reconnects = 0;
  private failures = 0;

  private listeners = new Set<(s: AnalyticsSnapshot) => void>();
  private unsubscribers: Array<() => void> = [];

  constructor() {
    this.wire();
  }

  private wire(): void {
    this.unsubscribers.push(
      EventBus.on("RecordingStarted", ({ at }) => {
        this.startedAt = at;
        this.stoppedAt = null;
        this.notify();
      }),
      EventBus.on("RecordingStopped", ({ at }) => {
        this.stoppedAt = at;
        this.notify();
      }),
      EventBus.on("TranscriptUpdated", ({ segment }) => {
        if (segment.status === "final" || segment.status === "translated") {
          this.words += segment.originalText.split(/\s+/).filter(Boolean).length;
          this.segments += 1;
          this.confidenceSum += segment.confidence;
          this.notify();
        }
      }),
      EventBus.on("TranslationCompleted", ({ latencyMs }) => {
        this.translationLatencies.push(latencyMs);
        this.notify();
      }),
      EventBus.on("TranslationFailed", () => { this.failures++; this.notify(); }),
      EventBus.on("ProviderChanged", () => { this.providerSwitches++; this.notify(); }),
      EventBus.on("ConnectionRecovered", () => { this.reconnects++; this.notify(); }),
      EventBus.on("ProviderHealthUpdated", ({ record }) => {
        // Track latest average latency per provider.
        this.providerLatencies.set(`${record.kind}:${record.provider}`, [record.avgLatencyMs]);
      }),
    );
  }

  recordSpeechLatency(ms: number): void {
    this.speechLatencies.push(ms);
    if (this.speechLatencies.length > 100) this.speechLatencies.shift();
    this.notify();
  }

  incrementFailure(): void { this.failures++; this.notify(); }
  incrementReconnect(): void { this.reconnects++; this.notify(); }

  snapshot(): AnalyticsSnapshot {
    const now = Date.now();
    const durationMs = this.startedAt
      ? (this.stoppedAt ?? now) - this.startedAt
      : 0;
    const providerLatencyMs: Record<string, number> = {};
    for (const [k, v] of this.providerLatencies)
      providerLatencyMs[k] = v.reduce((a, b) => a + b, 0) / (v.length || 1);

    return {
      sessionStartedAt: this.startedAt,
      recordingDurationSec: Math.floor(durationMs / 1000),
      wordsTranscribed: this.words,
      segments: this.segments,
      averageConfidence: this.segments ? this.confidenceSum / this.segments : 0,
      translationLatencyMs: avg(this.translationLatencies),
      speechLatencyMs: avg(this.speechLatencies),
      providerLatencyMs,
      providerSwitches: this.providerSwitches,
      reconnectCount: this.reconnects,
      apiFailures: this.failures,
    };
  }

  subscribe(fn: (s: AnalyticsSnapshot) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  reset(): void {
    this.startedAt = null;
    this.stoppedAt = null;
    this.words = 0;
    this.segments = 0;
    this.confidenceSum = 0;
    this.translationLatencies = [];
    this.speechLatencies = [];
    this.providerLatencies.clear();
    this.providerSwitches = 0;
    this.reconnects = 0;
    this.failures = 0;
    this.notify();
  }

  private notify(): void {
    const snap = this.snapshot();
    for (const l of this.listeners) { try { l(snap); } catch { /* noop */ } }
  }
}

function avg(xs: number[]): number { return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0; }

export const Analytics = new AnalyticsImpl();
export type { ProviderKind };
