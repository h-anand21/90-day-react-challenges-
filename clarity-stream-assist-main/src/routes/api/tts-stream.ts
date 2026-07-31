/**
 * /api/tts-stream — thin passthrough to ElevenLabs streaming TTS.
 *
 * Called once per sentence emitted by the interpreter so speech begins
 * flowing while the model is still generating. `previousText` / `nextText`
 * enable ElevenLabs request stitching — the model uses that context (without
 * synthesizing it) to keep prosody continuous across sentence boundaries so
 * the listener hears one flowing voice, not stitched clips.
 */

import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

// ElevenLabs voice IDs are 20-char alphanumeric tokens. Strict allow-list
// prevents path/query injection into the upstream API URL.
const VoiceId = z.string().regex(/^[A-Za-z0-9]{16,32}$/, "Invalid voice id");

const Body = z.object({
  text: z.string().min(1).max(2000),
  voice: VoiceId.optional(),
  previousText: z.string().max(2000).optional(),
  nextText: z.string().max(2000).optional(),
  language: z.string().max(80).optional(),
});

// Sarah — warm, natural, multilingual. Good general interpreter voice.
const DEFAULT_VOICE = "EXAVITQu4vr4xnSDxMaL";

export const Route = createFileRoute("/api/tts-stream")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: z.infer<typeof Body>;
        try {
          body = Body.parse(await request.json());
        } catch (err) {
          return new Response(`Invalid body: ${(err as Error).message}`, { status: 400 });
        }
        const key = process.env.ELEVENLABS_API_KEY;
        if (!key) return new Response("TTS not configured", { status: 503 });

        const voice = body.voice || DEFAULT_VOICE;

        const upstream = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voice}/stream?output_format=mp3_44100_128`,
          {
            method: "POST",
            headers: {
              "xi-api-key": key,
              "Content-Type": "application/json",
              Accept: "audio/mpeg",
            },
            body: JSON.stringify({
              text: body.text,
              model_id: "eleven_turbo_v2_5",
              previous_text: body.previousText,
              next_text: body.nextText,
              // Balanced for expressive conversational interpretation:
              //  - lower stability = more human intonation variation
              //  - higher style    = follow prosody hints (…, —, ?, !)
              voice_settings: {
                stability: 0.4,
                similarity_boost: 0.8,
                style: 0.45,
                use_speaker_boost: true,
                speed: 1,
              },
            }),
          },
        );

        if (!upstream.ok || !upstream.body) {
          const t = await upstream.text().catch(() => "");
          return new Response(
            `TTS upstream ${upstream.status}: ${t.slice(0, 300)}`,
            { status: 502 },
          );
        }

        return new Response(upstream.body, {
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
