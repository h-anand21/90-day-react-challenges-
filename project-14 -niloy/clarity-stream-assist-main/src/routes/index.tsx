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
  Radio,
  FileText,
  UserCheck,
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

const LIVE_SPEECH_STREAM = [
  {
    speaker: "Prof. Sharma (Lecture Mic)",
    en: "🎙️ Live Speech Input: Welcome to today's lecture on AI Accessibility and Real-Time Speech Processing.",
    hi: "🇮🇳 लाइव हिंदी अनुवाद: एआई एक्सेसिबिलिटी और रियल-टाइम स्पीच प्रोसेसिंग पर आज के व्याख्यान में आपका स्वागत है।",
    precision: "99.6%",
  },
  {
    speaker: "Student Q&A (Rohan)",
    en: "🎙️ Live Speech Input: How fast does ClarityStream AI process multi-language live captions?",
    hi: "🇮🇳 लाइव हिंदी अनुवाद: ClarityStream AI कितनी तेजी से बहुभाषी लाइव कैप्शन प्रोसेस करता है?",
    precision: "99.4%",
  },
  {
    speaker: "AI Engine Response",
    en: "🎙️ Live Speech Input: Capturing live audio with under 50ms latency and 99.8% precision across 20+ languages.",
    hi: "🇮🇳 लाइव हिंदी अनुवाद: 50 मिलीसेकंड से कम की विलंबता के साथ 20 से अधिक भाषाओं में लाइव ऑडियो कैप्चर हो रहा है।",
    precision: "99.8%",
  },
  {
    speaker: "Dr. Ananya (Seminar Host)",
    en: "🎙️ Live Speech Input: Automated action items and meeting minutes are being generated and saved in real-time.",
    hi: "🇮🇳 लाइव हिंदी अनुवाद: स्वचालित कार्रवाई आइटम और मीटिंग सारांश नोट्स रियल-टाइम में सहेजे जा रहे हैं।",
    precision: "99.5%",
  },
];

function Home() {
  const { hydrated, theme } = useApp();
  const [isPlaying, setIsPlaying] = useState(true);
  const [streamIndex, setStreamIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [typedHindi, setTypedHindi] = useState("");

  const currentItem = LIVE_SPEECH_STREAM[streamIndex];

  useEffect(() => {
    if (!isPlaying) return;

    let isCancelled = false;
    setTypedText("");
    setTypedHindi("");

    let i = 0;
    const enInterval = setInterval(() => {
      if (isCancelled) return;
      if (i < currentItem.en.length) {
        setTypedText(currentItem.en.slice(0, i + 1));
        i++;
      } else {
        clearInterval(enInterval);
        let j = 0;
        const hiInterval = setInterval(() => {
          if (isCancelled) return;
          if (j < currentItem.hi.length) {
            setTypedHindi(currentItem.hi.slice(0, j + 1));
            j++;
          } else {
            clearInterval(hiInterval);
            const timeout = setTimeout(() => {
              if (!isCancelled) {
                setStreamIndex((prev) => (prev + 1) % LIVE_SPEECH_STREAM.length);
              }
            }, 2000);
            return () => clearTimeout(timeout);
          }
        }, 18);
      }
    }, 16);

    return () => {
      isCancelled = true;
      clearInterval(enInterval);
    };
  }, [streamIndex, isPlaying]);

  const togglePlayback = () => {
    setIsPlaying((prev) => !prev);
  };

  const forceNextStream = () => {
    setIsPlaying(true);
    setStreamIndex((prev) => (prev + 1) % LIVE_SPEECH_STREAM.length);
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

      {/* MAIN STUDIO HERO BANNER CARD WITH CONTINUOUS MULTI-SPEAKER LIVE AUDIO STREAM */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-6 md:mt-8 rounded-[2.5rem] p-6 sm:p-10 md:p-14 bg-card border border-border shadow-xl relative overflow-hidden text-left"
      >
        <div className="relative grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          
          {/* Left Text & CTAs */}
          <div className="md:col-span-7 space-y-4">
            {/* Tag Pill with glowing pulsing dot & animated text */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500/15 via-amber-500/15 to-orange-500/15 border border-orange-500/30 text-orange-500 text-xs font-black tracking-wide shadow-sm"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500" />
              </span>
              <span className="gradient-text-animated font-extrabold uppercase tracking-wider text-[11px]">Real-time AI, always listening</span>
            </motion.div>

            {/* Headline with Staggered Word Entrance & Continuous Shimmer Animation */}
            <motion.h2
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
              }}
              className="text-3xl sm:text-5xl md:text-6xl font-black text-card-foreground tracking-tight leading-[1.08]"
            >
              <motion.span
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="inline-block mr-2 sm:mr-3"
              >
                Real-Time
              </motion.span>
              <motion.span
                variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }}
                className="gradient-text-animated inline-block mr-2 sm:mr-3 drop-shadow-sm"
              >
                AI Accessibility
              </motion.span>
              <motion.span
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="inline-block"
              >
                Assistant
              </motion.span>
            </motion.h2>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg">
              Record. Transcribe. Translate. Summarize. All in real time — designed for lectures, meetings, webinars and every learner.
            </p>

            {/* CTAs */}
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

              {/* TEST NEXT STREAM BUTTON */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={forceNextStream}
                className="inline-flex items-center gap-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-500 px-6 py-3.5 rounded-full font-extrabold text-xs sm:text-sm transition-all shadow-sm"
              >
                <Zap className="w-4 h-4 fill-orange-500 animate-pulse" />
                <span>Next Speech Sentence →</span>
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

            {/* CONTINUOUS MULTI-SPEAKER LIVE AUDIO STREAM BOX */}
            <AnimatePresence mode="wait">
              <motion.div
                key={streamIndex}
                initial={{ opacity: 0, y: 15, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.97 }}
                transition={{ duration: 0.35 }}
                className="mt-4 p-4.5 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-left space-y-2.5 backdrop-blur-md shadow-inner relative overflow-hidden"
              >
                <div className="flex items-center justify-between text-xs font-extrabold text-orange-500">
                  <span className="flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 animate-bounce text-orange-500" />
                    <span>Speaker: {currentItem.speaker}</span>
                  </span>
                  <span className="flex items-center gap-1 text-[11px] bg-orange-500 text-white font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{currentItem.precision} Precision</span>
                  </span>
                </div>

                {/* Typewriter Speech Stream */}
                <div className="space-y-1.5 pt-1">
                  <p className="text-xs sm:text-sm font-semibold text-foreground font-mono leading-relaxed flex items-start gap-2">
                    <FileText className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <span>{typedText || "Listening to audio..."}</span>
                  </p>

                  {typedHindi && (
                    <p className="text-xs sm:text-sm font-bold text-orange-400 font-sans leading-relaxed pt-2 border-t border-orange-500/20">
                      {typedHindi}
                    </p>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Concentric Radar & Waveform Control Pill Graphic */}
          <div className="md:col-span-5 relative flex flex-col items-center justify-center">
            
            {/* Concentric Radar Rings */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full flex items-center justify-center">
              <div className={`absolute inset-0 rounded-full border border-orange-500/20 animate-ping ${isPlaying ? "opacity-60" : "opacity-20"}`} style={{ animationDuration: isPlaying ? "1.5s" : "4s" }} />
              <div className="absolute inset-6 rounded-full border border-orange-500/30 animate-pulse" />
              <div className="absolute inset-12 rounded-full border border-orange-500/40" />
              
              {/* Pulsing Mic Orb Button */}
              <motion.div
                animate={{ scale: isPlaying ? [1, 1.12, 1] : [1, 1.04, 1] }}
                transition={{ duration: isPlaying ? 1 : 2.5, repeat: Infinity, ease: "easeInOut" }}
                onClick={togglePlayback}
                className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full gradient-primary text-white shadow-2xl shadow-orange-500/50 flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                title="Click to toggle live audio wave animation"
              >
                <Mic className="w-12 h-12 text-white" />
              </motion.div>
            </div>

            {/* Floating Live Audio Waveform Control Pill with Interactive Pause/Play */}
            <motion.div
              whileHover={{ scale: 1.04 }}
              className="mt-4 w-full max-w-sm rounded-full bg-card/95 border border-border p-3 shadow-2xl flex items-center gap-3 backdrop-blur-xl"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={togglePlayback}
                aria-label={isPlaying ? "Pause audio wave animation" : "Play audio wave animation"}
                className="w-11 h-11 rounded-full bg-foreground text-background flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition-all shadow-md"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </motion.button>

              <div className={`flex-1 transition-opacity ${isPlaying ? "opacity-100" : "opacity-40"}`}>
                <Waveform active={isPlaying} bars={38} />
              </div>
            </motion.div>

          </div>

        </div>
      </motion.section>

    </AppShell>
  );
}
