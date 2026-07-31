import { Link } from "@tanstack/react-router";
import { Mic, Pause, Play, Square, Minus } from "lucide-react";
import { useState } from "react";
import { useApp, formatTime } from "@/lib/app-store";
import { Waveform } from "./Waveform";

export function FloatingMiniRecorder() {
  const { recorder } = useApp();
  const [min, setMin] = useState(false);
  if (recorder.state === "idle") return null;

  if (min) {
    return (
      <button
        onClick={() => setMin(false)}
        className="fixed right-5 bottom-40 z-30 w-14 h-14 rounded-full gradient-primary grid place-items-center shadow-2xl"
      >
        <Mic className="w-5 h-5 text-white" />
        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-destructive animate-pulse" />
      </button>
    );
  }

  return (
    <div className="fixed right-5 bottom-40 md:bottom-24 z-30 w-[300px] glass-strong rounded-3xl p-4 float-in">
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-2 h-2 rounded-full ${recorder.state === "recording" ? "bg-destructive animate-pulse" : "bg-warning"}`} />
        <span className="text-xs font-medium">{recorder.state === "recording" ? "Recording" : "Paused"}</span>
        <span className="text-xs text-muted-foreground ml-auto tabular-nums">{formatTime(recorder.seconds)}</span>
        <button onClick={() => setMin(true)} className="p-1 rounded-md hover:bg-muted"><Minus className="w-3.5 h-3.5" /></button>
      </div>
      <Waveform active={recorder.state === "recording"} bars={28} className="h-10" />
      <div className="flex items-center gap-2 mt-3">
        {recorder.state === "recording" ? (
          <button onClick={recorder.pause} className="flex-1 h-9 rounded-xl bg-muted hover:bg-accent grid place-items-center"><Pause className="w-4 h-4" /></button>
        ) : (
          <button onClick={recorder.resume} className="flex-1 h-9 rounded-xl bg-muted hover:bg-accent grid place-items-center"><Play className="w-4 h-4" /></button>
        )}
        <button onClick={recorder.stop} className="flex-1 h-9 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 grid place-items-center">
          <Square className="w-3.5 h-3.5 fill-current" />
        </button>
        <Link to="/record" className="flex-1 h-9 rounded-xl gradient-primary text-white text-xs font-medium grid place-items-center">
          Open
        </Link>
      </div>
    </div>
  );
}
