import type { ITranscriptionProvider, TranscribeResult } from "../../interfaces";

/**
 * AssemblyAI transcription (upload + poll). Auto language detection enabled.
 * Suitable for uploaded files and short streaming chunks (slower than Deepgram).
 */
export class AssemblySpeechProvider implements ITranscriptionProvider {
  readonly name = "assembly";

  isAvailable(): boolean {
    return !!process.env.ASSEMBLYAI_API_KEY;
  }

  async transcribe({ audio, mimeType }: {
    audio: Blob | ArrayBuffer | Uint8Array;
    fileName?: string;
    mimeType?: string;
  }): Promise<TranscribeResult> {
    const key = process.env.ASSEMBLYAI_API_KEY;
    if (!key) throw new Error("ASSEMBLYAI_API_KEY not configured");

    const type = mimeType || (audio instanceof Blob ? audio.type : "audio/wav");
    const bytes =
      audio instanceof Blob
        ? new Uint8Array(await audio.arrayBuffer())
        : audio instanceof Uint8Array
          ? audio
          : new Uint8Array(audio);

    // 1. Upload
    const up = await fetch("https://api.assemblyai.com/v2/upload", {
      method: "POST",
      headers: { authorization: key, "content-type": type },
      body: bytes as unknown as BodyInit,
    });
    if (!up.ok) throw new Error(`AssemblyAI upload failed (${up.status})`);
    const { upload_url } = (await up.json()) as { upload_url: string };

    // 2. Request transcript
    const req = await fetch("https://api.assemblyai.com/v2/transcript", {
      method: "POST",
      headers: { authorization: key, "content-type": "application/json" },
      body: JSON.stringify({ audio_url: upload_url, language_detection: true }),
    });
    if (!req.ok) throw new Error(`AssemblyAI transcript request failed (${req.status})`);
    const { id } = (await req.json()) as { id: string };

    // 3. Poll (short timeout for chunk use)
    const deadline = Date.now() + 60_000;
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 1500));
      const st = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
        headers: { authorization: key },
      });
      const j = (await st.json()) as any;
      if (j.status === "completed") {
        return {
          text: (j.text ?? "").toString(),
          detectedLanguage: j.language_code ? isoName(j.language_code) : undefined,
          model: "assemblyai/best",
          raw: j,
        };
      }
      if (j.status === "error") throw new Error(`AssemblyAI: ${j.error}`);
    }
    throw new Error("AssemblyAI timed out");
  }

  async detectLanguage(_text: string): Promise<string> {
    // AssemblyAI detects during transcription; text-only detection unsupported.
    return "English";
  }
}

function isoName(code: string): string {
  const map: Record<string, string> = {
    en: "English", hi: "Hindi", bn: "Bengali", ta: "Tamil",
    fr: "French", es: "Spanish", de: "German", pt: "Portuguese",
    ja: "Japanese", ko: "Korean", zh: "Chinese", ar: "Arabic",
    ru: "Russian", nl: "Dutch", tr: "Turkish",
  };
  return map[code.toLowerCase().split("-")[0]] || code;
}
