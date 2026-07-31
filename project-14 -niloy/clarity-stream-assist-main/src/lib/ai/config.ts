/**
 * Central AI provider configuration. Reads env vars at call time (never at
 * module scope — server functions on Workers inject env per-request).
 *
 * A single value change here (or in env) switches providers app-wide.
 */

export type SpeechProviderId =
  | "deepgram"
  | "google"
  | "assembly"
  | "whisper"
  | "groq";

export type TextProviderId = "gemini" | "openai" | "claude";

export type AudioProcessingProviderId = "webrtc" | "passthrough";
export type LanguageDetectionProviderId = "deepgram" | "gemini";
export type SpeechSynthesisProviderId = "webspeech" | "openai" | "elevenlabs";
export type ValidationMode = "heuristic" | "llm" | "off";

export type AudienceProfileId =
  | "general"
  | "student_school"
  | "student_university"
  | "professional"
  | "researcher"
  | "accessibility";

export type AIConfig = {
  speech: { primary: SpeechProviderId; fallbacks: SpeechProviderId[] };
  translation: { primary: TextProviderId; fallbacks: TextProviderId[] };
  interpretation: { primary: TextProviderId; fallbacks: TextProviderId[] };
  summary: { primary: TextProviderId; fallbacks: TextProviderId[] };
  chat: { primary: TextProviderId; fallbacks: TextProviderId[] };
  audio: { primary: AudioProcessingProviderId; fallbacks: AudioProcessingProviderId[] };
  languageDetection: { primary: LanguageDetectionProviderId; fallbacks: LanguageDetectionProviderId[] };
  synthesis: { primary: SpeechSynthesisProviderId; fallbacks: SpeechSynthesisProviderId[] };
  validation: { mode: ValidationMode };
  audience: { default: AudienceProfileId };
};

const SPEECH_DEFAULT_ORDER: SpeechProviderId[] = ["deepgram", "whisper", "google", "assembly", "groq"];
const TEXT_DEFAULT_ORDER: TextProviderId[] = ["gemini", "openai", "claude"];
const AUDIO_DEFAULT_ORDER: AudioProcessingProviderId[] = ["webrtc", "passthrough"];
const LANGDET_DEFAULT_ORDER: LanguageDetectionProviderId[] = ["deepgram", "gemini"];
const TTS_DEFAULT_ORDER: SpeechSynthesisProviderId[] = ["elevenlabs", "openai", "webspeech"];

function pickOrder<T extends string>(primary: T, defaults: T[], envOrder?: string): T[] {
  const seen = new Set<T>();
  const order: T[] = [];
  const push = (id: T) => { if (!seen.has(id)) { seen.add(id); order.push(id); } };
  push(primary);
  if (envOrder) for (const raw of envOrder.split(",").map((s) => s.trim()).filter(Boolean)) push(raw as T);
  for (const id of defaults) push(id);
  return order;
}

export function loadAIConfig(): AIConfig {
  const env = process.env;

  const speech = pickOrder(
    (env.SPEECH_PROVIDER as SpeechProviderId) || "deepgram",
    SPEECH_DEFAULT_ORDER, env.SPEECH_FALLBACKS,
  );
  const translation = pickOrder(
    (env.TRANSLATION_PROVIDER as TextProviderId) || "gemini",
    TEXT_DEFAULT_ORDER, env.TRANSLATION_FALLBACKS,
  );
  const interpretation = pickOrder(
    (env.INTERPRETATION_PROVIDER as TextProviderId) || (env.TRANSLATION_PROVIDER as TextProviderId) || "gemini",
    TEXT_DEFAULT_ORDER, env.INTERPRETATION_FALLBACKS,
  );
  const summary = pickOrder(
    (env.SUMMARY_PROVIDER as TextProviderId) || "gemini",
    TEXT_DEFAULT_ORDER, env.SUMMARY_FALLBACKS,
  );
  const chat = pickOrder(
    (env.CHAT_PROVIDER as TextProviderId) || "gemini",
    TEXT_DEFAULT_ORDER, env.CHAT_FALLBACKS,
  );
  const audio = pickOrder(
    (env.AUDIO_PROCESSING_PROVIDER as AudioProcessingProviderId) || "webrtc",
    AUDIO_DEFAULT_ORDER, env.AUDIO_PROCESSING_FALLBACKS,
  );
  const languageDetection = pickOrder(
    (env.LANGUAGE_DETECTION_PROVIDER as LanguageDetectionProviderId) || "deepgram",
    LANGDET_DEFAULT_ORDER, env.LANGUAGE_DETECTION_FALLBACKS,
  );
  const synthesis = pickOrder(
    (env.SYNTHESIS_PROVIDER as SpeechSynthesisProviderId) || "elevenlabs",
    TTS_DEFAULT_ORDER, env.SYNTHESIS_FALLBACKS,
  );

  return {
    speech: { primary: speech[0], fallbacks: speech.slice(1) },
    translation: { primary: translation[0], fallbacks: translation.slice(1) },
    interpretation: { primary: interpretation[0], fallbacks: interpretation.slice(1) },
    summary: { primary: summary[0], fallbacks: summary.slice(1) },
    chat: { primary: chat[0], fallbacks: chat.slice(1) },
    audio: { primary: audio[0], fallbacks: audio.slice(1) },
    languageDetection: { primary: languageDetection[0], fallbacks: languageDetection.slice(1) },
    synthesis: { primary: synthesis[0], fallbacks: synthesis.slice(1) },
    validation: { mode: (env.VALIDATION_MODE as ValidationMode) || "heuristic" },
    audience: { default: (env.AUDIENCE_DEFAULT as AudienceProfileId) || "general" },
  };
}
