import { useEffect, useRef, useState } from "react";
import { startWavRecorder, type WavRecorder } from "./wav-recorder";

export type Sentence = {
  id: number;
  text: string;
  ts: number; // elapsed seconds when finalized
  confidence: number;
};

export type DebugEntry = {
  id: number;
  at: number; // client timestamp ms
  elapsed: number; // recorder seconds when uploaded
  status: number;
  ok: boolean;
  durationMs: number;
  bytes: number;
  mime: string;
  model: string;
  text: string;
  error?: string;
  usage?: any;
  raw?: any;
};

type Options = {
  active: boolean;
  paused: boolean;
  elapsed: number;
};


function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?。！？])\s+/g)
    .filter(Boolean);
}

const FALLBACK_LINES = [
  "Welcome everyone — today we're picking up where we left off with gradient descent.",
  "The learning rate controls how big each step is, and it really does matter.",
  "In practice, adaptive optimizers like Adam handle this pretty gracefully.",
];

const SEGMENT_MS = 5000;

/**
 * Language-agnostic live transcription.
 * Captures PCM via Web Audio, emits WAV segments to /api/transcribe.
 * The Lovable AI STT model auto-detects the spoken language.
 */
export function useLiveTranscript({ active, paused, elapsed }: Options) {
  const [committed, setCommitted] = useState<Sentence[]>([]);
  const [interim, setInterim] = useState<string>("");
  const [supported, setSupported] = useState<boolean>(true);
  const [listening, setListening] = useState(false);
  const [debug, setDebug] = useState<DebugEntry[]>([]);
  const idRef = useRef(0);
  const debugIdRef = useRef(0);
  const elapsedRef = useRef(elapsed);
  const recorderRef = useRef<WavRecorder | null>(null);
  const cancelledRef = useRef(false);
  const fallbackTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const fallbackIdx = useRef(0);


  useEffect(() => { elapsedRef.current = elapsed; }, [elapsed]);

  const prevActive = useRef(false);
  useEffect(() => {
    if (active && !prevActive.current) {
      setCommitted([]);
      setInterim("");
      setDebug([]);
      idRef.current = 0;
      debugIdRef.current = 0;
      fallbackIdx.current = 0;
    }
    prevActive.current = active;
  }, [active]);


  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasAudio = typeof AudioContext !== "undefined" || typeof (window as any).webkitAudioContext !== "undefined";
    const hasMic = !!navigator.mediaDevices?.getUserMedia;
    if (!hasAudio || !hasMic) { setSupported(false); return; }

    if (!active || paused) {
      cancelledRef.current = true;
      recorderRef.current?.stop();
      recorderRef.current = null;
      setListening(false);
      setInterim("");
      return;
    }

    cancelledRef.current = false;
    let stopped = false;

    (async () => {
      let rec: WavRecorder;
      try {
        rec = await startWavRecorder({
          segmentMs: SEGMENT_MS,
          onSegment: async (blob) => {
            if (stopped) return;
            const startedAt = elapsedRef.current;
            const t0 = Date.now();
            try {
              setInterim((s) => s || "…");
              const fd = new FormData();
              fd.append("file", blob, "chunk.wav");
              const res = await fetch("/api/transcribe", { method: "POST", body: fd });
              const data: any = await res.json().catch(() => ({}));
              const text: string = (data?.text ?? "").toString().trim();
              const entry: DebugEntry = {
                id: ++debugIdRef.current,
                at: t0,
                elapsed: startedAt,
                status: res.status,
                ok: res.ok,
                durationMs: data?.durationMs ?? (Date.now() - t0),
                bytes: data?.bytes ?? blob.size,
                mime: data?.mime ?? blob.type,
                model: data?.model ?? "openai/gpt-4o-transcribe",
                text,
                error: data?.error,
                usage: data?.usage,
                raw: data?.raw,
              };
              setDebug((d) => [entry, ...d].slice(0, 30));
              if (!res.ok || !text) return;
              const sentences = splitSentences(text);
              const newFinals: Sentence[] = sentences.map((t) => ({
                id: ++idRef.current,
                text: t,
                ts: startedAt,
                confidence: 0.95,
              }));
              setCommitted((c) => [...c, ...newFinals]);
            } catch (err: any) {
              setDebug((d) => [{
                id: ++debugIdRef.current, at: t0, elapsed: startedAt, status: 0, ok: false,
                durationMs: Date.now() - t0, bytes: blob.size, mime: blob.type,
                model: "openai/gpt-4o-transcribe", text: "", error: String(err?.message ?? err),
              }, ...d].slice(0, 30));
            } finally {
              setInterim("");
            }
          },

        });
      } catch {
        setSupported(false);
        return;
      }
      if (cancelledRef.current) { await rec.stop(); return; }
      recorderRef.current = rec;
      setListening(true);
    })();

    return () => {
      stopped = true;
      cancelledRef.current = true;
      recorderRef.current?.stop();
      recorderRef.current = null;
      setListening(false);
    };
  }, [active, paused]);

  useEffect(() => {
    if (supported) return;
    if (!active || paused) {
      if (fallbackTimer.current) { clearInterval(fallbackTimer.current); fallbackTimer.current = null; }
      setInterim("");
      return;
    }
    fallbackTimer.current = setInterval(() => {
      const line = FALLBACK_LINES[fallbackIdx.current % FALLBACK_LINES.length];
      setCommitted((c) => [...c, {
        id: ++idRef.current, text: line, ts: elapsedRef.current, confidence: 0.94,
      }]);
      fallbackIdx.current++;
    }, 3200);
    return () => {
      if (fallbackTimer.current) { clearInterval(fallbackTimer.current); fallbackTimer.current = null; }
    };
  }, [supported, active, paused]);

  return { committed, interim, supported, listening, debug };
}
