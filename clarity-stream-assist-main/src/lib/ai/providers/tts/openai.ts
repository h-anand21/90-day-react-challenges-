import type { ISpeechSynthesisProvider, SpeechSynthesisOptions, SpeechSynthesisResult } from "../../interfaces";
import { LanguageQualityRegistry } from "@/core/LanguageQualityRegistry";

/**
 * OpenAI TTS via the Lovable AI Gateway (`/v1/audio/speech`).
 * Picks a natural voice per language from the LanguageQualityRegistry so
 * synthesized audio feels native across every supported target language.
 */
export class OpenAITTSProvider implements ISpeechSynthesisProvider {
  readonly name = "openai";
  private model = "openai/gpt-4o-mini-tts";

  isAvailable(): boolean { return !!process.env.LOVABLE_API_KEY; }

  async synthesize(opts: SpeechSynthesisOptions): Promise<SpeechSynthesisResult> {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY not set");
    const profile = LanguageQualityRegistry.get(opts.language);
    const voice = opts.voice || profile.preferredVoices.openai || "alloy";
    const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
      body: JSON.stringify({
        model: this.model,
        input: opts.text,
        voice,
        // gpt-4o-mini-tts is inherently multilingual; the `instructions`
        // hint keeps prosody native for the target language.
        instructions: `Speak in natural, fluent ${opts.language ?? "the target language"} (${profile.bcp47}). Use native pronunciation, rhythm and intonation.`,
        speed: opts.rate ?? 1,
        format: "mp3",
      }),
    });
    if (!res.ok) throw new Error(`openai tts HTTP ${res.status}`);
    const blob = await res.blob();
    return { audio: blob, mime: blob.type || "audio/mpeg" };
  }
}
