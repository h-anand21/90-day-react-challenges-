import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
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
  Sliders,
  ShieldCheck,
  RotateCcw,
  CheckCircle,
} from 'lucide-react';

export const LexoraHero: React.FC = () => {
  const [isRecording, setIsRecording] = useState(true);
  const [timerCount, setTimerCount] = useState(165); // 02:45
  
  // Interactive Language Selector State
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [selectedLangObj, setSelectedLangObj] = useState({
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
    caption: 'Good morning everyone, today we will discuss the Q3 performance metrics and key accessibility goals...',
    transName: 'Spanish',
    translation: 'Buenos días a todos, hoy discutiremos el informe trimestral y las métricas clave de este período.',
  });

  const languageOptions = [
    {
      code: 'en',
      name: 'English',
      flag: '🇺🇸',
      caption: 'Good morning everyone, today we will discuss the Q3 performance metrics and key accessibility goals...',
      transName: 'Spanish',
      translation: 'Buenos días a todos, hoy discutiremos el informe trimestral y las métricas clave de este período.',
    },
    {
      code: 'es',
      name: 'Spanish',
      flag: '🇪🇸',
      caption: 'Buenos días a todos, hoy discutiremos las métricas de rendimiento del tercer trimestre...',
      transName: 'English',
      translation: 'Good morning everyone, today we will discuss the Q3 performance metrics...',
    },
    {
      code: 'fr',
      name: 'French',
      flag: '🇫🇷',
      caption: "Bonjour à tous, aujourd'hui nous allons discuter des métriques de performance du troisième trimestre...",
      transName: 'English',
      translation: 'Good morning everyone, today we will discuss Q3 metrics...',
    },
    {
      code: 'hi',
      name: 'Hindi',
      flag: '🇮🇳',
      caption: 'नमस्कार आप सभी का स्वागत है, आज हम तीसरी तिमाही के प्रदर्शन मीट्रिक पर चर्चा करेंगे...',
      transName: 'English',
      translation: 'Welcome everyone, today we will discuss Q3 metrics...',
    },
    {
      code: 'de',
      name: 'German',
      flag: '🇩🇪',
      caption: 'Guten Morgen zusammen, heute werden wir die Leistungsmetriken für das dritte Quartal besprechen...',
      transName: 'Spanish',
      translation: 'Buenos días a todos, hoy discutiremos las métricas del tercer trimestre...',
    },
    {
      code: 'ja',
      name: 'Japanese',
      flag: '🇯🇵',
      caption: '皆さんおはようございます、本日は第3四半期の業績指標とアクセシビリティについて議論します...',
      transName: 'English',
      translation: 'Good morning everyone, today we will discuss Q3 metrics...',
    },
  ];

  // Dynamic Headline Rotating Text Words
  const [rotatingWordIdx, setRotatingWordIdx] = useState(0);
  const rotatingWords = [
    'made intelligent.',
    'made accessible.',
    'made instantaneous.',
    'made universal.',
  ];

  useEffect(() => {
    const wordInterval = setInterval(() => {
      setRotatingWordIdx((prev) => (prev + 1) % rotatingWords.length);
    }, 2500);
    return () => clearInterval(wordInterval);
  }, []);

  // Character typing simulation for widgets
  const [typedCaption, setTypedCaption] = useState('');
  const [typedTranslation, setTypedTranslation] = useState('');
  const [gaugeProgress, setGaugeProgress] = useState(0);

  // INTERACTIVE CENTER CARD BACKEND METRIC STATES
  const [selectedAiModel, setSelectedAiModel] = useState('Whisper v3 Neural');
  const [selectedAccessMode, setSelectedAccessMode] = useState('Deaf & Hard-of-Hearing (SDH)');
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [accessDropdownOpen, setAccessDropdownOpen] = useState(false);
  const [transcribedMinutes, setTranscribedMinutes] = useState(6896);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const aiModels = ['Whisper v3 Neural', 'Deepgram Nova-2', 'On-Device Local ONNX'];
  const accessModes = ['Deaf & Hard-of-Hearing (SDH)', 'Lecture Live Captions', 'Meeting Summarizer'];

  const triggerSaveNotification = () => {
    setGaugeProgress(99);
    setTranscribedMinutes((prev) => prev + 12);
    setToastMessage(`✨ Settings Saved: Applied ${selectedAiModel} with ${selectedAccessMode}`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 3D Parallax Mouse Motion Values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-400, 400], [8, -8]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-600, 600], [-10, 10]), { stiffness: 150, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setGaugeProgress(94);
    }, 400);
    return () => clearTimeout(timeout);
  }, []);

  // Character typing effect based on active selected language
  useEffect(() => {
    if (!isRecording) return;
    let charIdx = 0;
    const fullCap = selectedLangObj.caption;
    const fullTrans = selectedLangObj.translation;

    setTypedCaption('');
    setTypedTranslation('');

    const interval = setInterval(() => {
      charIdx = (charIdx + 1) % (fullCap.length + 1);
      const transIdx = Math.floor((charIdx / fullCap.length) * fullTrans.length);
      setTypedCaption(fullCap.slice(0, Math.max(8, charIdx)));
      setTypedTranslation(fullTrans.slice(0, Math.max(10, transIdx)));
    }, 70);

    return () => clearInterval(interval);
  }, [isRecording, selectedLangObj]);

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

  // Staggered text variants
  const sentenceVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 25, filter: 'blur(8px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.6, ease: 'easeOut' as const },
    },
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative pt-32 pb-20 md:pt-40 md:pb-28 min-h-screen flex flex-col justify-between overflow-hidden perspective-1000"
    >
      {/* Toast Notification for User Click Actions */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold shadow-2xl border border-white/30 flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4 text-white animate-bounce" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated Cinematic Sunset Mountain Background Asset */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-20 scale-105 transition-transform duration-1000"
        style={{
          backgroundImage: `url('/mountain_sunset_bg.png')`,
        }}
      />

      {/* FLOATING AMBIENT LIGHT DUST PARTICLES */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        {Array.from({ length: 25 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * 1200 - 600,
              y: Math.random() * 800,
              opacity: Math.random() * 0.5 + 0.2,
              scale: Math.random() * 0.8 + 0.4,
            }}
            animate={{
              y: [Math.random() * 800, Math.random() * 800 - 300],
              x: `+=${Math.sin(i) * 40}`,
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: Math.random() * 8 + 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute rounded-full bg-gradient-to-t from-orange-400 to-amber-300 blur-[1px]"
            style={{
              width: `${Math.random() * 6 + 3}px`,
              height: `${Math.random() * 6 + 3}px`,
              left: `${(i * 4) % 100}%`,
              top: `${(i * 7) % 100}%`,
            }}
          />
        ))}
      </div>

      {/* Atmospheric Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0c10]/75 via-[#0c0e16]/60 to-[#080a0e] -z-10" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-orange-500/25 rounded-full blur-[180px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '6s' }} />

      {/* Main Interactive 3D Parallax Container */}
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 w-full"
      >
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold backdrop-blur-md shadow-2xl mb-6 hover:bg-white/15 transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-orange-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>AI-Powered Accessibility Assistant</span>
        </motion.div>

        {/* HIGH-END STAGGERED & ROTATING TEXT ANIMATION HEADLINE */}
        <motion.div
          variants={sentenceVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
            <motion.span variants={wordVariants} className="inline-block">
              Accessibility
            </motion.span>{' '}
            <br />
            
            {/* ROTATING 3D FLIP TEXT ANIMATION */}
            <div className="inline-block relative h-[1.1em] overflow-hidden align-top min-w-[320px] sm:min-w-[460px]">
              <AnimatePresence mode="wait">
                <motion.span
                  key={rotatingWordIdx}
                  initial={{ opacity: 0, y: 40, rotateX: -90, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -40, rotateX: 90, filter: 'blur(10px)' }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                  className="font-serif-italic bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent font-normal tracking-normal drop-shadow-md block"
                >
                  {rotatingWords[rotatingWordIdx]}
                </motion.span>
              </AnimatePresence>
            </div>
            
            <br />
            <motion.span variants={wordVariants} className="inline-block">
              with AI.
            </motion.span>
          </h1>
        </motion.div>

        {/* Animated Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-6 text-sm sm:text-base md:text-lg text-slate-200 max-w-2xl mx-auto font-normal leading-relaxed"
        >
          Lexora is an all-in-one AI assistant that records, transcribes, translates and summarizes in real-time for everyone, everywhere.
        </motion.p>

        {/* Animated Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-8 flex items-center justify-center gap-4"
        >
          <motion.a
            href="#demo"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleRecording}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold text-white glow-orange-button transition-all shadow-2xl shadow-orange-500/50"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4" />
          </motion.a>

          <motion.a
            href="#demo"
            whileHover={{ scale: 1.08 }}
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
            animate={{ opacity: 1, x: 0, y: [0, -12, 0] }}
            transition={{ opacity: { duration: 0.8, delay: 0.7 }, y: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }}
            whileHover={{ scale: 1.05, rotate: -1 }}
            className="absolute top-0 left-0 md:left-4 z-20 w-64 rounded-2xl bg-[#141720]/85 border border-white/20 p-4 backdrop-blur-xl shadow-2xl text-left hidden sm:block hover:border-orange-500/50 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs font-bold text-white">Live Recording</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-semibold animate-pulse">
                ● Live
              </span>
            </div>

            <div className="flex items-end gap-1 h-10 my-3 px-2 py-1 bg-black/50 rounded-xl border border-white/5">
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
              <span className="text-orange-400 font-mono font-bold">{formatTimer(timerCount)}</span>
              <span className="text-[10px] text-slate-400 font-sans">44.1 kHz • HD</span>
            </div>
          </motion.div>

          {/* FLOATING WIDGET 2: Top-Right "Live Caption" WITH FULLY INTERACTIVE LANGUAGE DROPDOWN */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0, y: [0, -14, 0] }}
            transition={{ opacity: { duration: 0.8, delay: 0.8 }, y: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 } }}
            whileHover={{ scale: 1.02 }}
            className="absolute top-4 right-0 md:right-4 z-40 w-72 rounded-2xl bg-[#141720]/90 border border-white/20 p-4 backdrop-blur-xl shadow-2xl text-left hidden sm:block hover:border-orange-500/50 transition-all"
          >
            <div className="flex items-center justify-between mb-2 relative">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-white">Live Caption</span>
              </div>

              <div className="relative">
                <button
                  onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-slate-200 bg-white/10 hover:bg-orange-500/20 hover:text-orange-300 border border-white/15 hover:border-orange-500/40 px-2.5 py-1 rounded-lg transition-all"
                >
                  <span>{selectedLangObj.flag}</span>
                  <span>{selectedLangObj.name}</span>
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isLangDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    className="absolute right-0 mt-1.5 w-40 rounded-xl bg-[#181c28] border border-orange-500/40 p-1.5 shadow-2xl z-50 space-y-1"
                  >
                    <div className="text-[10px] uppercase font-bold text-orange-400 px-2 py-1 border-b border-white/10">
                      Select Speech Language:
                    </div>
                    {languageOptions.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setSelectedLangObj(lang);
                          setIsLangDropdownOpen(false);
                          setToastMessage(`🌐 Speech Language Switched: ${lang.name} ${lang.flag}`);
                          setTimeout(() => setToastMessage(null), 3000);
                        }}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          selectedLangObj.code === lang.code
                            ? 'bg-orange-500 text-white font-bold'
                            : 'text-slate-200 hover:bg-white/10 hover:text-orange-300'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </span>
                        {selectedLangObj.code === lang.code && <Check className="w-3 h-3 text-white" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>

            <div className="text-xs text-slate-200 leading-relaxed font-sans mt-2 italic bg-black/50 p-2.5 rounded-xl border border-white/10 min-h-[54px]">
              "{typedCaption}"<span className="inline-block w-1.5 h-3.5 bg-orange-500 ml-0.5 animate-pulse" />
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
              <div className={`absolute -inset-5 rounded-full bg-orange-500/30 ${isRecording ? 'animate-mic-pulse' : ''}`} />
              <div className="absolute -inset-10 rounded-full bg-orange-500/15 animate-ping" style={{ animationDuration: '3.5s' }} />
              
              <button className="relative w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 flex items-center justify-center text-white shadow-2xl shadow-orange-500/70 group-hover:scale-115 active:scale-95 transition-all">
                <Mic className="w-7 h-7 text-white group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          </motion.div>

          {/* FLOATING WIDGET 4: Bottom-Left "AI Summary" */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: [0, -10, 0] }}
            transition={{ opacity: { duration: 0.8, delay: 0.9 }, y: { duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 } }}
            whileHover={{ scale: 1.05 }}
            className="absolute bottom-4 left-0 md:left-6 z-20 w-64 rounded-2xl bg-[#141720]/85 border border-white/20 p-4 backdrop-blur-xl shadow-2xl text-left hidden sm:block hover:border-orange-500/50 transition-all cursor-pointer"
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
                <div key={idx} className="flex items-center gap-2 hover:text-white transition-colors">
                  <Check className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setToastMessage('📝 AI Notes & Action Items Generated!');
                setTimeout(() => setToastMessage(null), 3000);
              }}
              className="w-full py-1.5 rounded-lg bg-orange-500/20 border border-orange-500/40 text-orange-300 font-semibold text-xs hover:bg-orange-500 hover:text-white active:scale-95 transition-all shadow-md"
            >
              Generate Notes
            </button>
          </motion.div>

          {/* FLOATING WIDGET 5: Bottom-Right "Translation" */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: [0, -12, 0] }}
            transition={{ opacity: { duration: 0.8, delay: 1 }, y: { duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 } }}
            whileHover={{ scale: 1.05 }}
            className="absolute bottom-4 right-0 md:right-6 z-20 w-72 rounded-2xl bg-[#141720]/85 border border-white/20 p-4 backdrop-blur-xl shadow-2xl text-left hidden sm:block hover:border-orange-500/50 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-bold text-white">Translation</span>
              </div>
              <div className="text-[11px] text-slate-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                <span>{selectedLangObj.transName}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
            </div>

            <p className="text-xs text-orange-200/90 leading-relaxed font-sans bg-black/50 p-2.5 rounded-xl border border-orange-500/20 min-h-[54px]">
              "{typedTranslation}"
            </p>
          </motion.div>

          {/* ---------------------------------------------------- */}
          {/* CENTER INTERACTIVE BACKEND-RELATABLE DASHBOARD CARD */}
          {/* ---------------------------------------------------- */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mx-auto pt-16 max-w-2xl"
          >
            <div className="rounded-3xl bg-white/95 text-slate-900 p-6 shadow-2xl border border-white/50 backdrop-blur-2xl transition-all hover:shadow-orange-500/20 hover:border-white">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                
                {/* Metric 1: Transcribed Minutes & Accuracy Target */}
                <motion.div
                  whileHover={{ y: -3 }}
                  onClick={() => {
                    setTranscribedMinutes((prev) => prev + 15);
                    setToastMessage('⚡ Live Audio Stream Session Updated: +15 Mins Transcribed');
                    setTimeout(() => setToastMessage(null), 3000);
                  }}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between hover:bg-white hover:shadow-md transition-all cursor-pointer group"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span className="font-bold text-slate-800">Transcribed Mins</span>
                      <span className="text-[10px] text-orange-600 font-bold">This Month</span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-2xl font-black text-slate-900 group-hover:text-orange-600 transition-colors">
                        {transcribedMinutes.toLocaleString()}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-600">↑ +14.2%</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Live Audio Captions Logged</p>
                  </div>

                  {/* Circular Arc Gauge Meter for Accuracy */}
                  <div className="mt-4 pt-3 border-t border-slate-200 text-center">
                    <span className="text-[10px] font-semibold text-slate-500">Speech Precision Target</span>
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
                </motion.div>

                {/* Metric 2: AI Neural Model & Mode Selectors */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between text-xs hover:bg-white hover:shadow-md transition-all">
                  <div className="space-y-3 relative">
                    {/* Dropdown 1: Select AI Model */}
                    <div className="relative">
                      <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between">
                        <span>Select AI Speech Model</span>
                        <Zap className="w-3 h-3 text-orange-500" />
                      </label>
                      <div
                        onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                        className="mt-1 px-3 py-1.5 rounded-lg bg-white border border-slate-300 font-semibold text-slate-800 flex justify-between items-center cursor-pointer hover:border-orange-500 transition-colors shadow-sm"
                      >
                        <span className="truncate">{selectedAiModel}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      </div>

                      {modelDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 p-1 space-y-1">
                          {aiModels.map((m) => (
                            <button
                              key={m}
                              onClick={() => {
                                setSelectedAiModel(m);
                                setModelDropdownOpen(false);
                                setToastMessage(`🧠 AI Model Switched to: ${m}`);
                                setTimeout(() => setToastMessage(null), 3000);
                              }}
                              className="w-full text-left px-2.5 py-1 rounded text-[11px] font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors flex items-center justify-between"
                            >
                              <span>{m}</span>
                              {selectedAiModel === m && <Check className="w-3 h-3 text-orange-600" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Dropdown 2: Select Accessibility Mode */}
                    <div className="relative">
                      <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between">
                        <span>Accessibility Mode</span>
                        <Volume2 className="w-3 h-3 text-orange-500" />
                      </label>
                      <div
                        onClick={() => setAccessDropdownOpen(!accessDropdownOpen)}
                        className="mt-1 px-3 py-1.5 rounded-lg bg-white border border-slate-300 font-semibold text-slate-800 flex justify-between items-center cursor-pointer hover:border-orange-500 transition-colors shadow-sm"
                      >
                        <span className="truncate text-[11px]">{selectedAccessMode}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      </div>

                      {accessDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 p-1 space-y-1">
                          {accessModes.map((mode) => (
                            <button
                              key={mode}
                              onClick={() => {
                                setSelectedAccessMode(mode);
                                setAccessDropdownOpen(false);
                                setToastMessage(`♿ Accessibility Mode Set: ${mode}`);
                                setTimeout(() => setToastMessage(null), 3000);
                              }}
                              className="w-full text-left px-2.5 py-1 rounded text-[11px] font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors flex items-center justify-between"
                            >
                              <span>{mode}</span>
                              {selectedAccessMode === mode && <Check className="w-3 h-3 text-orange-600" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Save & Reset Action Buttons */}
                  <div className="flex items-center gap-2 mt-4">
                    <button
                      onClick={triggerSaveNotification}
                      className="flex-1 py-1.5 rounded-lg bg-orange-500 text-white font-bold text-xs hover:bg-orange-600 active:scale-95 transition-all shadow-md shadow-orange-500/30 flex items-center justify-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Config</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAiModel('Whisper v3 Neural');
                        setSelectedAccessMode('Deaf & Hard-of-Hearing (SDH)');
                        setToastMessage('🔄 Settings Reset to Default AI Pipeline');
                        setTimeout(() => setToastMessage(null), 3000);
                      }}
                      className="py-1.5 px-2 rounded-lg bg-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-300 active:scale-95 transition-all flex items-center justify-center"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Metric 3: AI Notes & Low Latency Score */}
                <motion.div
                  whileHover={{ y: -3 }}
                  onClick={() => {
                    setToastMessage('🚀 Audio Streaming Latency Optimized: < 45ms');
                    setTimeout(() => setToastMessage(null), 3000);
                  }}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between hover:bg-white hover:shadow-md transition-all cursor-pointer group"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span className="font-bold text-slate-800">AI Summaries</span>
                      <span className="text-[10px] text-emerald-600 font-bold">Today</span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-2xl font-black text-slate-900 group-hover:text-orange-600 transition-colors">148</span>
                      <span className="text-[11px] font-bold text-emerald-600">↑ +24 Notes</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Exported to Supabase Cloud</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 text-center">
                    <span className="text-[10px] font-semibold text-slate-500">&lt; 50ms Streaming Latency</span>
                    <div className="relative w-24 h-12 mx-auto mt-1 overflow-hidden">
                      <div className="w-24 h-24 rounded-full border-8 border-emerald-500 border-b-transparent border-l-transparent rotate-[135deg]" />
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs font-extrabold text-slate-900">
                        98.5%
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-4 text-[10px]">
                      <button className="flex-1 py-1 rounded-md bg-white border border-slate-300 font-semibold text-slate-700 hover:border-orange-400 hover:text-orange-600 transition-colors">
                        Speech Logs
                      </button>
                      <button className="flex-1 py-1 rounded-md bg-white border border-slate-300 font-semibold text-slate-700 hover:border-orange-400 hover:text-orange-600 transition-colors">
                        Subtitles
                      </button>
                    </div>
                  </div>
                </motion.div>

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
            <motion.div whileHover={{ scale: 1.08 }} className="cursor-pointer">
              <div className="text-2xl sm:text-3xl font-black text-white">500K+</div>
              <div className="text-xs text-slate-400 mt-1">Sessions Recorded</div>
            </motion.div>
            <motion.div whileHover={{ scale: 1.08 }} className="cursor-pointer">
              <div className="text-2xl sm:text-3xl font-black text-white">120+</div>
              <div className="text-xs text-slate-400 mt-1">Countries Supported</div>
            </motion.div>
            <motion.div whileHover={{ scale: 1.08 }} className="cursor-pointer">
              <div className="text-2xl sm:text-3xl font-black text-white">99.9%</div>
              <div className="text-xs text-slate-400 mt-1">Accuracy Rate</div>
            </motion.div>
            <motion.div whileHover={{ scale: 1.08 }} className="cursor-pointer">
              <div className="text-2xl sm:text-3xl font-black text-white">40+</div>
              <div className="text-xs text-slate-400 mt-1">Languages</div>
            </motion.div>
          </div>

          <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
            Trusted by leading teams
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-80 font-bold text-slate-300 text-sm sm:text-base">
            {['Google', 'Microsoft', 'Adobe', 'Zoom', 'Slack', 'OpenAI'].map((logo, lIdx) => (
              <motion.span
                key={lIdx}
                whileHover={{ scale: 1.15, color: '#f97316' }}
                className="cursor-pointer transition-colors"
              >
                {logo}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* BOTTOM FEATURE PILL STRIP */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.0 }}
        className="mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10"
      >
        <div className="rounded-3xl bg-white/95 text-slate-900 p-4 sm:p-6 shadow-2xl backdrop-blur-2xl grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-left border border-white/50">
          {[
            { title: 'AI Recording', desc: 'High quality audio recording in real-time.', icon: Mic, bg: 'bg-orange-100 text-orange-600' },
            { title: 'Transcription', desc: 'Accurate transcription with speaker detection.', icon: Sparkles, bg: 'bg-emerald-100 text-emerald-600' },
            { title: 'Translation', desc: 'Translate into 40+ languages instantly.', icon: Globe, bg: 'bg-blue-100 text-blue-600' },
            { title: 'AI Summaries', desc: 'Smart notes and summaries with AI.', icon: Zap, bg: 'bg-purple-100 text-purple-600' },
            { title: 'Live Captions', desc: 'Real-time captions for everyone.', icon: Volume2, bg: 'bg-amber-100 text-amber-600' },
            { title: 'Export Anywhere', desc: 'Export to PDF, DOCX, TXT and more.', icon: CheckCircle2, bg: 'bg-teal-100 text-teal-600' },
          ].map((item, idx) => {
            const IconComp = item.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05, y: -2 }}
                className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-100/90 transition-all cursor-pointer"
              >
                <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center shrink-0 shadow-sm`}>
                  <IconComp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">{item.title}</h4>
                  <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{item.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
};
