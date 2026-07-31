import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { DiarizationProviderFactory } from "./ai/providers/diarization/pyannote";

const Input = z.object({
  /** Base64-encoded audio (WAV/MP3). Kept small — this endpoint is for short live chunks. */
  audioBase64: z.string().min(1),
  mimeType: z.string().default("audio/wav"),
});

export const diarizeAudio = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const provider = DiarizationProviderFactory.create();
    if (!provider.isAvailable()) {
      return { provider: provider.name, available: false as const, turns: [] };
    }
    const bytes = base64ToBytes(data.audioBase64);
    const blob = new Blob([bytes as unknown as BlobPart], { type: data.mimeType });
    const turns = await provider.diarize({ audio: blob, mimeType: data.mimeType });
    return { provider: provider.name, available: true as const, turns };
  });

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
