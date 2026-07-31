/**
 * pyannoteAI diarization provider.
 *
 * Consumes a short audio blob (WAV/MP3), returns speaker-labeled time
 * segments. The pipeline uses these labels to tag each transcript
 * segment with its most likely speaker.
 *
 * Uses pyannoteAI's hosted REST API: https://docs.pyannote.ai
 */

export interface DiarizationTurn {
  start: number;
  end: number;
  speaker: string;
}

export interface IDiarizationProvider {
  readonly name: string;
  isAvailable(): boolean;
  diarize(input: { audio: Blob | ArrayBuffer; mimeType?: string }): Promise<DiarizationTurn[]>;
}

const BASE = "https://api.pyannote.ai/v1";

export class PyannoteDiarizationProvider implements IDiarizationProvider {
  readonly name = "pyannote";

  isAvailable(): boolean {
    return !!process.env.PYANNOTE_API_KEY;
  }

  async diarize({ audio, mimeType }: {
    audio: Blob | ArrayBuffer;
    mimeType?: string;
  }): Promise<DiarizationTurn[]> {
    const key = process.env.PYANNOTE_API_KEY;
    if (!key) throw new Error("PYANNOTE_API_KEY not configured");

    const contentType = mimeType || (audio instanceof Blob ? audio.type : "audio/wav") || "audio/wav";
    const body: BodyInit =
      audio instanceof Blob
        ? audio
        : new Blob([new Uint8Array(audio as ArrayBuffer) as unknown as BlobPart], { type: contentType });

    // pyannoteAI supports a media inline flow via `/diarize` with a URL, and a
    // separate `/media` upload flow. For short live segments we upload +
    // diarize in one call via the inline media endpoint.
    const form = new FormData();
    form.append("media", body, "chunk.wav");

    const res = await fetch(`${BASE}/diarize`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: form,
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`pyannote HTTP ${res.status}: ${detail.slice(0, 200)}`);
    }
    const json = (await res.json()) as {
      diarization?: Array<{ start: number; end: number; speaker: string }>;
      output?: { diarization?: Array<{ start: number; end: number; speaker: string }> };
    };
    const turns = json.diarization ?? json.output?.diarization ?? [];
    return turns.map((t) => ({
      start: Number(t.start) || 0,
      end: Number(t.end) || 0,
      speaker: String(t.speaker || "Speaker 1"),
    }));
  }
}

export const DiarizationProviderFactory = {
  create(): IDiarizationProvider {
    return new PyannoteDiarizationProvider();
  },
};
