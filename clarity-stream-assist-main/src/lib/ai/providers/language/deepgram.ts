import type { ILanguageDetectionProvider, LanguageDetectionResult } from "../../interfaces";
import { DeepgramSpeechProvider } from "../speech/deepgram";

/**
 * Language detection that reuses the Deepgram STT metadata (`detected_language`
 * + `language_confidence`). Requires an audio sample; text-only detection is
 * unsupported and falls back to the Gemini provider.
 */
export class DeepgramLanguageDetectionProvider implements ILanguageDetectionProvider {
  readonly name = "deepgram";
  private stt = new DeepgramSpeechProvider();

  isAvailable(): boolean { return this.stt.isAvailable(); }

  async detect({ audio, text }: { audio?: Blob | ArrayBuffer; text?: string }): Promise<LanguageDetectionResult> {
    if (!audio) {
      // Deepgram is audio-only; signal a soft failure so the factory falls over.
      throw new Error("deepgram language detection requires audio input");
    }
    const blob = audio instanceof Blob ? audio : new Blob([audio], { type: "audio/wav" });
    const res = await this.stt.transcribe({ audio: blob, fileName: "detect.wav", mimeType: "audio/wav" });
    return {
      language: res.detectedLanguage ?? "unknown",
      confidence: res.languageConfidence ?? res.confidence ?? 0.5,
    };
  }
}
