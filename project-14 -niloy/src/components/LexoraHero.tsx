import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Play,
  Pause,
  Sparkles,
  ArrowRight,
  Globe,
  Check,
  ChevronDown,
  Volume2,
  CheckCircle2,
  Zap,
} from 'lucide-react';

export const LexoraHero: React.FC = () => {
  const [isRecording, setIsRecording] = useState(true);
  const [selectedLang, setSelectedLang] = useState('English');
  const [selectedTransLang, setSelectedTransLang] = useState('Spanish');
  const [timerCount, setTimerCount] = useState(165); // 02:45
  
  // Real-time character typing simulation
  const fullCaption = "Good morning everyone, today we will discuss the Q3 performance metrics and key accessibility goals...";
  const fullTranslation = "Buenos días a todos, hoy discutiremos el informe trimestral y las métricas clave de este período.";
  
  const [typedCaption, setTypedCaption] = useState('');
  const [typedTranslation, setTypedTranslation] = useState('');
  const [gaugeProgress, setGaugeProgress] = useState(0);

  // Animated Gauge Count Up on Load
  useEffect(() => {
    const timeout = setTimeout(() => {
      setGaugeProgress(92);
    }, 500);
    return () => clearTimeout(timeout);
  }, []);

  // Character typing effect
  useEffect(() => {
    if (!isRecording) return;
    let charIdx = 0;
    let transIdx = 0;
    const interval = setInterval(() => {
      charIdx = (charIdx + 1) % (fullCaption.length + 1);
      transIdx = Math.floor((charIdx / fullCaption.length) * fullTranslation.length);
      
      setTypedCaption(fullCaption.slice(0, Math.max(12, charIdx)));
      setTypedTranslation(fullTranslation.slice(0, Math.max(15, transIdx)));
    }, 80);

    return () => clearInterval(interval);
  }, [isRecording]);

  // Live timer
  useEffect(() => {
    if (!isRecording) return;
    const timer = setInterval(() => {
      setTimerCount((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isRecording]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 min-h-screen flex flex-col justify-between overflow-hidden">
      {/* Generated Cinematic Sunset Mountain Background Asset */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-20 scale-105 transition-transform duration-1000"
        style={{
          backgroundImage: `url('/mountain_sunset_bg.png')`,
        }}
      />

      {/* Warm Golden Hour Ambient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0c10]/75 via-[#0c0e16]/60 to-[#080a0e] -z-10" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-orange-500/25 rounded-full blur-[180px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '6s' }} />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 w-full">
        
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold backdrop-blur-md shadow-2xl mb-6 hover:bg-white/15 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-orange-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>AI-Powered Accessibility Assistant</span>
        </motion.div>

        {/* Animated Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.08]"
        >
          Accessibility <br />
          <span className="font-serif-italic text-orange-400 font-normal tracking-normal">
            made intelligent.
          </span> <br />
          with AI.
        </motion.h1>

        {/* Animated Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-5 text-sm sm:text-base md:text-lg text-slate-200 max-w-2xl mx-auto font-normal leading-relaxed"
        >
          Lexora is an all-in-one AI assistant that records, transcribes, translates and summarizes in real-time for everyone, everywhere.
        </motion.p>

        {/* Animated Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-8 flex items-center justify-center gap-4"
        >
          <motion.a
            href="#demo"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleRecording}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold text-white glow-orange-button transition-all shadow-2xl shadow-orange-500/50"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4" />
          </motion.a>

          <motion.a
            href="#demo"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all shadow-xl"
          >
            <Play className="w-4 h-4 text-orange-400 fill-orange-400" />
            <span>Watch Demo</span>
          </motion.a>
        </motion.div>

        {/* ---------------------------------------------------- */}
        {/* FLOATING INTERACTIVE WIDGETS SECTION */}
        {/* ---------------------------------------------------- */}
        <div className="relative mt-12 mb-16 max-w-6xl mx-auto min-h-[460px]">
          
          {/* FLOATING WIDGET 1: Top-Left "Live Recording" */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0, y: [0, -8, 0] }}
            transition={{ opacity: { duration: 0.8, delay: 0.7 }, y: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }}
            className="absolute top-0 left-0 md:left-4 z-20 w-64 rounded-2xl bg-[#141720]/80 border border-white/15 p-4 backdrop-blur-xl shadow-2xl text-left hidden sm:block hover:border-orange-500/40 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs font-bold text-white">Live Recording</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-semibold">
                ● Live
              </span>
            </div>

            {/* Animated Equalizer Waveform */}
            <div className="flex items-end gap-1 h-10 my-3 px-2 py-1 bg-black/40 rounded-xl">
              {Array.from({ length: 18 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full bg-gradient-to-t from-orange-600 to-amber-400 transition-all ${
                    isRecording ? `animate-wave-${(i % 5) + 1}` : 'h-1 bg-slate-600'
                  }`}
                  style={{ height: isRecording ? `${Math.sin(i * 0.7 + Date.now() * 0.003) * 12 + 18}px` : '4px' }}
                />
              ))}
            </div>

            <div className="text-[11px] font-mono text-slate-300 font-semibold flex items-center justify-between">
              <span>{formatTimer(timerCount)}</span>
              <span className="text-[10px] text-orange-400 font-sans">44.1 kHz • HD</span>
            </div>
          </motion.div>

          {/* FLOATING WIDGET 2: Top-Right "Live Caption" with Character Typing Animation */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0, y: [0, -10, 0] }}
            transition={{ opacity: { duration: 0.8, delay: 0.8 }, y: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 } }}
            className="absolute top-4 right-0 md:right-4 z-20 w-72 rounded-2xl bg-[#141720]/80 border border-white/15 p-4 backdrop-blur-xl shadow-2xl text-left hidden sm:block hover:border-orange-500/40 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-white">Live Caption</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                <Globe className="w-3 h-3 text-orange-400" />
                <span>{selectedLang}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
            </div>

            <div className="text-xs text-slate-200 leading-relaxed font-sans mt-2 italic bg-black/40 p-2.5 rounded-xl border border-white/5 min-h-[54px]">
              "{typedCaption}"<span className="inline-block w-1.5 h-3 bg-orange-500 ml-0.5 animate-pulse" />
            </div>
          </motion.div>

          {/* FLOATING WIDGET 3: Center Pulsing Mic Orb */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30"
          >
            <div className="relative group cursor-pointer" onClick={toggleRecording}>
              <div className={`absolute -inset-4 rounded-full bg-orange-500/25 ${isRecording ? 'animate-mic-pulse' : ''}`} />
              <div className="absolute -inset-8 rounded-full bg-orange-500/10 animate-ping" style={{ animationDuration: '3s' }} />
              
              <button className="relative w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-2xl shadow-orange-500/60 group-hover:scale-110 active:scale-95 transition-all">
                <Mic className="w-7 h-7 text-white group-hover:rotate-6 transition-transform" />
              </button>
            </div>
          </motion.div>

          {/* FLOATING WIDGET 4: Bottom-Left "AI Summary" */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: [0, -6, 0] }}
            transition={{ opacity: { duration: 0.8, delay: 0.9 }, y: { duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 } }}
            className="absolute bottom-4 left-0 md:left-6 z-20 w-64 rounded-2xl bg-[#141720]/85 border border-white/15 p-4 backdrop-blur-xl shadow-2xl text-left hidden sm:block hover:border-orange-500/40 transition-colors"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-bold text-white">AI Summary</span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300 mb-3">
              {[
                'Quarterly report overview',
                'Key insights discussed',
                'Market opportunities',
                'Growth strategies',
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <button className="w-full py-1.5 rounded-lg bg-orange-500/20 border border-orange-500/40 text-orange-300 font-semibold text-xs hover:bg-orange-500 hover:text-white transition-all shadow-md">
              Generate Notes
            </button>
          </motion.div>

          {/* FLOATING WIDGET 5: Bottom-Right "Translation" */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: [0, -8, 0] }}
            transition={{ opacity: { duration: 0.8, delay: 1 }, y: { duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 } }}
            className="absolute bottom-4 right-0 md:right-6 z-20 w-72 rounded-2xl bg-[#141720]/85 border border-white/15 p-4 backdrop-blur-xl shadow-2xl text-left hidden sm:block hover:border-orange-500/40 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-bold text-white">Translation</span>
              </div>
              <div className="text-[11px] text-slate-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                <span>{selectedTransLang}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
            </div>

            <p className="text-xs text-orange-200/90 leading-relaxed font-sans bg-black/40 p-2.5 rounded-xl border border-orange-500/20 min-h-[54px]">
              "{typedTranslation}"
            </p>
          </motion.div>

          {/* CENTER INTERACTIVE DASHBOARD CARD (Replicating exact white card in image) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mx-auto pt-16 max-w-2xl"
          >
            <div className="rounded-3xl bg-white/95 text-slate-900 p-6 shadow-2xl border border-white/40 backdrop-blur-2xl transition-all hover:shadow-orange-500/10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                
                {/* Metric 1: Clicks / Sessions */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between hover:bg-slate-100/80 transition-colors">
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span>Clicks</span>
                      <span>This Month</span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-2xl font-black text-slate-900">6,896</span>
                      <span className="text-[11px] font-bold text-red-500">↓ -3.35%</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Compared to yesterday</p>
                  </div>

                  {/* Circular Arc Gauge Meter */}
                  <div className="mt-4 pt-3 border-t border-slate-200 text-center">
                    <span className="text-[10px] font-semibold text-slate-500">Month Target achieved</span>
                    <div className="relative w-24 h-12 mx-auto mt-2 overflow-hidden">
                      <div
                        className="w-24 h-24 rounded-full border-8 border-orange-500 border-b-transparent border-l-transparent transition-transform duration-1000"
                        style={{ transform: `rotate(${45 + (gaugeProgress / 100) * 180}deg)` }}
                      />
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-sm font-extrabold text-slate-900">
                        {gaugeProgress}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Metric 2: Figures & Period Selectors */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between text-xs hover:bg-slate-100/80 transition-colors">
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Show figures for</label>
                      <div className="mt-1 px-3 py-1.5 rounded-lg bg-white border border-slate-300 font-semibold text-slate-800 flex justify-between items-center cursor-pointer hover:border-orange-400 transition-colors">
                        <span>This month</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Compare period by</label>
                      <div className="mt-1 px-3 py-1.5 rounded-lg bg-white border border-slate-300 font-semibold text-slate-800 flex justify-between items-center cursor-pointer hover:border-orange-400 transition-colors">
                        <span>Month-to-date (MTD)</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <button className="flex-1 py-1.5 rounded-lg bg-orange-500 text-white font-bold text-xs hover:bg-orange-600 active:scale-95 transition-all shadow-md">
                      Save
                    </button>
                    <button className="flex-1 py-1.5 rounded-lg bg-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-300 active:scale-95 transition-all">
                      Cancel
                    </button>
                  </div>
                </div>

                {/* Metric 3: Video Starts & Gauge Meter */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between hover:bg-slate-100/80 transition-colors">
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span>Video Starts</span>
                      <span>Today</span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-2xl font-black text-slate-900">0</span>
                      <span className="text-[11px] font-bold text-emerald-500">↑ 0</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 text-center">
                    <div className="relative w-24 h-12 mx-auto overflow-hidden">
                      <div className="w-24 h-24 rounded-full border-8 border-slate-700 border-b-transparent border-l-transparent rotate-45" />
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-sm font-extrabold text-slate-900">68%</span>
                    </div>

                    <div className="flex items-center gap-2 mt-4 text-[10px]">
                      <button className="flex-1 py-1 rounded-md bg-white border border-slate-300 font-semibold text-slate-700 hover:border-orange-400 transition-colors">
                        Video Clicks
                      </button>
                      <button className="flex-1 py-1 rounded-md bg-white border border-slate-300 font-semibold text-slate-700 hover:border-orange-400 transition-colors">
                        Video Starts
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </div>

        {/* STATS & TRUST BAR */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-12 pt-8 border-t border-white/10"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white mb-8">
            <div className="hover:scale-105 transition-transform">
              <div className="text-2xl sm:text-3xl font-black text-white">500K+</div>
              <div className="text-xs text-slate-400 mt-1">Sessions Recorded</div>
            </div>
            <div className="hover:scale-105 transition-transform">
              <div className="text-2xl sm:text-3xl font-black text-white">120+</div>
              <div className="text-xs text-slate-400 mt-1">Countries Supported</div>
            </div>
            <div className="hover:scale-105 transition-transform">
              <div className="text-2xl sm:text-3xl font-black text-white">99.9%</div>
              <div className="text-xs text-slate-400 mt-1">Accuracy Rate</div>
            </div>
            <div className="hover:scale-105 transition-transform">
              <div className="text-2xl sm:text-3xl font-black text-white">40+</div>
              <div className="text-xs text-slate-400 mt-1">Languages</div>
            </div>
          </div>

          <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
            Trusted by leading teams
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-80 font-bold text-slate-300 text-sm sm:text-base">
            <span className="hover:text-orange-400 transition-colors">Google</span>
            <span className="hover:text-orange-400 transition-colors">Microsoft</span>
            <span className="hover:text-orange-400 transition-colors">Adobe</span>
            <span className="hover:text-orange-400 transition-colors">Zoom</span>
            <span className="hover:text-orange-400 transition-colors">Slack</span>
            <span className="hover:text-orange-400 transition-colors">OpenAI</span>
          </div>
        </motion.div>
      </div>

      {/* BOTTOM FEATURE PILL STRIP */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.0 }}
        className="mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
      >
        <div className="rounded-3xl bg-white/95 text-slate-900 p-4 sm:p-6 shadow-2xl backdrop-blur-2xl grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-left border border-white/50">
          
          <div className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-100/80 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 shadow-sm">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900">AI Recording</h4>
              <p className="text-[10px] text-slate-500 leading-tight mt-0.5">High quality audio recording in real-time.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-100/80 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900">Transcription</h4>
              <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Accurate transcription with speaker detection.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-100/80 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-sm">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900">Translation</h4>
              <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Translate into 40+ languages instantly.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-100/80 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 shadow-sm">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900">AI Summaries</h4>
              <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Smart notes and summaries with AI.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-100/80 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 shadow-sm">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900">Live Captions</h4>
              <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Real-time captions for everyone.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-100/80 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center shrink-0 shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900">Export Anywhere</h4>
              <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Export to PDF, DOCX, TXT and more.</p>
            </div>
          </div>

        </div>
      </motion.div>
    </section>
  );
};
