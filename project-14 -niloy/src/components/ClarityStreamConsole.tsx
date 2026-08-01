import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Sparkles,
  Globe,
  CheckCircle2,
  Download,
  Share2,
  FileText,
  Pause,
  Play,
  Volume2,
  Check,
  ChevronDown,
  Upload,
  Database,
  Cpu,
  RefreshCcw,
  Zap,
} from 'lucide-react';

export const ClarityStreamConsole: React.FC = () => {
  const [isRecording, setIsRecording] = useState(true);
  const [sessionTimer, setSessionTimer] = useState(165); // 02:45
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Active Language Pair State
  const [activeLangIdx, setActiveLangIdx] = useState(0);
  const languagePairs = [
    {
      srcLang: 'English 🇺🇸',
      tgtLang: 'Spanish 🇪🇸',
      speaker: 'Speaker 1 (Prof. Vance)',
      speech: 'Today we are testing ClarityStream AI live speech-to-text, neural translation, and automated AI summary generation...',
      translation: 'Hoy estamos probando la transcripción de voz en vivo de ClarityStream AI, traducción neural y resúmenes automáticos...',
    },
    {
      srcLang: 'Spanish 🇪🇸',
      tgtLang: 'English 🇺🇸',
      speaker: 'Speaker 2 (Elena Gomez)',
      speech: 'Buenos días a todos. La precisión del modelo de voz es superior al 99.4% en tiempo real...',
      translation: 'Good morning everyone. The voice model accuracy is over 99.4% in real-time...',
    },
    {
      srcLang: 'French 🇫🇷',
      tgtLang: 'English 🇺🇸',
      speaker: 'Speaker 1 (Jean Dupont)',
      speech: 'Bonjour. Nous utilisons le stockage cloud Supabase sécurisé et le chiffrement TLS 1.3...',
      translation: 'Hello. We are using secure Supabase cloud storage and TLS 1.3 encryption...',
    },
    {
      srcLang: 'Hindi 🇮🇳',
      tgtLang: 'English 🇺🇸',
      speaker: 'Speaker 3 (Rohan Sharma)',
      speech: 'नमस्कार आप सभी का स्वागत है। यह एआई सहायक स्वचालित नोट्स और एक्शन आइटम्स तैयार करता है...',
      translation: 'Welcome everyone. This AI assistant prepares automated notes and action items...',
    },
  ];

  const currentPair = languagePairs[activeLangIdx];

  // Character typing animation states
  const [typedSpeech, setTypedSpeech] = useState('');
  const [typedTranslation, setTypedTranslation] = useState('');

  // Audio Input & AI Model Selector States
  const [selectedAudioSource, setSelectedAudioSource] = useState('System Microphone');
  const [selectedModel, setSelectedModel] = useState('Whisper v3 Neural (99.4%)');
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [isInputMenuOpen, setIsInputMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  // Download simulation state
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);
  const [exportProgress, setExportProgress] = useState(0);

  // Live Timer
  useEffect(() => {
    if (!isRecording) return;
    const timer = setInterval(() => {
      setSessionTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isRecording]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Live character typing stream
  useEffect(() => {
    if (!isRecording) return;
    let charIdx = 0;
    const fullSpeech = currentPair.speech;
    const fullTrans = currentPair.translation;

    setTypedSpeech('');
    setTypedTranslation('');

    const interval = setInterval(() => {
      charIdx = (charIdx + 1) % (fullSpeech.length + 1);
      const transIdx = Math.floor((charIdx / fullSpeech.length) * fullTrans.length);
      setTypedSpeech(fullSpeech.slice(0, Math.max(8, charIdx)));
      setTypedTranslation(fullTrans.slice(0, Math.max(10, transIdx)));
    }, 65);

    return () => clearInterval(interval);
  }, [isRecording, activeLangIdx]);

  // Export simulation handler
  const handleExport = (format: string) => {
    setExportingFormat(format);
    setExportProgress(0);
    let p = 0;
    const interval = setInterval(() => {
      p += 25;
      setExportProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setToastMsg(`📥 Export Complete: Saved Session #CS-8924 as ${format}`);
        setTimeout(() => {
          setExportingFormat(null);
          setToastMsg(null);
        }, 3000);
      }
    }, 200);
  };

  const showNotification = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-8 relative z-20">
      {/* Toast Notification Alert */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white text-xs font-bold shadow-2xl border border-white/30 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-white animate-spin" style={{ animationDuration: '4s' }} />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Glassmorphic Studio Recording Console */}
      <div className="rounded-3xl bg-white/95 text-slate-900 p-6 sm:p-8 shadow-2xl border border-white/60 backdrop-blur-2xl transition-all hover:shadow-orange-500/25">
        
        {/* TOP STATUS BAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isRecording ? 'bg-red-500' : 'bg-slate-400'} opacity-75`} />
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isRecording ? 'bg-red-600' : 'bg-slate-500'}`} />
            </span>
            <span className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Session #CS-8924
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200 font-mono font-bold">
                {formatTimer(sessionTimer)}
              </span>
            </span>
          </div>

          {/* Cloud Sync & Latency Indicators */}
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
              <Database className="w-3.5 h-3.5 text-orange-600" />
              <span>Supabase Vault Synced</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span>&lt; 42ms Latency</span>
            </div>
          </div>
        </div>

        {/* 3-COLUMN STUDIO INTERACTIVE CONSOLE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-stretch">
          
          {/* COLUMN 1: AUDIO INPUT & SPECTRUM CONTROL (3 cols) */}
          <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-3">
                <span className="uppercase tracking-wider">Audio Capture & VAD</span>
                <span className="text-orange-600 font-mono">44.1 kHz HD</span>
              </div>

              {/* Pulsing Mic Orb Button */}
              <div className="relative my-4 flex justify-center">
                <div className={`absolute -inset-3 rounded-full bg-orange-500/20 ${isRecording ? 'animate-mic-pulse' : ''}`} />
                <button
                  onClick={() => {
                    setIsRecording(!isRecording);
                    showNotification(isRecording ? '⏸️ Recording Paused' : '🎙️ Recording Started');
                  }}
                  className={`relative w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-all group ${
                    isRecording
                      ? 'bg-gradient-to-br from-orange-500 to-amber-600 shadow-orange-500/40 scale-105'
                      : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                >
                  {isRecording ? <Mic className="w-9 h-9" /> : <MicOff className="w-9 h-9" />}
                </button>
              </div>

              {/* Animated Equalizer Waveform */}
              <div className="flex items-end justify-center gap-1 h-12 my-3 px-3 py-2 bg-slate-900 rounded-xl border border-slate-800">
                {Array.from({ length: 22 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full bg-gradient-to-t from-orange-600 to-amber-400 transition-all ${
                      isRecording ? `animate-wave-${(i % 5) + 1}` : 'h-1 bg-slate-700'
                    }`}
                    style={{ height: isRecording ? `${Math.sin(i * 0.6 + Date.now() * 0.003) * 14 + 20}px` : '4px' }}
                  />
                ))}
              </div>
            </div>

            {/* Input Selectors */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="relative">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                  Audio Input Source
                </label>
                <button
                  onClick={() => setIsInputMenuOpen(!isInputMenuOpen)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-semibold text-xs text-slate-800 flex justify-between items-center hover:border-orange-500 transition-colors shadow-sm"
                >
                  <span className="truncate">{selectedAudioSource}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isInputMenuOpen && (
                  <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 p-1.5 space-y-1">
                    {['System Microphone', 'Zoom / Teams Loopback', 'Upload MP3 / WAV File'].map((src) => (
                      <button
                        key={src}
                        onClick={() => {
                          setSelectedAudioSource(src);
                          setIsInputMenuOpen(false);
                          showNotification(`🎙️ Input Source Set: ${src}`);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors flex items-center justify-between"
                      >
                        <span>{src}</span>
                        {selectedAudioSource === src && <Check className="w-3.5 h-3.5 text-orange-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* COLUMN 2: LIVE SPEECH-TO-TEXT & TRANSLATION STREAM (5 cols) */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 flex flex-col justify-between space-y-4 shadow-xl">
            <div>
              {/* Header with Language Pair Selector */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-orange-400 animate-pulse" />
                  <span className="text-xs font-bold text-orange-400">Live Speech Feed</span>
                </div>

                {/* Interactive Language Pair Selector */}
                <div className="relative">
                  <button
                    onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-all"
                  >
                    <Globe className="w-3.5 h-3.5 text-orange-400" />
                    <span>{currentPair.srcLang} ➔ {currentPair.tgtLang}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {isLangMenuOpen && (
                    <div className="absolute right-0 mt-1.5 w-56 rounded-xl bg-slate-800 border border-orange-500/40 p-1.5 shadow-2xl z-50 space-y-1">
                      <div className="text-[10px] font-bold text-orange-400 uppercase px-2 py-1 border-b border-slate-700">
                        Select Speech Language Pair:
                      </div>
                      {languagePairs.map((pair, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => {
                            setActiveLangIdx(pIdx);
                            setIsLangMenuOpen(false);
                            showNotification(`🌐 Language Switched: ${pair.srcLang} ➔ ${pair.tgtLang}`);
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                            activeLangIdx === pIdx
                              ? 'bg-orange-500 text-white font-bold'
                              : 'text-slate-200 hover:bg-slate-700'
                          }`}
                        >
                          <span>{pair.srcLang} ➔ {pair.tgtLang}</span>
                          {activeLangIdx === pIdx && <Check className="w-3.5 h-3.5 text-white" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Speaker Label */}
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-300">{currentPair.speaker}:</span>
                <span className="text-[10px] text-emerald-400 font-mono">99.4% Precision</span>
              </div>

              {/* Live Character-by-Character Speech Stream */}
              <div className="mt-2 p-3 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm text-slate-100 font-sans leading-relaxed min-h-[64px]">
                "{typedSpeech}"<span className="inline-block w-1.5 h-4 bg-orange-500 ml-1 animate-pulse" />
              </div>

              {/* Target Translation Stream */}
              <div className="mt-3 p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-xs text-orange-200 leading-relaxed">
                <span className="font-bold text-amber-400 block mb-1">
                  Neural {currentPair.tgtLang} Translation:
                </span>
                "{typedTranslation}"
              </div>
            </div>

            {/* AI Model Badge */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Engine: <b className="text-slate-200">{selectedModel}</b></span>
              <span className="text-orange-400 font-bold">VAD Active ⚡</span>
            </div>
          </div>

          {/* COLUMN 3: AI NOTES & INSTANT EXPORTS (4 cols) */}
          <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-3">
                <span className="uppercase tracking-wider flex items-center gap-1.5 text-slate-900">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                  AI Notes & Actions
                </span>
                <span className="text-emerald-600 font-bold">148 Notes</span>
              </div>

              {/* Dynamic AI Summary Points */}
              <div className="space-y-2 text-xs text-slate-700 text-left">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-start gap-2">
                  <Check className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <span><b>Topic:</b> Neural speech recognition & 50ms latency streaming.</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-start gap-2">
                  <Check className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <span><b>Action Item 1:</b> Review lecture audio recordings & export Notion notes.</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-start gap-2">
                  <Check className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <span><b>Action Item 2:</b> Share translated Spanish captions with global team.</span>
                </div>
              </div>
            </div>

            {/* Instant Export Bar */}
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-600">
                <span>INSTANT EXPORT SESSION</span>
                {exportingFormat && <span className="text-orange-600 font-mono">{exportProgress}%</span>}
              </div>

              {exportingFormat ? (
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden my-2">
                  <div className="bg-orange-500 h-full transition-all duration-200" style={{ width: `${exportProgress}%` }} />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleExport('PDF')}
                    className="py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-orange-600 transition-all flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Download className="w-3 h-3" />
                    <span>PDF</span>
                  </button>

                  <button
                    onClick={() => handleExport('Notion')}
                    className="py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-orange-600 transition-all flex items-center justify-center gap-1 shadow-sm"
                  >
                    <FileText className="w-3 h-3" />
                    <span>Notion</span>
                  </button>

                  <button
                    onClick={() => handleExport('SRT')}
                    className="py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-orange-600 transition-all flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Share2 className="w-3 h-3" />
                    <span>SRT</span>
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
