import type { ISpeechSynthesisProvider, SpeechSynthesisOptions, SpeechSynthesisResult } from "../../interfaces";
import { LanguageQualityRegistry } from "@/core/LanguageQualityRegistry";

/**
 * ElevenLabs — the primary Neural Speech Synthesis provider for AccessAI.
 *
 * Design goals:
 *  - **Low latency**: uses `eleven_turbo_v2_5`, ElevenLabs' fastest natural
 *    model, and the `/stream` endpoint so audio starts arriving before the
 *    full clip is generated.
 *  - **Human prosody**: expressive voice_settings (stability + style + boost)
 *    so the synthesized voice inflects questions, pauses, and emphasis
 *    instead of reading in monotone.
 *  - **Voice memory**: the caller passes a session-scoped `voice` id so the
 *    same speaker is heard throughout the session, per language.
 */
export class ElevenLabsTTSProvider implements ISpeechSynthesisProvider {
  readonly name = "elevenlabs";
  private fallbackVoice = "EXAVITQu4vr4xnSDxMaL"; // Sarah — warm, natural, multilingual
  // Strict allow-list for ElevenLabs voice IDs to prevent URL path injection.
  private static VOICE_ID_RE = /^[A-Za-z0-9]{16,32}$/;

  isAvailable(): boolean { return !!process.env.ELEVENLABS_API_KEY; }

  async synthesize(opts: SpeechSynthesisOptions): Promise<SpeechSynthesisResult> {
    const key = process.env.ELEVENLABS_API_KEY;
    if (!key) throw new Error("ELEVENLABS_API_KEY not set");
    const profile = LanguageQualityRegistry.get(opts.language);
    const requested = opts.voice || profile.preferredVoices.elevenlabs || this.fallbackVoice;
    const voice = ElevenLabsTTSProvider.VOICE_ID_RE.test(requested) ? requested : this.fallbackVoice;

    // Stream endpoint reduces time-to-first-audio to ~300ms typically.
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}/stream?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": key,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: opts.text,
          // Turbo v2.5 = ~275ms latency, multilingual, natural prosody.
          model_id: "eleven_turbo_v2_5",
          voice_settings: {
            // Balanced settings for natural conversational speech.
            stability: 0.45,       // some variance = human-like inflection
            similarity_boost: 0.8, // stay recognizably the same voice
            style: 0.35,           // expressive but not theatrical
            use_speaker_boost: true,
            speed: opts.rate ?? 1,
          },
        }),
      },
    );
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`elevenlabs HTTP ${res.status}: ${body.slice(0, 200)}`);
    }
    const blob = await res.blob();
    return { audio: blob, mime: "audio/mpeg" };
  }
}
