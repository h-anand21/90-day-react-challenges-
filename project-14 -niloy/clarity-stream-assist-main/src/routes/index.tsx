import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Mic,
  Upload,
  Library,
  ArrowRight,
  Sparkles,
  Pause,
  Play,
  Bell,
  ChevronDown,
  Folder,
  CloudUpload,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Waveform } from "@/components/Waveform";
import { useApp } from "@/lib/app-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AccessAI — Record. Transcribe. Translate. Summarize." },
      { name: "description", content: "Your real-time AI accessibility assistant for lectures, meetings and webinars. Live transcripts, translations, summaries and accessibility tools." },
      { property: "og:title", content: "AccessAI — Record. Transcribe. Translate. Summarize." },
      { property: "og:description", content: "Your real-time AI accessibility assistant for lectures, meetings and webinars. Live transcripts, translations, summaries and accessibility tools." },
    ],
  }),
  component: Home,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function Home() {
  const { hydrated, theme } = useApp();
  const [paused, setPaused] = useState(false);

  return (
    <AppShell>
      {/* HEADER BAR & GREETING */}
      <section className="pt-2 pb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5">
            <span>{hydrated ? greeting() : "Welcome"}</span>
            <span>{theme === "dark" ? "☀️" : "👋"}</span>
          </p>
          <h1 className="mt-1 text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">
            What would you like to <span className="gradient-text">do today?</span>
          </h1>
        </div>

        {/* Top Right User Profile & Notification Bar */}
        <div className="flex items-center gap-3">
          <button
            aria-label="Notifications"
            className="p-2.5 rounded-full bg-card border border-border shadow-sm hover:bg-muted transition relative text-foreground"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-card" />
          </button>

          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-card border border-border shadow-sm text-foreground">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-white font-extrabold text-xs flex items-center justify-center border border-white/20">
              R
            </div>
            <div className="text-left leading-tight hidden sm:block">
              <span className="text-xs font-extrabold text-foreground block">Rohan</span>
              <span className="text-[10px] text-muted-foreground font-medium block">Free Plan</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
        </div>
      </section>

      {/* 3 TOP ACTION CARDS GRID MATCHING SCREENSHOT EXACTLY */}
      <section className="mt-4 md:mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* CARD 1: START LIVE SESSION (ORANGE ACCENT) */}
        <Link
          to="/record"
          className="group relative overflow-hidden rounded-3xl p-6 sm:p-7 bg-card border border-border shadow-sm hover-lift transition-all flex flex-col justify-between"
        >
          {/* Subtle Orange Waveform Graphic */}
          <div className="absolute right-0 bottom-0 opacity-15 pointer-events-none group-hover:opacity-25 transition-opacity">
            <svg width="180" height="100" viewBox="0 0 180 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 80 Q 45 20, 90 60 T 180 40" stroke="#f97316" strokeWidth="2" fill="none" />
              <path d="M0 60 Q 45 90, 90 30 T 180 70" stroke="#f97316" strokeWidth="1.5" fill="none" />
              <path d="M0 40 Q 45 10, 90 80 T 180 20" stroke="#f97316" strokeWidth="1" fill="none" />
            </svg>
          </div>

          <div>
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 transition-transform">
              <Mic className="w-6 h-6" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-card-foreground">Start Live Session</h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Record and transcribe in real time.</p>
          </div>

          <div className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-orange-500 group-hover:translate-x-1 transition-transform">
            <span>Get started</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        {/* CARD 2: UPLOAD RECORDING (GREEN ACCENT) */}
        <Link
          to="/upload"
          className="group relative overflow-hidden rounded-3xl p-6 sm:p-7 bg-card border border-border shadow-sm hover-lift transition-all flex flex-col justify-between"
        >
          {/* 3D Cloud Upload Graphic */}
          <div className="absolute right-3 bottom-2 opacity-25 group-hover:opacity-40 transition-opacity pointer-events-none">
            <div className="w-24 h-24 rounded-full bg-emerald-500/20 blur-xl absolute -right-2 -bottom-2" />
            <CloudUpload className="w-20 h-20 text-emerald-500/50" />
          </div>

          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-card-foreground">Upload Recording</h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Drop in an audio or video file.</p>
          </div>

          <div className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-500 group-hover:translate-x-1 transition-transform">
            <span>Get started</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        {/* CARD 3: OPEN MY LIBRARY (BLUE ACCENT) */}
        <Link
          to="/library"
          className="group relative overflow-hidden rounded-3xl p-6 sm:p-7 bg-card border border-border shadow-sm hover-lift transition-all flex flex-col justify-between"
        >
          {/* 3D Blue Folder Stack Graphic */}
          <div className="absolute right-3 bottom-2 opacity-25 group-hover:opacity-40 transition-opacity pointer-events-none">
            <div className="w-24 h-24 rounded-full bg-blue-500/20 blur-xl absolute -right-2 -bottom-2" />
            <Folder className="w-20 h-20 text-blue-500/50" />
          </div>

          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 transition-transform">
              <Library className="w-6 h-6" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-card-foreground">Open My Library</h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Browse past sessions and notes.</p>
          </div>

          <div className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-blue-500 group-hover:translate-x-1 transition-transform">
            <span>Get started</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

      </section>

      {/* MAIN STUDIO HERO BANNER CARD MATCHING SCREENSHOT */}
      <section className="mt-6 md:mt-8 rounded-[2.5rem] p-6 sm:p-10 md:p-14 bg-card border border-border shadow-xl relative overflow-hidden text-left">
        <div className="relative grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          
          {/* Left Text & CTAs */}
          <div className="md:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span>Real-time AI, always listening</span>
            </div>

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-card-foreground tracking-tight leading-[1.08]">
              Real-Time <span className="gradient-text">AI Accessibility</span> Assistant
            </h2>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg">
              Record. Transcribe. Translate. Summarize. All in real time — designed for lectures, meetings, webinars and every learner.
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-3">
              <Link
                to="/record"
                className="inline-flex items-center gap-2 gradient-primary text-white px-7 py-3.5 rounded-full font-bold text-xs sm:text-sm shadow-lg shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all"
              >
                <Mic className="w-4 h-4" />
                <span>Start Live Session</span>
              </Link>

              <Link
                to="/upload"
                className="inline-flex items-center gap-2 bg-muted/80 hover:bg-muted border border-border text-foreground px-6 py-3.5 rounded-full font-bold text-xs sm:text-sm transition-all"
              >
                <Upload className="w-4 h-4 text-muted-foreground" />
                <span>Upload Recording</span>
              </Link>
            </div>
          </div>

          {/* Right Concentric Radar & Waveform Control Pill Graphic */}
          <div className="md:col-span-5 relative flex flex-col items-center justify-center">
            
            {/* Concentric Radar Rings */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-orange-500/20 animate-ping opacity-25" style={{ animationDuration: "4s" }} />
              <div className="absolute inset-6 rounded-full border border-orange-500/30" />
              <div className="absolute inset-12 rounded-full border border-orange-500/40" />
              
              {/* Pulsing Mic Orb Button */}
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full gradient-primary text-white shadow-2xl shadow-orange-500/50 flex items-center justify-center scale-105">
                <Mic className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* Floating Live Audio Waveform Control Pill */}
            <div className="mt-4 w-full max-w-sm rounded-full bg-card/95 border border-border p-3 shadow-2xl flex items-center gap-3 backdrop-blur-xl">
              <button
                onClick={() => setPaused((p) => !p)}
                aria-label={paused ? "Resume" : "Pause"}
                className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition-all"
              >
                {paused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
              </button>

              <div className={`flex-1 transition-opacity ${paused ? "opacity-30" : "opacity-100"}`}>
                <Waveform active={!paused} bars={36} />
              </div>
            </div>

          </div>

        </div>
      </section>

    </AppShell>
  );
}
