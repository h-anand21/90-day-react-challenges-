import type { ITranscriptionProvider, TranscribeResult } from "../../interfaces";

/** Google Cloud Speech-to-Text (v1 REST). Requires GOOGLE_STT_API_KEY. */
export class GoogleSpeechProvider implements ITranscriptionProvider {
  readonly name = "google";

  isAvailable(): boolean {
    return !!process.env.GOOGLE_STT_API_KEY;
  }

  async transcribe({ audio, mimeType }: {
    audio: Blob | ArrayBuffer | Uint8Array;
    mimeType?: string;
  }): Promise<TranscribeResult> {
    const key = process.env.GOOGLE_STT_API_KEY;
    if (!key) throw new Error("GOOGLE_STT_API_KEY not configured");
    const bytes =
      audio instanceof Blob
        ? new Uint8Array(await audio.arrayBuffer())
        : audio instanceof Uint8Array
          ? audio
          : new Uint8Array(audio);
    const b64 = bytesToBase64(bytes);
    const encoding = /wav/.test(mimeType || "") ? "LINEAR16" : "WEBM_OPUS";

    const res = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${key}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          config: {
            encoding,
            sampleRateHertz: 16000,
            languageCode: "en-US",
            alternativeLanguageCodes: ["hi-IN", "bn-IN", "es-ES", "fr-FR", "de-DE", "ja-JP"],
            enableAutomaticPunctuation: true,
          },
          audio: { content: b64 },
        }),
      },
    );
    if (!res.ok) throw new Error(`Google STT failed (${res.status})`);
    const json = (await res.json()) as any;
    const text = (json?.results ?? [])
      .map((r: any) => r?.alternatives?.[0]?.transcript ?? "")
      .join(" ")
      .trim();
    return { text, model: "google/speech-v1", raw: json };
  }

  async detectLanguage(_text: string): Promise<string> {
    return "English";
  }
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  // btoa is available in the Worker runtime.
  return btoa(bin);
}
