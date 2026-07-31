import { useEffect, useState } from "react";
import {
  Pause, Play, SkipForward, SkipBack, Volume2, VolumeX, Gauge, Radio,
} from "lucide-react";
import { AudioPlaybackQueue, type PlayerState } from "@/core/AudioPlaybackQueue";

/**
 * FloatingInterpretationPlayer — a persistent, glass-morphic mini-player
 * bound to the AudioPlaybackQueue. Renders only when there is audio to play
 * or the user has voice output enabled and something is queued.
 */
export function FloatingInterpretationPlayer({ enabled }: { enabled: boolean }) {
  const [s, setS] = useState<PlayerState>(() => AudioPlaybackQueue.getState());
  useEffect(() => AudioPlaybackQueue.onState(setS), []);

  const active = enabled && (s.status !== "idle" || s.queueLength > 0 || s.historyLength > 0);
  if (!active) return null;

  const speaking = s.status === "playing";
  const pct = Math.max(0, Math.min(1, s.progress)) * 100;

  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-24 sm:bottom-6 z-40 w-[min(92vw,540px)] float-in">
      <div className="glass rounded-2xl p-3 sm:p-4 shadow-2xl border border-border/50 relative overflow-hidden">
        <div className="absolute inset-0 gradient-anim opacity-10 pointer-events-none" />
        <div className="relative">
          {/* Top row: status + language */}
          <div className="flex items-center gap-2 text-[11px] mb-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${
              speaking ? "bg-primary/15 text-primary" : "bg-muted/60 text-muted-foreground"
            }`}>
              <Radio className={`w-3 h-3 ${speaking ? "animate-pulse" : ""}`} />
              {speaking ? "Interpreting" : s.status === "paused" ? "Paused" : "Idle"}
            </span>
            {s.currentLanguage && (
              <span className="text-muted-foreground">
                Voice: <b className="text-foreground">{s.currentLanguage}</b>
              </span>
            )}
            <span className="text-muted-foreground ml-auto tabular-nums">
              {s.queueLength > 0 && `${s.queueLength} queued`}
            </span>
          </div>

          {/* Current sentence */}
          <p className="text-sm leading-snug text-foreground/90 min-h-[2.5rem] line-clamp-2">
            {s.currentText || <span className="text-muted-foreground italic">Waiting for next interpreted segment…</span>}
          </p>

          {/* Progress bar */}
          <div className="mt-2 h-1 rounded-full bg-muted/60 overflow-hidden">
            <div className="h-full gradient-primary transition-[width] duration-150" style={{ width: `${pct}%` }} />
          </div>

          {/* Controls */}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => AudioPlaybackQueue.replayPrevious()}
              disabled={s.historyLength === 0}
              className="w-9 h-9 rounded-full glass grid place-items-center disabled:opacity-40 hover:scale-105 transition"
              title="Replay previous segment"
              aria-label="Replay previous"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => (s.status === "paused" ? AudioPlaybackQueue.resume() : AudioPlaybackQueue.pause())}
              className="w-11 h-11 rounded-full gradient-primary text-white grid place-items-center shadow-lg hover:scale-105 transition"
              title={s.status === "paused" ? "Resume" : "Pause"}
              aria-label={s.status === "paused" ? "Resume" : "Pause"}
            >
              {s.status === "paused" ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={() => AudioPlaybackQueue.skip()}
              disabled={s.status === "idle"}
              className="w-9 h-9 rounded-full glass grid place-items-center disabled:opacity-40 hover:scale-105 transition"
              title="Skip current"
              aria-label="Skip"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-border/60 mx-1" />

            <button
              type="button"
              onClick={() => AudioPlaybackQueue.toggleMute()}
              className="w-9 h-9 rounded-full glass grid place-items-center hover:scale-105 transition"
              title={s.muted ? "Unmute" : "Mute"}
              aria-label={s.muted ? "Unmute" : "Mute"}
            >
              {s.muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <input
              type="range"
              min={0} max={1} step={0.05}
              value={s.muted ? 0 : s.volume}
              onChange={(e) => AudioPlaybackQueue.setVolume(Number(e.target.value))}
              className="flex-1 min-w-[80px] accent-primary"
              aria-label="Volume"
            />

            <label className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Gauge className="w-3.5 h-3.5" />
              <select
                value={s.rate}
                onChange={(e) => AudioPlaybackQueue.setRate(Number(e.target.value))}
                className="bg-muted/60 rounded px-1.5 py-0.5 text-xs border border-border/60 focus:outline-none focus:ring-1 focus:ring-primary/40"
                aria-label="Playback speed"
              >
                <option value={0.75}>0.75×</option>
                <option value={1}>1×</option>
                <option value={1.25}>1.25×</option>
                <option value={1.5}>1.5×</option>
                <option value={2}>2×</option>
              </select>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
