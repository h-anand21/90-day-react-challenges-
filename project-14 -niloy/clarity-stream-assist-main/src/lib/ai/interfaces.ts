/**
 * Provider-agnostic AI interfaces.
 * The UI depends ONLY on these interfaces (via `InterpreterService`) — never
 * on a concrete provider (Deepgram, Gemini, OpenAI, ElevenLabs, etc.).
 */

export type SummaryFormat =
  | "quick"
  | "detailed"
  | "bullets"
  | "concepts"
  | "minutes"
  | "actions";

export type TranscriptSegment = {
  id: number;
  text: string;
  /** Start time in seconds within the recording. */
  ts: number;
  confidence: number;
};

export type TranscribeResult = {
  text: string;
  detectedLanguage?: string;
  /** Provider-reported confidence for the whole utterance, 0..1. */
  confidence?: number;
  /** Provider-reported confidence for the detected language, 0..1. */
  languageConfidence?: number;
  segments?: TranscriptSegment[];
  durationSec?: number;
  model?: string;
  raw?: unknown;
};

export type TranslateItem = { i: number; t: string };

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

// -----------------------------------------------------------------------------
// 1. Audio Processing
// -----------------------------------------------------------------------------

export interface AudioProcessingOptions {
  noiseSuppression?: boolean;
  echoCancellation?: boolean;
  autoGainControl?: boolean;
  voiceActivityDetection?: boolean;
  targetSampleRate?: number;
}

export interface IAudioProcessingProvider {
  readonly name: string;
  isAvailable(): boolean;
  /**
   * Return a cleaned MediaStream. Implementations must not mutate the input.
   * Passthrough is a valid implementation.
   */
  process(stream: MediaStream, opts?: AudioProcessingOptions): Promise<MediaStream>;
}

// -----------------------------------------------------------------------------
// 2. Speech Recognition
// -----------------------------------------------------------------------------

export interface ITranscriptionProvider {
  readonly name: string;
  isAvailable(): boolean;
  connect?(): Promise<void>;
  disconnect?(): Promise<void>;
  startStreaming?(): Promise<void>;
  stopStreaming?(): Promise<void>;
  transcribe(input: {
    audio: Blob | ArrayBuffer | Uint8Array;
    fileName?: string;
    mimeType?: string;
  }): Promise<TranscribeResult>;
  detectLanguage(text: string): Promise<string>;
}

// Alias — kept for clarity; ITranscriptionProvider IS the speech-recognition contract.
export type ISpeechRecognitionProvider = ITranscriptionProvider;

// -----------------------------------------------------------------------------
// 4. Language Detection (standalone from STT)
// -----------------------------------------------------------------------------

export interface LanguageDetectionResult {
  language: string;
  confidence: number;
  mixed?: boolean;
  candidates?: Array<{ language: string; confidence: number }>;
}

export interface ILanguageDetectionProvider {
  readonly name: string;
  isAvailable(): boolean;
  detect(input: { text?: string; audio?: Blob | ArrayBuffer }): Promise<LanguageDetectionResult>;
}

// -----------------------------------------------------------------------------
// 6. Interpretation (semantic — replaces "literal translation")
// -----------------------------------------------------------------------------

export interface TranslationGlossary {
  keepAsIs?: string[];
  mappings?: Array<[string, string]>;
}

export interface ITranslationProvider {
  readonly name: string;
  isAvailable(): boolean;
  translate(input: {
    text: string;
    target: string;
    sourceHint?: string;
    glossary?: TranslationGlossary;
  }): Promise<string>;
  translateBatch(input: {
    sentences: string[];
    target: string;
    sourceHint?: string;
    glossary?: TranslationGlossary;
  }): Promise<string[]>;
}

/**
 * Interpretation is meaning-preserving translation. Every existing translation
 * provider satisfies this contract — the alias exists so services can talk
 * about "interpretation" in the pipeline while sharing implementations.
 */
export type IInterpretationProvider = ITranslationProvider;

// -----------------------------------------------------------------------------
// 7. Interpretation Validation
// -----------------------------------------------------------------------------

export interface InterpretationValidationInput {
  source: string;
  translation: string;
  sourceLanguage?: string;
  targetLanguage: string;
  glossary?: TranslationGlossary;
}

export interface InterpretationValidationResult {
  ok: boolean;
  score: number; // 0..1
  issues: string[];
}

export interface IInterpretationValidator {
  readonly name: string;
  isAvailable(): boolean;
  validate(input: InterpretationValidationInput): Promise<InterpretationValidationResult>;
}

// -----------------------------------------------------------------------------
// 9. Speech Synthesis
// -----------------------------------------------------------------------------

export interface SpeechSynthesisOptions {
  text: string;
  language?: string;
  voice?: string;
  rate?: number;      // 0.5..2.0
  pitch?: number;     // 0.5..2.0
  emotion?: string;
}

export interface SpeechSynthesisResult {
  /** Blob for one-shot playback; stream for progressive playback. */
  audio?: Blob;
  stream?: ReadableStream<Uint8Array>;
  mime: string;
  /** True if the provider handled playback itself (browser TTS). */
  playedInline?: boolean;
}

export interface ISpeechSynthesisProvider {
  readonly name: string;
  isAvailable(): boolean;
  synthesize(opts: SpeechSynthesisOptions): Promise<SpeechSynthesisResult>;
}

// -----------------------------------------------------------------------------
// 14. Audience Adaptation
// -----------------------------------------------------------------------------

export type AudienceProfile =
  | "general"
  | "student_school"
  | "student_university"
  | "professional"
  | "researcher"
  | "accessibility";

export interface IAudienceAdapter {
  readonly name: string;
  isAvailable(): boolean;
  adapt(input: { text: string; language: string; profile: AudienceProfile }): Promise<string>;
}

// -----------------------------------------------------------------------------
// Summary + Chat (existing)
// -----------------------------------------------------------------------------

export interface ISummaryProvider {
  readonly name: string;
  isAvailable(): boolean;
  summarize(input: {
    transcript: string;
    format: SummaryFormat;
    targetLanguage: string;
  }): Promise<string>;
  generateMeetingMinutes(transcript: string, targetLanguage?: string): Promise<string>;
  extractActionItems(transcript: string, targetLanguage?: string): Promise<string>;
  generateKeyConcepts(transcript: string, targetLanguage?: string): Promise<string>;
}

export interface IChatProvider {
  readonly name: string;
  isAvailable(): boolean;
  askQuestion(input: {
    question: string;
    context?: string;
    history?: ChatMessage[];
  }): Promise<string>;
  searchTranscript(input: { query: string; transcript: string }): Promise<string>;
}
