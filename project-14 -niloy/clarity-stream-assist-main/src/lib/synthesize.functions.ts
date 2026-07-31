import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSpeechSynthesisService } from "./ai/services";

const Input = z.object({
  text: z.string().min(1).max(4000),
  language: z.string().min(2).max(40).optional(),
  voice: z.string().optional(),
  rate: z.number().min(0.5).max(2).optional(),
});

/**
 * Server-side TTS. Returns a base64-encoded audio payload the client
 * can decode into a Blob for the AudioPlaybackQueue. When the active
 * provider synthesizes inline (e.g. Web Speech in the browser only),
 * this endpoint returns `inline: true` and the client is expected to
 * synthesize locally.
 */
export const synthesizeSpeech = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const provider = getSpeechSynthesisService();
    const res = await provider.synthesize({
      text: data.text,
      language: data.language,
      voice: data.voice,
      rate: data.rate,
    });
    if (res.playedInline || !res.audio) {
      return { inline: true as const, mime: res.mime, provider: provider.name };
    }
    const buf = await res.audio.arrayBuffer();
    const base64 = arrayBufferToBase64(buf);
    return {
      inline: false as const,
      mime: res.mime,
      provider: provider.name,
      audio: base64,
    };
  });

function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
  }
  // btoa is available in the Workers runtime.
  return btoa(binary);
}
