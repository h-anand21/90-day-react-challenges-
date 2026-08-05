import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
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
  Zap,
  Volume2,
  CheckCircle2,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Waveform } from "@/components/Waveform";
import { useApp } from "@/lib/app-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ClarityStream AI — Record. Transcribe. Translate. Summarize." },
      { name: "description", content: "Your real-time AI accessibility assistant for lectures, meetings and webinars. Live transcripts, translations, summaries and accessibility tools." },
      { property: "og:title", content: "ClarityStream AI — Record. Transcribe. Translate. Summarize." },
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

const SAMPLE_TEST_CAPTION = "🎙️ Capturing live speech input... ClarityStream AI is transcribing audio line-by-line with 97% confidence and sub-50ms latency.";
const SAMPLE_TEST_TRANSLATION = "🇮🇳 हिंदी अनुवाद: लाइव ऑडियो ट्रांसक्रिप्शन और रियल-टाइम AI व्याख्यान रिकॉर्डिंग active है।";

function Home() {
  const { hydrated, theme } = useApp();
  const [paused, setPaused] = useState(false);
  const [isTestingAnimation, setIsTestingAnimation] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [typedHindi, setTypedHindi] = useState("");

  const runTestAnimation = () => {
    setIsTestingAnimation(true);
    setPaused(false);
    setTypedText("");
    setTypedHindi("");

    let i = 0;
    const interval = setInterval(() => {
      if (i < SAMPLE_TEST_CAPTION.length) {
        setTypedText(SAMPLE_TEST_CAPTION.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        let j = 0;
        const intervalHindi = setInterval(() => {
          if (j < SAMPLE_TEST_TRANSLATION.length) {
            setTypedHindi(SAMPLE_TEST_TRANSLATION.slice(0, j + 1));
            j++;
          } else {
            clearInterval(intervalHindi);
          }
        }, 30);
      }
    }, 25);
  };

  return (
    <AppShell>
      {/* HEADER BAR & GREETING WITH ENTRANCE ANIMATION */}
      <motion.section
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="pt-3 pb-2 text-left"
      >
        <p className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5">
          <span>{hydrated ? greeting() : "Welcome"}</span>
          <span>{theme === "dark" ? "☀️" : "👋"}</span>
        </p>
        <h1 className="mt-1 text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">
          What would you like to <span className="gradient-text">do today?</span>
        </h1>
      </motion.section>

      {/* 3 TOP ACTION CARDS GRID WITH STAGGERED ENTRANCE & HOVER ELEVATION */}
      <section className="mt-4 md:mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* CARD 1: START LIVE SESSION (ORANGE ACCENT) */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ y: -6, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link
            to="/record"
            className="group relative overflow-hidden rounded-3xl p-6 sm:p-7 bg-card border border-border shadow-sm transition-all flex flex-col justify-between h-full block"
          >
            <div className="absolute right-0 bottom-0 opacity-15 pointer-events-none group-hover:opacity-30 transition-opacity">
              <svg width="180" height="100" viewBox="0 0 180 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 80 Q 45 20, 90 60 T 180 40" stroke="#f97316" strokeWidth="2" fill="none" />
                <path d="M0 60 Q 45 90, 90 30 T 180 70" stroke="#f97316" strokeWidth="1.5" fill="none" />
                <path d="M0 40 Q 45 10, 90 80 T 180 20" stroke="#f97316" strokeWidth="1" fill="none" />
              </svg>
            </div>

            <div>
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                <Mic className="w-6 h-6" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-card-foreground group-hover:text-orange-500 transition-colors">Start Live Session</h2>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Record and transcribe in real time.</p>
            </div>

            <div className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-orange-500 group-hover:translate-x-1.5 transition-transform">
              <span>Get started</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </motion.div>

        {/* CARD 2: UPLOAD RECORDING (GREEN ACCENT) */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ y: -6, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link
            to="/upload"
            className="group relative overflow-hidden rounded-3xl p-6 sm:p-7 bg-card border border-border shadow-sm transition-all flex flex-col justify-between h-full block"
          >
            <div className="absolute right-3 bottom-2 opacity-25 group-hover:opacity-50 transition-opacity pointer-events-none">
              <div className="w-24 h-24 rounded-full bg-emerald-500/20 blur-xl absolute -right-2 -bottom-2" />
              <CloudUpload className="w-20 h-20 text-emerald-500/50 group-hover:scale-110 transition-transform" />
            </div>

            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                <Upload className="w-6 h-6" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-card-foreground group-hover:text-emerald-500 transition-colors">Upload Recording</h2>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Drop in an audio or video file.</p>
            </div>

            <div className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-500 group-hover:translate-x-1.5 transition-transform">
              <span>Get started</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </motion.div>

        {/* CARD 3: OPEN MY LIBRARY (BLUE ACCENT) */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileHover={{ y: -6, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link
            to="/library"
            className="group relative overflow-hidden rounded-3xl p-6 sm:p-7 bg-card border border-border shadow-sm transition-all flex flex-col justify-between h-full block"
          >
            <div className="absolute right-3 bottom-2 opacity-25 group-hover:opacity-50 transition-opacity pointer-events-none">
              <div className="w-24 h-24 rounded-full bg-blue-500/20 blur-xl absolute -right-2 -bottom-2" />
              <Folder className="w-20 h-20 text-blue-500/50 group-hover:scale-110 transition-transform" />
            </div>

            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                <Library className="w-6 h-6" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-card-foreground group-hover:text-blue-500 transition-colors">Open My Library</h2>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Browse past sessions and notes.</p>
            </div>

            <div className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-blue-500 group-hover:translate-x-1.5 transition-transform">
              <span>Get started</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </motion.div>

      </section>

      {/* MAIN STUDIO HERO BANNER CARD WITH TEST ANIMATION DEMO ENGINE */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-6 md:mt-8 rounded-[2.5rem] p-6 sm:p-10 md:p-14 bg-card border border-border shadow-xl relative overflow-hidden text-left"
      >
        <div className="relative grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          
          {/* Left Text & CTAs */}
          <div className="md:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-bold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
              <span>Real-time AI, always listening</span>
            </div>

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-card-foreground tracking-tight leading-[1.08]">
              Real-Time <span className="gradient-text">AI Accessibility</span> Assistant
            </h2>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg">
              Record. Transcribe. Translate. Summarize. All in real time — designed for lectures, meetings, webinars and every learner.
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/record"
                  className="inline-flex items-center gap-2 gradient-primary text-white px-7 py-3.5 rounded-full font-bold text-xs sm:text-sm shadow-lg shadow-orange-500/30 transition-all"
                >
                  <Mic className="w-4 h-4 animate-pulse" />
                  <span>Start Live Session</span>
                </Link>
              </motion.div>

              {/* TEST ANIMATION NOW BUTTON */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={runTestAnimation}
                className="inline-flex items-center gap-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-500 px-6 py-3.5 rounded-full font-extrabold text-xs sm:text-sm transition-all shadow-sm"
              >
                <Zap className="w-4 h-4 fill-orange-500" />
                <span>Test Animation Now</span>
              </motion.button>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/upload"
                  className="inline-flex items-center gap-2 bg-muted/80 hover:bg-muted border border-border text-foreground px-6 py-3.5 rounded-full font-bold text-xs sm:text-sm transition-all"
                >
                  <Upload className="w-4 h-4 text-muted-foreground" />
                  <span>Upload Recording</span>
                </Link>
              </motion.div>
            </div>

            {/* LIVE TEST ANIMATION CAPTION BOX OVERLAY */}
            <AnimatePresence>
              {isTestingAnimation && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-4 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-left space-y-2 backdrop-blur-md shadow-inner"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-orange-500">
                    <span className="flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                      <span>Live Visual Audio Stream</span>
                    </span>
                    <span className="flex items-center gap-1 text-[11px] bg-orange-500 text-white px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>97% Confidence</span>
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-foreground font-mono leading-relaxed">
                    {typedText || "Listening for speech..."}
                  </p>

                  {typedHindi && (
                    <p className="text-xs sm:text-sm font-bold text-orange-400 font-sans leading-relaxed pt-1 border-t border-orange-500/20">
                      {typedHindi}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Concentric Radar & Waveform Control Pill Graphic */}
          <div className="md:col-span-5 relative flex flex-col items-center justify-center">
            
            {/* Concentric Radar Rings */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full flex items-center justify-center">
              <div className={`absolute inset-0 rounded-full border border-orange-500/20 animate-ping ${isTestingAnimation ? "opacity-60" : "opacity-30"}`} style={{ animationDuration: isTestingAnimation ? "1.5s" : "4s" }} />
              <div className="absolute inset-6 rounded-full border border-orange-500/30 animate-pulse" />
              <div className="absolute inset-12 rounded-full border border-orange-500/40" />
              
              {/* Pulsing Mic Orb Button */}
              <motion.div
                animate={{ scale: isTestingAnimation ? [1, 1.15, 1] : [1, 1.06, 1] }}
                transition={{ duration: isTestingAnimation ? 1 : 2.5, repeat: Infinity, ease: "easeInOut" }}
                onClick={runTestAnimation}
                className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full gradient-primary text-white shadow-2xl shadow-orange-500/50 flex items-center justify-center cursor-pointer"
              >
                <Mic className="w-12 h-12 text-white" />
              </motion.div>
            </div>

            {/* Floating Live Audio Waveform Control Pill */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="mt-4 w-full max-w-sm rounded-full bg-card/95 border border-border p-3 shadow-2xl flex items-center gap-3 backdrop-blur-xl"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setPaused((p) => !p)}
                aria-label={paused ? "Resume" : "Pause"}
                className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition-all shadow-md"
              >
                {paused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
              </motion.button>

              <div className={`flex-1 transition-opacity ${paused ? "opacity-30" : "opacity-100"}`}>
                <Waveform active={!paused || isTestingAnimation} bars={36} />
              </div>
            </motion.div>

          </div>

        </div>
      </motion.section>

    </AppShell>
  );
}
