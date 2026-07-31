import type { ISpeechSynthesisProvider, SpeechSynthesisOptions, SpeechSynthesisResult } from "../../interfaces";
import { LanguageQualityRegistry } from "@/core/LanguageQualityRegistry";

/**
 * Browser-native TTS via the Web Speech API. Zero-cost default; speaks inline
 * without producing an audio blob. AudioPlaybackQueue tolerates this by
 * awaiting the resolved promise as the "playback complete" signal.
 *
 * Locale + voice selection is delegated to the LanguageQualityRegistry so
 * every supported language routes to a matching browser voice when available.
 */
export class WebSpeechTTSProvider implements ISpeechSynthesisProvider {
  readonly name = "webspeech";

  isAvailable(): boolean {
    return typeof window !== "undefined" && typeof window.speechSynthesis !== "undefined";
  }

  async synthesize(opts: SpeechSynthesisOptions): Promise<SpeechSynthesisResult> {
    if (!this.isAvailable()) throw new Error("webspeech unavailable");
    const profile = LanguageQualityRegistry.get(opts.language);
    await new Promise<void>((resolve, reject) => {
      const utter = new SpeechSynthesisUtterance(opts.text);
      utter.lang = profile.bcp47;
      // Prefer a native voice for this locale if the browser has one.
      const voices = window.speechSynthesis.getVoices();
      const match = voices.find((v) => v.lang?.toLowerCase().startsWith(profile.bcp47.toLowerCase()))
        ?? voices.find((v) => v.lang?.toLowerCase().startsWith(profile.bcp47.slice(0, 2)));
      if (match) utter.voice = match;
      if (opts.rate) utter.rate = clamp(opts.rate, 0.5, 2);
      if (opts.pitch) utter.pitch = clamp(opts.pitch, 0.5, 2);
      utter.onend = () => resolve();
      utter.onerror = (e) => reject(new Error(e.error || "webspeech error"));
      window.speechSynthesis.speak(utter);
    });
    return { mime: "audio/none", playedInline: true };
  }
}

function clamp(n: number, lo: number, hi: number): number { return Math.max(lo, Math.min(hi, n)); }
