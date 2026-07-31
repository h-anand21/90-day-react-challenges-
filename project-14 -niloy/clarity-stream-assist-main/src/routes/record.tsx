import { createFileRoute } from "@tanstack/react-router";
import { Mic, Pause, Play, Square, Languages, Radio, Subtitles, Volume2, VolumeX } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Waveform } from "@/components/Waveform";
import { SummaryPanel } from "@/components/SummaryPanel";

import { formatTime, useApp } from "@/lib/app-store";
import { useLiveSession } from "@/hooks/useLiveSession";
import { useTranscript } from "@/hooks/useTranscript";
import { useSessionEvent } from "@/hooks/useSessionEvent";
import { OUTPUT_LANGS, labelFromBcp47 } from "@/lib/languages";
import { InterpreterService } from "@/core/InterpreterService";

export const Route = createFileRoute("/record")({
  head: () => ({
    meta: [
      { title: "Live Session · AccessAI" },
      { name: "description", content: "Record live with automatic language detection and real-time transcript in the language you choose." },
      { property: "og:title", content: "Live Session · AccessAI" },
      { property: "og:description", content: "Auto-detected speech, live transcript in any language, and on-demand AI summaries." },
    ],
  }),
  component: RecordPage,
});

function formatClock(secs: number) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function RecordPage() {
  const { recorder: appRecorder } = useApp();
  const browserLang = useMemo(() => {
    if (typeof navigator === "undefined") return "en-US";
    return navigator.language || "en-US";
  }, []);

  const [outputLang, setOutputLang] = useState<string>("English");
  const [speak, setSpeak] = useState(false);
  const { state, start, pause, resume, stop } = useLiveSession(outputLang, speak);
  const segments = useTranscript();

  // Bridge the shared "app recorder" chip (used by FloatingMiniRecorder, etc.)
  // to the LiveSessionManager so the existing UI keeps reflecting session state.
  useEffect(() => {
    if (state.status === "recording" && appRecorder.state !== "recording") appRecorder.start();
    else if (state.status === "paused" && appRecorder.state !== "paused") appRecorder.pause();
    else if (state.status === "idle" && appRecorder.state !== "idle") appRecorder.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status]);

  const detectedLanguage = state.inputLanguage || labelFromBcp47(browserLang);

  // Live translation stats — subscribe to the bus rather than poll.
  const [translationInFlight, setTranslationInFlight] = useState(0);
  const [translateError, setTranslateError] = useState<string | null>(null);
  useSessionEvent("TranslationCompleted", () => {
    setTranslationInFlight((n) => Math.max(0, n - 1));
    setTranslateError(null);
  });
  useSessionEvent("TranslationFailed", ({ error }) => {
    setTranslationInFlight((n) => Math.max(0, n - 1));
    setTranslateError(error);
  });
  useSessionEvent("TranscriptUpdated", ({ segment }) => {
    if (segment.status === "final" && outputLang !== "off" && segment.language !== outputLang) {
      setTranslationInFlight((n) => n + 1);
    }
  });

  // Audio Interpretation playback state (for transcript highlight/scroll).
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  useEffect(() => {
    const offStart = InterpreterService.onPlaybackStarted((it) => setSpeakingId(it.segmentId));
    const offEnd = InterpreterService.onPlaybackEnded(() => setSpeakingId(null));
    return () => { offStart(); offEnd(); };
  }, []);

  const committed = useMemo(
    () => segments.filter((s) => s.status !== "partial"),
    [segments],
  );
  const interim = useMemo(
    () => segments.find((s) => s.status === "partial")?.originalText ?? "",
    [segments],
  );

  const transcriptRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = transcriptRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [segments.length, interim]);

  const avgConfidence = useMemo(() => {
    if (!committed.length) return 0.97;
    return committed.reduce((a, b) => a + b.confidence, 0) / committed.length;
  }, [committed]);

  const needsTranslation = outputLang !== detectedLanguage && outputLang !== "off";

  const stage: string = (() => {
    if (state.status === "recording") {
      if (translationInFlight > 0) return "Translating…";
      if (state.listening) return "Transcribing…";
      return "Listening…";
    }
    if (state.status === "paused") return "Paused";
    if (committed.length > 0) return "Ready to Summarize…";
    return "Idle";
  })();

  const transcriptText = useMemo(() => {
    if (!committed.length) return "";
    return committed
      .map((s) => (needsTranslation ? s.translatedText || s.originalText : s.originalText))
      .join(" ");
  }, [committed, needsTranslation]);

  return (
    <AppShell>
      <div className="pt-4 max-w-4xl mx-auto">
        <div className="space-y-6">
          <div className="glass rounded-[2rem] p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 gradient-anim opacity-10" />
            <div className="relative">
              <div className="mx-auto w-48 h-48 grid place-items-center relative">
                {state.status === "recording" && (
                  <>
                    <div className="absolute inset-0 rounded-full gradient-primary opacity-20 pulse-ring" />
                    <div className="absolute inset-6 rounded-full gradient-primary opacity-30 pulse-ring" style={{ animationDelay: "0.5s" }} />
                  </>
                )}
                <div className={`relative w-28 h-28 rounded-full grid place-items-center shadow-2xl ${state.status === "idle" ? "bg-muted" : "gradient-primary"}`}>
                  <Mic className={`w-10 h-10 ${state.status === "idle" ? "text-muted-foreground" : "text-white"}`} />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center gap-3 text-xs text-muted-foreground flex-wrap">
                <span className="inline-flex items-center gap-1.5"><Radio className="w-3.5 h-3.5" /> High Quality · 48 kHz</span>
                {state.status !== "idle" && (
                  <>
                    <span>·</span>
                    <span className={`inline-flex items-center gap-1.5 ${state.listening ? "text-primary" : "text-warning"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${state.listening ? "bg-primary animate-pulse" : "bg-warning"}`} />
                      {state.supported ? (state.listening ? "Live STT connected" : "Reconnecting…") : "Demo mode"}
                    </span>
                  </>
                )}
              </div>

              <div className="mt-3 text-4xl font-extrabold tabular-nums tracking-tight">{formatTime(state.elapsedSec)}</div>
              <div className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">{stage}</div>
              <div className="mt-4"><Waveform active={state.status === "recording"} bars={48} /></div>

              <div className="mt-5 flex items-center justify-center gap-4 flex-wrap">
                <div className="inline-flex items-center gap-2">
                  <label className="text-[11px] text-muted-foreground inline-flex items-center gap-1.5">
                    <Subtitles className="w-3.5 h-3.5" /> Output Language
                  </label>
                  <select
                    value={outputLang}
                    onChange={(e) => setOutputLang(e.target.value)}
                    className="text-xs rounded-full bg-muted/60 hover:bg-muted transition px-3 py-1.5 border border-border/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    aria-label="Output language"
                  >
                    {OUTPUT_LANGS.map((l) => (
                      <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => setSpeak((v) => !v)}
                  aria-pressed={speak}
                  aria-label={speak ? "Voice output on" : "Voice output off"}
                  title={speak ? "Voice output is on" : "Enable spoken translation"}
                  className={`relative grid place-items-center w-10 h-10 rounded-full border transition ${
                    speak
                      ? "gradient-primary border-transparent text-white shadow-lg shadow-primary/30"
                      : "bg-muted/60 hover:bg-muted text-foreground border-border/60"
                  }`}
                >
                  {speak && (
                    <>
                      <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping" />
                      <span className="absolute -inset-1 rounded-full ring-2 ring-primary/30" />
                    </>
                  )}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="relative w-5 h-5"
                    aria-hidden
                  >
                    <path d="M4 12h1.5" />
                    <path d="M8 8v8" />
                    <path d="M12 5v14" />
                    <path d="M16 8v8" />
                    <path d="M20 12h-1.5" />
                  </svg>
                </button>
              </div>

              {/* The floating interpretation player renders playback controls globally. */}

              <div className="mt-6 flex items-center justify-center gap-3">
                {state.status === "idle" && (
                  <button onClick={start} className="px-6 py-3 rounded-full gradient-primary text-white font-medium shadow-lg inline-flex items-center gap-2">
                    <Mic className="w-4 h-4" /> Start Recording
                  </button>
                )}
                {state.status === "recording" && (
                  <>
                    <button onClick={pause} className="px-5 py-3 rounded-full glass font-medium inline-flex items-center gap-2"><Pause className="w-4 h-4" /> Pause</button>
                    <button onClick={stop} className="px-5 py-3 rounded-full bg-destructive text-white font-medium inline-flex items-center gap-2"><Square className="w-3.5 h-3.5 fill-current" /> Stop</button>
                  </>
                )}
                {state.status === "paused" && (
                  <>
                    <button onClick={resume} className="px-5 py-3 rounded-full gradient-primary text-white font-medium inline-flex items-center gap-2"><Play className="w-4 h-4" /> Resume</button>
                    <button onClick={stop} className="px-5 py-3 rounded-full bg-destructive text-white font-medium inline-flex items-center gap-2"><Square className="w-3.5 h-3.5 fill-current" /> Stop</button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="glass rounded-3xl p-5">
            <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
              <h2 className="font-semibold text-sm inline-flex items-center gap-2">
                Live Transcript
                <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  in {outputLang}
                </span>
              </h2>
              <div className="text-[11px] text-muted-foreground inline-flex items-center gap-2">
                {translateError && <span className="text-destructive">{translateError}</span>}
                <span>Confidence {(avgConfidence * 100).toFixed(0)}%</span>
              </div>
            </div>

            <div ref={transcriptRef} className="space-y-3 max-h-[420px] overflow-y-auto pr-2 scroll-smooth">
              {committed.length === 0 && !interim && (
                <p className="text-sm text-muted-foreground py-10 text-center">
                  Press <b>Start Recording</b> to begin — the transcript will appear here in <b>{outputLang}</b>, in real time.
                  {!state.supported && state.status !== "idle" && (
                    <span className="block mt-2 text-[11px]">Live speech recognition isn't available in this browser — showing a demo stream.</span>
                  )}
                </p>
              )}
              {committed.map((s, i) => {
                const isLast = i === committed.length - 1;
                const shown = needsTranslation ? s.translatedText : s.originalText;
                const pending = needsTranslation && !s.translatedText;
                return (
                  <div
                    key={s.id}
                    ref={(el) => {
                      if (el && s.id === speakingId) el.scrollIntoView({ behavior: "smooth", block: "center" });
                    }}
                    className="flex gap-3 float-in"
                  >
                    <div className="shrink-0 flex flex-col items-center gap-1">
                      <div className={`w-8 h-8 rounded-full text-white text-[11px] grid place-items-center font-semibold ${
                        s.id === speakingId ? "gradient-primary ring-2 ring-primary/50 animate-pulse" : "gradient-primary"
                      }`}>SP</div>
                      <span className="text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded bg-muted text-muted-foreground" title={`Timestamp ${formatClock(s.timestamp)}`}>
                        {formatClock(s.timestamp)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                        <span>Speaker</span>
                        <span className="opacity-60">· {(s.confidence * 100).toFixed(0)}%</span>
                        {s.id === speakingId && (
                          <span className="inline-flex items-center gap-1 text-primary">
                            <Volume2 className="w-3 h-3 animate-pulse" /> speaking
                          </span>
                        )}
                      </div>

                      <p
                        className={`text-sm sm:text-base leading-relaxed text-pretty break-words transition-colors duration-500 ${
                          s.id === speakingId
                            ? "bg-primary/15 rounded-lg px-2 py-1 -ml-2 ring-2 ring-primary/40"
                            : isLast ? "bg-primary/10 rounded-lg px-2 py-1 -ml-2 ring-1 ring-primary/20" : "opacity-90"
                        }`}
                      >
                        {pending ? (
                          <span className="inline-flex gap-1 items-center text-muted-foreground italic">
                            <span className="w-1 h-1 rounded-full bg-primary/60 animate-pulse" />
                            <span className="w-1 h-1 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: "0.15s" }} />
                            <span className="w-1 h-1 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: "0.3s" }} />
                            interpreting into {outputLang}…
                          </span>
                        ) : (
                          shown
                        )}
                      </p>
                      {needsTranslation && s.translatedText && (
                        <p className="mt-1 text-[11px] text-muted-foreground italic border-l-2 border-border pl-2">
                          {s.originalText}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
              {interim && (
                <div className="flex gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-muted text-muted-foreground text-[11px] grid place-items-center font-semibold animate-pulse">···</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-muted-foreground">Recognizing…</div>
                    <p className="text-sm leading-relaxed text-muted-foreground italic">
                      {interim}
                      <span className="inline-block w-1.5 h-4 align-middle ml-0.5 bg-primary/60 animate-pulse rounded-sm" />
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {committed.length > 0 && (
            <div className="space-y-3">
              {state.status === "idle" && (
                <div className="flex items-center gap-3 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <div className="h-px flex-1 bg-border" />
                  <span>Transcription complete</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
              )}
              <SummaryPanel transcript={transcriptText} targetLanguage={outputLang} />
            </div>
          )}
        </div>
      </div>
      
    </AppShell>
  );
}
