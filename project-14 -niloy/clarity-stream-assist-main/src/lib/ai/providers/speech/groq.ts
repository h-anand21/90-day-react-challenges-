import type { ITranscriptionProvider, TranscribeResult } from "../../interfaces";

/** Groq-hosted Whisper Large v3. Requires GROQ_API_KEY. */
export class GroqSpeechProvider implements ITranscriptionProvider {
  readonly name = "groq";

  isAvailable(): boolean {
    return !!process.env.GROQ_API_KEY;
  }

  async transcribe({ audio, fileName, mimeType }: {
    audio: Blob | ArrayBuffer | Uint8Array;
    fileName?: string;
    mimeType?: string;
  }): Promise<TranscribeResult> {
    const key = process.env.GROQ_API_KEY;
    if (!key) throw new Error("GROQ_API_KEY not configured");
    const type = mimeType || (audio instanceof Blob ? audio.type : "audio/wav");
    const blob =
      audio instanceof Blob
        ? audio
        : audio instanceof Uint8Array
          ? new Blob([audio as unknown as BlobPart], { type })
          : new Blob([new Uint8Array(audio as ArrayBuffer) as unknown as BlobPart], { type });
    const fd = new FormData();
    fd.append("model", "whisper-large-v3");
    fd.append("file", blob, fileName || "chunk.wav");
    fd.append("response_format", "verbose_json");
    const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: fd,
    });
    if (!res.ok) throw new Error(`Groq Whisper failed (${res.status})`);
    const json = (await res.json()) as any;
    return { text: (json?.text ?? "").toString(), model: "groq/whisper-large-v3", raw: json };
  }

  async detectLanguage(_text: string): Promise<string> {
    return "English";
  }
}
