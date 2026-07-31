import type { ITranscriptionProvider, TranscribeResult } from "../../interfaces";
import { callGatewayChat } from "../text-gateway";

export class DeepgramSpeechProvider implements ITranscriptionProvider {
  readonly name = "deepgram";

  isAvailable(): boolean {
    return !!process.env.DEEPGRAM_API_KEY;
  }

  async transcribe({ audio, mimeType }: {
    audio: Blob | ArrayBuffer | Uint8Array;
    fileName?: string;
    mimeType?: string;
  }): Promise<TranscribeResult> {
    const key = process.env.DEEPGRAM_API_KEY;
    if (!key) throw new Error("DEEPGRAM_API_KEY not configured");
    const contentType = mimeType || (audio instanceof Blob ? audio.type : "") || "audio/wav";
    const body: BodyInit =
      audio instanceof Blob
        ? audio
        : audio instanceof Uint8Array
          ? new Blob([audio as unknown as BlobPart], { type: contentType })
          : new Blob([new Uint8Array(audio as ArrayBuffer) as unknown as BlobPart], { type: contentType });

    // Nova-3 with language detection, smart formatting, punctuation,
    // paragraph segmentation, spoken-number → digit conversion, and
    // profanity/filler passthrough (we strip fillers client-side).
    const params = new URLSearchParams({
      model: "nova-3",
      smart_format: "true",
      punctuate: "true",
      paragraphs: "true",
      detect_language: "true",
      numerals: "true",
      filler_words: "true",
    });
    const url = `https://api.deepgram.com/v1/listen?${params.toString()}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Token ${key}`, "Content-Type": contentType },
      body,
    });
    if (!res.ok) {
      const err = await res.text().catch(() => "");
      throw new Error(`Deepgram failed (${res.status}): ${err.slice(0, 200)}`);
    }
    const json = (await res.json()) as any;
    const channel = json?.results?.channels?.[0];
    const alt = channel?.alternatives?.[0];
    // Prefer paragraph-formatted transcript (proper capitalization + breaks).
    const paragraphsText: string | undefined = alt?.paragraphs?.transcript;
    const text: string = ((paragraphsText || alt?.transcript) ?? "").toString().trim();
    const detected: string | undefined =
      channel?.detected_language || json?.results?.language || undefined;
    const languageConfidence: number | undefined =
      typeof channel?.language_confidence === "number" ? channel.language_confidence : undefined;
    const confidence: number | undefined =
      typeof alt?.confidence === "number" ? alt.confidence : undefined;
    return {
      text,
      detectedLanguage: detected ? mapIsoToName(detected) : undefined,
      languageConfidence,
      confidence,
      model: "deepgram/nova-3",
      raw: json,
    };
  }

  async detectLanguage(text: string): Promise<string> {
    const sample = text.trim().slice(0, 800);
    if (!sample) return "English";
    // Deepgram detects language during transcription; for pure-text detection we
    // fall back to the shared gateway to keep the interface complete.
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

const ISO_MAP: Record<string, string> = {
  en: "English", hi: "Hindi", bn: "Bengali", ta: "Tamil", te: "Telugu",
  fr: "French", es: "Spanish", de: "German", it: "Italian", pt: "Portuguese",
  ja: "Japanese", ko: "Korean", "zh-CN": "Chinese", zh: "Chinese",
  ar: "Arabic", ru: "Russian", nl: "Dutch", tr: "Turkish", pl: "Polish",
  ur: "Urdu", id: "Indonesian", vi: "Vietnamese", th: "Thai",
};

function mapIsoToName(code: string): string {
  const c = code.toLowerCase();
  if (ISO_MAP[code]) return ISO_MAP[code];
  const short = c.split("-")[0];
  return ISO_MAP[short] || code;
}
