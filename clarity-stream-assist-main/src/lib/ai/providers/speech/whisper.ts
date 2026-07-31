import type { ITranscriptionProvider, TranscribeResult } from "../../interfaces";
import { callGatewayChat } from "../text-gateway";

/**
 * OpenAI Whisper / gpt-4o-transcribe via the Lovable AI Gateway
 * (`/v1/audio/transcriptions`). Auto-detects language.
 */
export class WhisperSpeechProvider implements ITranscriptionProvider {
  readonly name = "whisper";

  isAvailable(): boolean {
    return !!process.env.LOVABLE_API_KEY;
  }

  async transcribe({ audio, fileName, mimeType }: {
    audio: Blob | ArrayBuffer | Uint8Array;
    fileName?: string;
    mimeType?: string;
  }): Promise<TranscribeResult> {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY not configured");
    const type = mimeType || (audio instanceof Blob ? audio.type : "audio/wav");
    const blob =
      audio instanceof Blob
        ? audio
        : audio instanceof Uint8Array
          ? new Blob([audio as unknown as BlobPart], { type })
          : new Blob([new Uint8Array(audio as ArrayBuffer) as unknown as BlobPart], { type });

    const model = "openai/gpt-4o-transcribe";
    const fd = new FormData();
    fd.append("model", model);
    fd.append("file", blob, fileName || "chunk.wav");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: fd,
    });
    if (!res.ok) {
      const err = await res.text().catch(() => "");
      throw new Error(`Whisper failed (${res.status}): ${err.slice(0, 200)}`);
    }
    const json = (await res.json()) as any;
    return {
      text: (json?.text ?? "").toString(),
      model,
      raw: json,
    };
  }

  async detectLanguage(text: string): Promise<string> {
    const sample = text.trim().slice(0, 800);
    if (!sample) return "English";
    const out = await callGatewayChat({
      model: "google/gemini-3.6-flash",
      jsonMode: true,
      messages: [
        {
          role: "system",
          content:
            'Detect the natural language of the text. Reply STRICT JSON: {"language":"<English name>"}.',
        },
        { role: "user", content: sample },
      ],
    });
    try {
      return String(JSON.parse(out).language ?? "English") || "English";
    } catch {
      return "English";
    }
  }
}
