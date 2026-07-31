/**
 * Core domain types shared across the enterprise architecture layer.
 * UI, hooks, and services depend on these — never on concrete providers.
 */

export type SegmentStatus = "partial" | "final" | "translated" | "failed";

export interface TranscriptSegment {
  id: string;
  speaker?: string;
  originalText: string;
  translatedText?: string;
  /** BCP-47 language tag or human label of the ORIGINAL text. */
  language: string;
  /** 0..1 */
  confidence: number;
  /** Recorder-relative start time in seconds. */
  timestamp: number;
  /** Segment duration in seconds. */
  duration: number;
  /** Provider that produced the original text. */
  provider: string;
  status: SegmentStatus;
  /** Free-form metadata (translation target, retries, etc). */
  meta?: Record<string, unknown>;
}

export type ProviderKind = "speech" | "translation" | "summary" | "chat";

export type ProviderHealthStatus = "healthy" | "degraded" | "offline";

export interface ProviderHealthRecord {
  kind: ProviderKind;
  provider: string;
  status: ProviderHealthStatus;
  avgLatencyMs: number;
  errorRate: number; // rolling 0..1
  lastSuccessAt: number | null;
  lastErrorAt: number | null;
  lastError?: string;
  connectionState: "connected" | "connecting" | "disconnected";
  totalRequests: number;
  totalErrors: number;
}

export type SessionEventMap = {
  RecordingStarted: { sessionId: string; at: number };
  RecordingStopped: { sessionId: string; at: number; durationSec: number };
  RecordingPaused: { sessionId: string; at: number };
  RecordingResumed: { sessionId: string; at: number };
  TranscriptUpdated: { segment: TranscriptSegment };
  TranslationCompleted: { segmentId: string; target: string; text: string; latencyMs: number };
  TranslationFailed: { segmentId: string; target: string; error: string };
  ProviderChanged: { kind: ProviderKind; from: string | null; to: string; reason: string };
  ProviderHealthUpdated: { record: ProviderHealthRecord };
  SummaryGenerated: { format: string; text: string; targetLanguage: string };
  ChatMessageReceived: { question: string; answer: string };
  ConnectionLost: { reason: string };
  ConnectionRecovered: { downMs: number };
  Log: { level: LogLevel; scope: string; event: string; data?: unknown; at: number };
};

export type SessionEventName = keyof SessionEventMap;

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface SessionState {
  sessionId: string | null;
  status: "idle" | "recording" | "paused" | "stopped";
  startedAt: number | null;
  elapsedSec: number;
  inputLanguage: string | null; // auto-detected
  outputLanguage: string;
  listening: boolean;
  supported: boolean;
  reconnectCount: number;
}
