import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Globe,
  Sparkles,
  Shield,
  FileCheck,
  Headphones,
  Zap,
  ArrowRight,
  Check,
  Lock,
  Download,
  RotateCcw,
  Volume2,
  Sliders,
  Sparkle,
} from 'lucide-react';

export const Features: React.FC = () => {
  // Toast Alert Notification State
  const [featureToast, setFeatureToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeatureToast(msg);
    setTimeout(() => setFeatureToast(null), 3200);
  };

  // Card 1: Latency Benchmark toggle
  const [latencyVal, setLatencyVal] = useState(38);
  const toggleLatency = () => {
    const newVal = latencyVal === 38 ? 24 : 38;
    setLatencyVal(newVal);
    showToast(`⚡ Stream Engine: Optimized latency to ${newVal}ms per frame!`);
  };

  // Card 2: Language Rotation & Selection
  const [langIdx, setLangIdx] = useState(0);
  const languages = [
    { name: 'Spanish', flag: '🇪🇸', text: 'Subtítulos en tiempo real en español' },
    { name: 'French', flag: '🇫🇷', text: 'Sous-titres en temps réel en français' },
    { name: 'Hindi', flag: '🇮🇳', text: 'हिंदी में लाइव ट्रांसक्रिप्शन और अनुवाद' },
    { name: 'Japanese', flag: '🇯🇵', text: '日本語でのリアルタイムAI字幕' },
    { name: 'English', flag: '🇺🇸', text: 'Real-time AI captions in English' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setLangIdx((prev) => (prev + 1) % languages.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  // Card 3: AI Summary Generator Simulation
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [summaryPoints, setSummaryPoints] = useState([
    'Key decisions & action points extracted',
    'Automated meeting minutes generated',
  ]);

  const generateNewNotes = () => {
    setIsGeneratingNotes(true);
    setTimeout(() => {
      setIsGeneratingNotes(false);
      setSummaryPoints([
        'Key decisions & action points extracted',
        'Automated meeting minutes generated',
        'Speaker sentiment & timelines cataloged',
      ]);
      showToast('🧠 GPT-4o Engine: Structured meeting minutes & action items generated!');
    }, 1000);
  };

  // Card 4: Accessibility Font Size State
  const [captionFontSize, setCaptionFontSize] = useState(12); // px
  const toggleFontSize = () => {
    const newSize = captionFontSize === 12 ? 15 : 12;
    setCaptionFontSize(newSize);
    showToast(`♿ Accessibility Mode: Font size adjusted to ${newSize}px for optimal clarity!`);
  };

  // Card 5: Security Lock Mode State
  const [isLocalVault, setIsLocalVault] = useState(true);
  const toggleSecurityMode = () => {
    setIsLocalVault(!isLocalVault);
    showToast(!isLocalVault ? '🔒 Security Mode: Zero-retention Local On-Device ONNX Active' : '🛡️ Security Mode: TLS 1.3 Cloud Vault Encrypted');
  };

  // Card 6: Multi Export Simulation State
  const [activeExportFormat, setActiveExportFormat] = useState<string | null>(null);
  const [exportProgress, setExportProgress] = useState(0);

  const runExportSim = (format: string) => {
    setActiveExportFormat(format);
    setExportProgress(0);
    let p = 0;
    const interval = setInterval(() => {
      p += 25;
      setExportProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        showToast(`📥 Export Complete: Downloaded session notes in ${format} format!`);
        setTimeout(() => setActiveExportFormat(null), 2500);
      }
    }, 180);
  };

  return (
    <section id="features" className="py-24 relative overflow-hidden bg-[#080a0e]">
      {/* Toast Alert for Feature Card Micro-Interactions */}
      <AnimatePresence>
        {featureToast && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white text-xs font-bold shadow-2xl border border-white/30 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-white animate-spin" style={{ animationDuration: '4s' }} />
            <span>{featureToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background radial glows */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-left">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider mb-4 shadow-lg shadow-orange-950/40"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Interactive AI Feature Demos</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight"
          >
            Supercharge Accessibility with <span className="text-orange-500">Next-Gen Audio AI</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-slate-400 text-base sm:text-lg"
          >
            Everything you need to turn live spoken words into structured knowledge, accessible captions, and instant notes.
          </motion.p>
        </div>

        {/* 6 INTERACTIVE FEATURE CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* CARD 1: ULTRA-LOW LATENCY STREAMING */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -6 }}
            className="rounded-3xl bg-[#0e111a] border border-white/10 p-8 hover:border-orange-500/50 transition-all shadow-2xl flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-md">
                  <Mic className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  99.4% Precision
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                Ultra-Low Latency Streaming
              </h3>

              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Streams transcripts line-by-line in real time with under 50ms latency. Perfect for fast-paced lectures and live Q&A sessions.
              </p>

              {/* Live Interactive Preview Box */}
              <div
                onClick={toggleLatency}
                className="p-4 rounded-2xl bg-black/60 border border-orange-500/30 text-xs font-mono space-y-2 cursor-pointer hover:border-orange-500 transition-all shadow-inner"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-white/10 pb-2">
                  <span className="text-orange-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                    Live Feed Stream
                  </span>
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    ⚡ {latencyVal}ms Latency
                  </span>
                </div>
                <p className="text-slate-200 leading-relaxed">
                  &gt; Transcribing live speech stream in real time...
                </p>
                <span className="text-[10px] text-slate-500 italic block pt-1">
                  (Click box to benchmark stream speed)
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-orange-400 group-hover:translate-x-1 transition-transform">
              <span>Learn more about Ultra-Low</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </motion.div>

          {/* CARD 2: LIVE MULTILINGUAL TRANSLATION */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -6 }}
            className="rounded-3xl bg-[#0e111a] border border-white/10 p-8 hover:border-orange-500/50 transition-all shadow-2xl flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-md">
                  <Globe className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  50+ Languages
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                Live Multilingual Translation
              </h3>

              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Instantly translate live spoken audio into 50+ target languages with custom domain terminology and speaker accents.
              </p>

              {/* Live Rotating Language Translation Box */}
              <div className="p-4 rounded-2xl bg-black/60 border border-blue-500/30 text-xs shadow-inner">
                <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                  <span className="text-blue-400 font-bold flex items-center gap-1.5">
                    <span>{languages[langIdx].flag}</span>
                    <span>{languages[langIdx].name}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                    Auto-Detect Speech
                  </span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={langIdx}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-orange-200 font-medium leading-relaxed italic"
                  >
                    "{languages[langIdx].text}"
                  </motion.p>
                </AnimatePresence>
                <span className="text-[10px] text-slate-500 italic block pt-2">
                  (Auto-switching language stream every 2.8s)
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-orange-400 group-hover:translate-x-1 transition-transform">
              <span>Learn more about Live</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </motion.div>

          {/* CARD 3: AUTOMATED AI SUMMARIES */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -6 }}
            className="rounded-3xl bg-[#0e111a] border border-white/10 p-8 hover:border-orange-500/50 transition-all shadow-2xl flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all shadow-md">
                  <Sparkles className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  GPT-4o Powered
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                Automated AI Summaries
              </h3>

              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Extract key takeaways, highlight action items, and generate structured meeting minutes automatically as soon as the session ends.
              </p>

              {/* Interactive AI Summary Box */}
              <div className="p-4 rounded-2xl bg-black/60 border border-purple-500/30 text-xs space-y-2 shadow-inner">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-purple-400 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" style={{ animationDuration: '6s' }} />
                    AI Key Takeaways
                  </span>
                  <button
                    onClick={generateNewNotes}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 hover:bg-purple-500 hover:text-white font-bold transition-all"
                  >
                    {isGeneratingNotes ? 'Generating...' : '+ Re-Generate'}
                  </button>
                </div>

                <div className="space-y-1.5 text-slate-200">
                  {summaryPoints.map((pt, pIdx) => (
                    <motion.div
                      key={pIdx}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Check className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      <span className="text-[11px]">{pt}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-orange-400 group-hover:translate-x-1 transition-transform">
              <span>Learn more about Automated</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </motion.div>

          {/* CARD 4: UNIVERSAL ACCESSIBILITY */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -6 }}
            className="rounded-3xl bg-[#0e111a] border border-white/10 p-8 hover:border-orange-500/50 transition-all shadow-2xl flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-md">
                  <Headphones className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  ADA Compliant
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                Universal Accessibility
              </h3>

              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Designed specifically for deaf and hard-of-hearing individuals, ESL students, and neurodivergent learners.
              </p>

              {/* Caption Font Size Switcher Box */}
              <div className="p-4 rounded-2xl bg-black/60 border border-amber-500/30 text-xs shadow-inner space-y-2">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-amber-400 font-bold">High-Contrast Captions</span>
                  <button
                    onClick={toggleFontSize}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold hover:bg-amber-500 hover:text-white transition-all"
                  >
                    Size: {captionFontSize}px (Click to Toggle)
                  </button>
                </div>
                <p
                  className="text-slate-100 font-semibold leading-relaxed transition-all"
                  style={{ fontSize: `${captionFontSize}px` }}
                >
                  "Deaf & Hard-of-Hearing Optimized Caption Stream"
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-orange-400 group-hover:translate-x-1 transition-transform">
              <span>Learn more about Universal</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </motion.div>

          {/* CARD 5: ZERO DATA RETENTION OPTION */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            whileHover={{ y: -6 }}
            className="rounded-3xl bg-[#0e111a] border border-white/10 p-8 hover:border-orange-500/50 transition-all shadow-2xl flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-md">
                  <Shield className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  SOC2 & HIPAA
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                Zero Data Retention Option
              </h3>

              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Your sensitive voice recordings are encrypted with military-grade TLS 1.3. We offer on-device local transcription modes.
              </p>

              {/* Security Vault Toggle Box */}
              <div
                onClick={toggleSecurityMode}
                className="p-4 rounded-2xl bg-black/60 border border-emerald-500/30 text-xs shadow-inner cursor-pointer hover:border-emerald-500 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Lock className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-emerald-400 font-bold block">
                      {isLocalVault ? 'TLS 1.3 Vault Encrypted' : 'Zero-Retention On-Device ONNX'}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      (Click to toggle encryption mode)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-orange-400 group-hover:translate-x-1 transition-transform">
              <span>Learn more about Zero</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </motion.div>

          {/* CARD 6: MULTI-FORMAT INSTANT EXPORTS */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            whileHover={{ y: -6 }}
            className="rounded-3xl bg-[#0e111a] border border-white/10 p-8 hover:border-orange-500/50 transition-all shadow-2xl flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-110 group-hover:bg-teal-500 group-hover:text-white transition-all shadow-md">
                  <FileCheck className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30">
                  One-Click Sync
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                Multi-Format Instant Exports
              </h3>

              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Export audio notes, transcripts, and speaker timelines directly into Notion, Google Docs, PDF, and SRT subtitles.
              </p>

              {/* Multi Export Interactive Buttons Box */}
              <div className="p-4 rounded-2xl bg-black/60 border border-teal-500/30 text-xs shadow-inner space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-teal-400 font-bold">One-Click Multi Export</span>
                  {activeExportFormat && <span className="text-teal-300 font-mono text-[10px]">{exportProgress}%</span>}
                </div>

                {activeExportFormat ? (
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden my-2 border border-white/10">
                    <div className="bg-teal-400 h-full transition-all duration-200" style={{ width: `${exportProgress}%` }} />
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    {['PDF', 'Notion', 'SRT', 'DOCX'].map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => runExportSim(fmt)}
                        className="py-1.5 rounded-lg bg-white/5 border border-white/10 text-orange-300 hover:bg-orange-500 hover:text-white font-bold text-[10px] transition-all flex items-center justify-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>{fmt}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-orange-400 group-hover:translate-x-1 transition-transform">
              <span>Learn more about Multi-Format</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
