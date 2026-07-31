import { createFileRoute } from "@tanstack/react-router";
import { UploadCloud, FileAudio, CheckCircle2, Loader2, Languages, Subtitles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { SummaryPanel } from "@/components/SummaryPanel";
import { OUTPUT_LANGS } from "@/lib/languages";
import { transcribeFile, detectLanguage } from "@/lib/ai.functions";
import { translateSentences } from "@/lib/translate.functions";
import type { TranscriptSegment } from "@/lib/ai/provider";

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "Upload Recording · AccessAI" },
      { name: "description", content: "Upload MP3, WAV, M4A, WEBM, MP4 — AccessAI auto-detects the language, transcribes, translates and summarizes." },
      { property: "og:title", content: "Upload Recording · AccessAI" },
      { property: "og:description", content: "Drop in your audio or video — AccessAI handles detection, transcription and translation." },
    ],
  }),
  component: UploadPage,
});

type Stage =
  | "idle"
  | "uploading"
  | "detecting"
  | "transcribing"
  | "translating"
  | "ready"
  | "error";

const STAGE_LABEL: Record<Stage, string> = {
  idle: "Waiting for file",
  uploading: "Reading file…",
  detecting: "Detecting language…",
  transcribing: "Transcribing…",
  translating: "Translating…",
  ready: "Ready to Summarize…",
  error: "Something went wrong",
};

const STAGE_PROGRESS: Record<Stage, number> = {
  idle: 0, uploading: 15, detecting: 30, transcribing: 60, translating: 85, ready: 100, error: 100,
};

function formatClock(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string>("");
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [outputLang, setOutputLang] = useState<string>("English");
  const [detectedLang, setDetectedLang] = useState<string>("");
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [translations, setTranslations] = useState<Record<number, string>>({});
  const [currentTime, setCurrentTime] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRef = useRef<HTMLMediaElement | null>(null);
  const runIdRef = useRef(0);

  const isVideo = !!file && (file.type.startsWith("video/") || /\.(mp4|webm)$/i.test(file.name));

  useEffect(() => {
    if (!file) { setFileUrl(""); return; }
    const url = URL.createObjectURL(file);
    setFileUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const seekTo = (secs: number) => {
    const el = mediaRef.current;
    if (!el) return;
    el.currentTime = secs;
    void el.play().catch(() => {});
  };


  const transcribeFn = useServerFn(transcribeFile);
  const detectFn = useServerFn(detectLanguage);
  const translateFn = useServerFn(translateSentences);

  const needsTranslation = !!detectedLang && outputLang !== detectedLang;

  const runPipeline = async (f: File) => {
    const runId = ++runIdRef.current;
    setError(null);
    setSegments([]);
    setTranslations({});
    setDetectedLang("");
    setStage("uploading");

    try {
      // 1. Transcribe (mock STT — swap for Whisper/Deepgram in AIProvider)
      setStage("transcribing");
      const r = await transcribeFn({
        data: { fileName: f.name, mimeType: f.type || "application/octet-stream", sizeBytes: f.size },
      });
      if (runId !== runIdRef.current) return;

      // 2. Confirm detected language (server-side, using transcript text)
      setStage("detecting");
      let detected = r.detectedLanguage;
      try {
        const text = r.segments.map((s) => s.text).join(" ").slice(0, 2000);
        if (text.length > 20) {
          const d = await detectFn({ data: { text } });
          if (d.language) detected = d.language;
        }
      } catch { /* keep provider's guess */ }
      if (runId !== runIdRef.current) return;
      setDetectedLang(detected);
      setSegments(r.segments);

      // 3. Translate if needed
      if (outputLang !== detected) {
        setStage("translating");
        await translateAll(r.segments, outputLang, runId);
      }
      if (runId !== runIdRef.current) return;
      setStage("ready");
    } catch (e: any) {
      if (runId !== runIdRef.current) return;
      setError(e?.message ?? "Failed to process file");
      setStage("error");
    }
  };

  const translateAll = async (segs: TranscriptSegment[], target: string, runId: number) => {
    // Batch of 8 to keep requests small.
    const map: Record<number, string> = {};
    for (let i = 0; i < segs.length; i += 8) {
      const batch = segs.slice(i, i + 8);
      const res = await translateFn({
        data: { sentences: batch.map((s) => s.text), target },
      });
      if (runId !== runIdRef.current) return;
      batch.forEach((s, j) => { map[s.id] = res.translations[j] || ""; });
      setTranslations((prev) => ({ ...prev, ...map }));
    }
  };

  // Re-translate when the user changes output language after processing
  useEffect(() => {
    if (stage !== "ready" && stage !== "translating") return;
    if (!segments.length) return;
    const runId = runIdRef.current;
    if (outputLang === detectedLang) {
      setTranslations({});
      setStage("ready");
      return;
    }
    setStage("translating");
    setTranslations({});
    translateAll(segments, outputLang, runId)
      .then(() => { if (runId === runIdRef.current) setStage("ready"); })
      .catch((e: any) => {
        if (runId === runIdRef.current) { setError(e?.message ?? "Translation failed"); setStage("error"); }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outputLang]);

  const handleFiles = (f: File | undefined) => {
    if (!f) return;
    setFile(f);
    void runPipeline(f);
  };

  const transcriptText = useMemo(() => {
    if (!segments.length) return "";
    return segments
      .map((s) => (needsTranslation ? translations[s.id] || s.text : s.text))
      .join(" ");
  }, [segments, translations, needsTranslation]);

  const busy = stage !== "idle" && stage !== "ready" && stage !== "error";

  return (
    <AppShell>
      <div className="pt-6 max-w-3xl mx-auto space-y-6">
        <div className="text-center float-in">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Upload a <span className="gradient-text">recording</span></h1>
          <p className="mt-2 text-muted-foreground">MP3 · WAV · M4A · WEBM · MP4 — auto-detected, transcribed, translated.</p>
        </div>

        {/* Output language — available before AND after processing */}
        <div className="glass rounded-3xl p-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="text-sm inline-flex items-center gap-2">
            <Subtitles className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Output Language</span>
          </div>
          <select
            value={outputLang}
            onChange={(e) => setOutputLang(e.target.value)}
            className="text-sm rounded-full bg-muted/60 hover:bg-muted transition px-3 py-1.5 border border-border/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
            aria-label="Output language"
          >
            {OUTPUT_LANGS.map((l) => (
              <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
            ))}
          </select>
        </div>

        <label
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files?.[0]); }}
          className={`block rounded-[2rem] p-10 md:p-16 text-center cursor-pointer transition glass hover-lift ${dragging ? "ring-4 ring-primary/30" : ""}`}
        >
          <input ref={inputRef} type="file" accept="audio/*,video/*,.mp3,.wav,.m4a,.webm,.mp4" className="hidden" onChange={(e) => handleFiles(e.target.files?.[0] ?? undefined)} />
          <div className="mx-auto w-20 h-20 rounded-2xl gradient-primary grid place-items-center shadow-xl">
            <UploadCloud className="w-9 h-9 text-white" />
          </div>
          <h2 className="mt-5 text-lg font-semibold">Drop your file here</h2>
          <p className="text-sm text-muted-foreground mt-1">or click to browse from your device</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-[11px] text-muted-foreground">
            {["MP3", "WAV", "M4A", "WEBM", "MP4"].map((t) => (
              <span key={t} className="px-2.5 py-1 rounded-full bg-muted">{t}</span>
            ))}
          </div>
        </label>

        {file && (
          <div className="glass rounded-3xl p-5 float-in space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary grid place-items-center">
                <FileAudio className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{file.name}</div>
                <div className="text-[11px] text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
              </div>
              {stage === "ready" ? (
                <span className="inline-flex items-center gap-1.5 text-sm text-success"><CheckCircle2 className="w-4 h-4" /> Ready</span>
              ) : busy ? (
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" /> {STAGE_LABEL[stage]}
                </span>
              ) : stage === "error" ? (
                <span className="text-sm text-destructive">Failed</span>
              ) : null}
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                <span>{STAGE_LABEL[stage]}</span>
                <span>{STAGE_PROGRESS[stage]}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${stage === "error" ? "bg-destructive" : "gradient-primary"}`}
                  style={{ width: `${STAGE_PROGRESS[stage]}%` }}
                />
              </div>
            </div>

            {detectedLang && (
              <div className="text-xs inline-flex items-center gap-1.5 text-muted-foreground">
                <Languages className="w-3.5 h-3.5" />
                Detected Language: <b className="text-foreground">{detectedLang}</b>
              </div>
            )}

            {error && <div className="text-sm text-destructive">{error}</div>}
          </div>
        )}

        {segments.length > 0 && (
          <div className="glass rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm inline-flex items-center gap-2">
                Transcript
                <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  in {outputLang}
                </span>
              </h2>
              {stage === "translating" && (
                <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" /> Translating…
                </span>
              )}
            </div>

            {fileUrl && (
              isVideo ? (
                <video
                  ref={(el) => { mediaRef.current = el; }}
                  src={fileUrl}
                  controls
                  onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                  className="w-full rounded-2xl bg-black max-h-[320px]"
                />
              ) : (
                <audio
                  ref={(el) => { mediaRef.current = el; }}
                  src={fileUrl}
                  controls
                  onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                  className="w-full"
                />
              )
            )}

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
              {segments.map((s, i) => {
                const shown = needsTranslation ? translations[s.id] : s.text;
                const pending = needsTranslation && !translations[s.id];
                const next = segments[i + 1];
                const active = currentTime >= s.ts && (!next || currentTime < next.ts);
                return (
                  <div
                    key={s.id}
                    className={`flex gap-3 float-in rounded-xl p-2 -m-2 transition ${active ? "bg-primary/5 ring-1 ring-primary/20" : ""}`}
                  >
                    <div className="shrink-0 w-8 h-8 rounded-full gradient-primary text-white text-[11px] grid place-items-center font-semibold">SP</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] text-muted-foreground inline-flex items-center gap-2">
                        <span>Speaker</span>
                        <button
                          type="button"
                          onClick={() => seekTo(s.ts)}
                          disabled={!fileUrl}
                          title={fileUrl ? "Jump to this moment" : "Playback unavailable"}
                          className="font-mono px-1.5 py-0.5 rounded-md bg-muted hover:bg-primary/15 hover:text-primary transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {formatClock(s.ts)}
                        </button>
                        <span>· {(s.confidence * 100).toFixed(0)}%</span>
                      </div>
                      <p className="text-sm leading-relaxed">
                        {pending ? (
                          <span className="italic text-muted-foreground">translating…</span>
                        ) : shown}
                      </p>
                      {needsTranslation && translations[s.id] && (
                        <p className="mt-1 text-[11px] text-muted-foreground italic border-l-2 border-border pl-2">{s.text}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {stage === "ready" && transcriptText && (
          <SummaryPanel transcript={transcriptText} targetLanguage={outputLang} />
        )}
      </div>
    </AppShell>
  );
}
