/**
 * Provider factories + failover wrappers.
 *
 * Every AI stage in the pipeline has its own factory that instantiates the
 * concrete provider selected in AIConfig and wraps the chain in a Proxy so
 * any method call transparently falls back to the next available provider
 * on failure (invalid key, rate limit, timeout, outage).
 *
 * UI code MUST NOT instantiate providers directly — always go through a
 * factory or (preferably) through `InterpreterService`.
 */

import type {
  IAudioProcessingProvider,
  IChatProvider,
  IInterpretationValidator,
  ILanguageDetectionProvider,
  ISpeechSynthesisProvider,
  ISummaryProvider,
  ITranscriptionProvider,
  ITranslationProvider,
} from "./interfaces";
import type {
  AudioProcessingProviderId,
  LanguageDetectionProviderId,
  SpeechProviderId,
  SpeechSynthesisProviderId,
  TextProviderId,
} from "./config";
import { loadAIConfig } from "./config";

import { DeepgramSpeechProvider } from "./providers/speech/deepgram";
import { WhisperSpeechProvider } from "./providers/speech/whisper";
import { AssemblySpeechProvider } from "./providers/speech/assembly";
import { GoogleSpeechProvider } from "./providers/speech/google";
import { GroqSpeechProvider } from "./providers/speech/groq";

import { GeminiTranslationProvider } from "./providers/translation/gemini";
import { OpenAITranslationProvider } from "./providers/translation/openai";

import { GeminiSummaryProvider } from "./providers/summary/gemini";
import { OpenAISummaryProvider } from "./providers/summary/openai";

import { GeminiChatProvider } from "./providers/chat/gemini";
import { OpenAIChatProvider } from "./providers/chat/openai";

import { WebRTCAudioProcessingProvider } from "./providers/audio/webrtc";
import { PassthroughAudioProcessingProvider } from "./providers/audio/passthrough";

import { DeepgramLanguageDetectionProvider } from "./providers/language/deepgram";
import { GeminiLanguageDetectionProvider } from "./providers/language/gemini";

import { WebSpeechTTSProvider } from "./providers/tts/webspeech";
import { OpenAITTSProvider } from "./providers/tts/openai";
import { ElevenLabsTTSProvider } from "./providers/tts/elevenlabs";

import { HeuristicInterpretationValidator } from "./providers/validation/heuristic";
import { LLMInterpretationValidator } from "./providers/validation/llm";

// --- Concrete registries ---------------------------------------------------

function makeSpeech(id: SpeechProviderId): ITranscriptionProvider {
  switch (id) {
    case "deepgram": return new DeepgramSpeechProvider();
    case "whisper":  return new WhisperSpeechProvider();
    case "assembly": return new AssemblySpeechProvider();
    case "google":   return new GoogleSpeechProvider();
    case "groq":     return new GroqSpeechProvider();
    default: throw new Error(`Unknown speech provider: ${id}`);
  }
}

function makeTranslation(id: TextProviderId): ITranslationProvider {
  switch (id) {
    case "gemini": return new GeminiTranslationProvider();
    case "openai": return new OpenAITranslationProvider();
    case "claude": throw new Error("Claude translation provider not implemented");
  }
}

function makeSummary(id: TextProviderId): ISummaryProvider {
  switch (id) {
    case "gemini": return new GeminiSummaryProvider();
    case "openai": return new OpenAISummaryProvider();
    case "claude": throw new Error("Claude summary provider not implemented");
  }
}

function makeChat(id: TextProviderId): IChatProvider {
  switch (id) {
    case "gemini": return new GeminiChatProvider();
    case "openai": return new OpenAIChatProvider();
    case "claude": throw new Error("Claude chat provider not implemented");
  }
}

function makeAudio(id: AudioProcessingProviderId): IAudioProcessingProvider {
  switch (id) {
    case "webrtc":      return new WebRTCAudioProcessingProvider();
    case "passthrough": return new PassthroughAudioProcessingProvider();
    default: throw new Error(`Unknown audio provider: ${id}`);
  }
}

function makeLanguageDetection(id: LanguageDetectionProviderId): ILanguageDetectionProvider {
  switch (id) {
    case "deepgram": return new DeepgramLanguageDetectionProvider();
    case "gemini":   return new GeminiLanguageDetectionProvider();
    default: throw new Error(`Unknown language detection provider: ${id}`);
  }
}

function makeSynthesis(id: SpeechSynthesisProviderId): ISpeechSynthesisProvider {
  switch (id) {
    case "webspeech":  return new WebSpeechTTSProvider();
    case "openai":     return new OpenAITTSProvider();
    case "elevenlabs": return new ElevenLabsTTSProvider();
    default: throw new Error(`Unknown synthesis provider: ${id}`);
  }
}

// --- Failover machinery ----------------------------------------------------

type AnyProvider = { name: string; isAvailable(): boolean };

function buildChain<P extends AnyProvider>(
  primary: string,
  fallbacks: string[],
  make: (id: any) => P,
): P[] {
  const chain: P[] = [];
  for (const id of [primary, ...fallbacks]) {
    try {
      const p = make(id);
      if (p.isAvailable()) chain.push(p);
    } catch {
      // provider not implemented / not configured — skip
    }
  }
  if (!chain.length) {
    throw new Error(
      `No available providers configured (tried: ${[primary, ...fallbacks].join(", ")}).`,
    );
  }
  return chain;
}

function withFailover<P extends AnyProvider>(chain: P[]): P {
  return new Proxy(chain[0], {
    get(_target, prop, receiver) {
      if (prop === "name") return chain.map((p) => p.name).join("→");
      if (prop === "isAvailable") return () => chain.some((p) => p.isAvailable());
      const first = Reflect.get(chain[0] as any, prop, receiver);
      if (typeof first !== "function") return first;
      return async (...args: unknown[]) => {
        let lastErr: unknown;
        for (const p of chain) {
          const fn = (p as any)[prop];
          if (typeof fn !== "function") continue;
          const attempts = 3;
          for (let i = 1; i <= attempts; i++) {
            try {
              return await fn.apply(p, args);
            } catch (err) {
              lastErr = err;
              // eslint-disable-next-line no-console
              console.warn(`[ai] ${p.name}.${String(prop)} attempt ${i}/${attempts} failed:`, (err as Error)?.message ?? err);
              if (i < attempts) {
                const delay = Math.min(4000, 400 * Math.pow(2, i - 1));
                await new Promise((r) => setTimeout(r, delay));
              }
            }
          }
          // eslint-disable-next-line no-console
          console.warn(`[ai] switching from ${p.name} after ${attempts} failed attempts`);
        }
        throw lastErr instanceof Error
          ? lastErr
          : new Error(`All providers failed for ${String(prop)}`);
      };
    },
  }) as P;
}

// --- Public factories ------------------------------------------------------

export class SpeechProviderFactory {
  static create(): ITranscriptionProvider {
    const cfg = loadAIConfig().speech;
    return withFailover(buildChain(cfg.primary, cfg.fallbacks, makeSpeech));
  }
}
export class SpeechRecognitionProviderFactory {
  static create(): ITranscriptionProvider { return SpeechProviderFactory.create(); }
}
export class TranslationProviderFactory {
  static create(): ITranslationProvider {
    const cfg = loadAIConfig().translation;
    return withFailover(buildChain(cfg.primary, cfg.fallbacks, makeTranslation));
  }
}
export class InterpretationProviderFactory {
  static create(): ITranslationProvider {
    const cfg = loadAIConfig().interpretation;
    return withFailover(buildChain(cfg.primary, cfg.fallbacks, makeTranslation));
  }
}
export class SummaryProviderFactory {
  static create(): ISummaryProvider {
    const cfg = loadAIConfig().summary;
    return withFailover(buildChain(cfg.primary, cfg.fallbacks, makeSummary));
  }
}
export class ChatProviderFactory {
  static create(): IChatProvider {
    const cfg = loadAIConfig().chat;
    return withFailover(buildChain(cfg.primary, cfg.fallbacks, makeChat));
  }
}
export class AudioProcessingProviderFactory {
  static create(): IAudioProcessingProvider {
    const cfg = loadAIConfig().audio;
    return withFailover(buildChain(cfg.primary, cfg.fallbacks, makeAudio));
  }
}
export class LanguageDetectionProviderFactory {
  static create(): ILanguageDetectionProvider {
    const cfg = loadAIConfig().languageDetection;
    return withFailover(buildChain(cfg.primary, cfg.fallbacks, makeLanguageDetection));
  }
}
export class SpeechSynthesisProviderFactory {
  static create(): ISpeechSynthesisProvider {
    const cfg = loadAIConfig().synthesis;
    return withFailover(buildChain(cfg.primary, cfg.fallbacks, makeSynthesis));
  }
}
export class InterpretationValidatorFactory {
  static create(): IInterpretationValidator | null {
    const mode = loadAIConfig().validation.mode;
    if (mode === "off") return null;
    if (mode === "llm") {
      try {
        const v = new LLMInterpretationValidator();
        if (v.isAvailable()) return v;
      } catch { /* fall through */ }
    }
    return new HeuristicInterpretationValidator();
  }
}
