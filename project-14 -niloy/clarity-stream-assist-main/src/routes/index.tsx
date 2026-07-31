import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Mic, Upload, Library, ArrowRight, Languages, FileText, Bookmark, MessagesSquare, Download, Sparkles, Pause, Play } from "lucide-react";
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

const primaryActions = [
  { to: "/record", icon: Mic, title: "Start Live Session", desc: "Record and transcribe in real time.", tint: "from-indigo-500/20 to-fuchsia-500/20" },
  { to: "/upload", icon: Upload, title: "Upload Recording", desc: "Drop in an audio or video file.", tint: "from-sky-500/20 to-indigo-500/20" },
  { to: "/library", icon: Library, title: "Open My Library", desc: "Browse past sessions and notes.", tint: "from-fuchsia-500/20 to-pink-500/20" },
] as const;

const features = [
  { icon: Mic, label: "Live Recording", to: "/record" as const },
  { icon: FileText, label: "AI Transcript", to: "/library" as const },
  { icon: Languages, label: "Translation", to: "/record" as const },
  { icon: Sparkles, label: "Accessibility", to: "/" as const },
  { icon: MessagesSquare, label: "AI Chat", to: "/library" as const },
  { icon: Bookmark, label: "Bookmarks", to: "/library" as const },
  { icon: Download, label: "Export", to: "/library" as const },
];

function Home() {
  const { hydrated, language } = useApp();
  const [paused, setPaused] = useState(false);
  return (
    <AppShell>
      {/* Greeting first-experience */}
      <section className="pt-6 pb-2 float-in">
        <p className="text-sm text-muted-foreground">{hydrated ? greeting() : "Welcome"} 👋</p>
        <h1 className="mt-1 text-[clamp(1.75rem,6.5vw,3rem)] md:text-5xl font-extrabold tracking-tight leading-[1.1] text-balance">
          What would you like to <span className="gradient-text">do today?</span>
        </h1>
      </section>

      <section className="mt-6 md:mt-8 grid gap-4 md:grid-cols-3">
        {primaryActions.map(({ to, icon: Icon, title, desc, tint }, i) => (
          <Link
            key={to}
            to={to}
            className="group relative overflow-hidden rounded-3xl p-6 glass hover-lift float-in"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="absolute inset-0 gradient-anim opacity-20 pointer-events-none" />
            <div className={`absolute -top-16 -right-16 w-56 h-56 rounded-full bg-gradient-to-br ${tint} blur-2xl opacity-70 group-hover:opacity-100 transition`} />
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl glass grid place-items-center shadow-sm">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="mt-5 text-base sm:text-lg font-semibold text-balance">{title}</h3>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground text-pretty leading-relaxed">{desc}</p>
              <div className="mt-6 inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-primary">
                Get started <ArrowRight className="w-4 h-4 transition group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        ))}
      </section>

      {/* Hero */}
      <section className="mt-4 md:mt-8 rounded-[2rem] p-6 md:p-14 glass relative overflow-hidden">
        <div className="absolute inset-0 gradient-anim opacity-20" />
        <div className="relative grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Real-time AI, always listening
            </span>
            <h2 className="mt-4 text-[clamp(1.75rem,7vw,3rem)] md:text-5xl font-extrabold tracking-tight leading-[1.1] text-balance">
              Real-Time <span className="gradient-text">AI Accessibility</span> Assistant
            </h2>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-md text-pretty leading-relaxed">
              Record. Transcribe. Translate. Summarize. All in real time — designed for lectures, meetings, webinars and every learner.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/record" className="inline-flex items-center gap-2 gradient-primary text-white px-5 py-3 rounded-full font-medium shadow-lg hover:opacity-95">
                <Mic className="w-4 h-4" /> Start Live Session
              </Link>
              <Link to="/upload" className="inline-flex items-center gap-2 glass px-5 py-3 rounded-full font-medium hover:bg-card">
                <Upload className="w-4 h-4" /> Upload Recording
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="mx-auto w-56 h-56 rounded-full grid place-items-center relative">
              <div className="absolute inset-0 rounded-full gradient-primary opacity-20 pulse-ring" />
              <div className="absolute inset-4 rounded-full gradient-primary opacity-30 pulse-ring" style={{ animationDelay: "0.5s" }} />
              <div className="relative w-32 h-32 rounded-full gradient-primary grid place-items-center shadow-2xl">
                <Mic className="w-12 h-12 text-white" />
              </div>
            </div>
            <div className="mt-4 glass rounded-2xl p-4 flex items-center gap-3">
              <button
                onClick={() => setPaused((p) => !p)}
                aria-label={paused ? "Resume" : "Pause"}
                className="shrink-0 w-10 h-10 rounded-full gradient-primary text-white grid place-items-center shadow-lg hover:opacity-90 transition"
              >
                {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
              <div className={`flex-1 transition-opacity ${paused ? "opacity-40" : "opacity-100"}`}>
                <Waveform bars={44} />
              </div>
            </div>
          </div>
        </div>
      </section>

    </AppShell>
  );
}
