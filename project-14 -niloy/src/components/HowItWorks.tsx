import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Cpu,
  CheckCircle2,
  ArrowRight,
  Upload,
  Sparkles,
  Globe,
  FileText,
  Download,
  Share2,
  Check,
  Play,
  Pause,
  ShieldCheck,
  FileAudio,
  Zap,
} from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Step 1 Interactive Simulation States
  const [activeInputType, setActiveInputType] = useState<'mic' | 'file'>('mic');
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Step 2 Live Typing Simulation States
  const [step2TypedText, setStep2TypedText] = useState('');
  const [step2TransText, setStep2TransText] = useState('');
  const sampleSpeech = "Today's lecture focuses on neural speech processing, real-time transcription latency, and automatic action item generation.";
  const sampleTrans = "La conferencia de hoy se centra en el procesamiento neural del habla y la generación automática de tareas.";

  // Step 3 Export Simulation States
  const [step3ExportFormat, setStep3ExportFormat] = useState<string | null>(null);
  const [step3ExportProgress, setStep3ExportProgress] = useState(0);

  // Toast notification
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Auto-advance stepper every 6 seconds if playing
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Live typing effect for Step 2
  useEffect(() => {
    let charIdx = 0;
    const interval = setInterval(() => {
      charIdx = (charIdx + 1) % (sampleSpeech.length + 1);
      const transIdx = Math.floor((charIdx / sampleSpeech.length) * sampleTrans.length);
      setStep2TypedText(sampleSpeech.slice(0, Math.max(10, charIdx)));
      setStep2TransText(sampleTrans.slice(0, Math.max(12, transIdx)));
    }, 60);

    return () => clearInterval(interval);
  }, []);

  // Handle Drag & Drop File Simulation
  const handleFileUploadSim = () => {
    setActiveInputType('file');
    setIsUploading(true);
    setSelectedFileName('lecture_audio_q3_recording.mp3');
    setUploadProgress(0);

    let p = 0;
    const interval = setInterval(() => {
      p += 25;
      setUploadProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setIsUploading(false);
        showToast('📁 Audio File "lecture_audio_q3.mp3" Uploaded & Processed with VAD!');
      }
    }, 180);
  };

  // Handle Export Simulation in Step 3
  const handleStep3Export = (fmt: string) => {
    setStep3ExportFormat(fmt);
    setStep3ExportProgress(0);
    let p = 0;
    const interval = setInterval(() => {
      p += 25;
      setStep3ExportProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        showToast(`📥 Saved Session Summary as ${fmt} file!`);
        setTimeout(() => setStep3ExportFormat(null), 2500);
      }
    }, 180);
  };

  const steps = [
    {
      number: '01',
      title: 'Select Audio Input',
      subtitle: 'Connect System Mic or Upload File',
      desc: 'Connect your system mic for live lectures/meetings, or drop any recorded audio/video file (MP3, WAV, MP4).',
      icon: Mic,
      tag: 'Step 1: Capture',
    },
    {
      number: '02',
      title: 'AI Streams Live Captions',
      subtitle: 'Neural Speech-to-Text & Translation',
      desc: 'Our VAD & Whisper neural model transcribes speech instantly, translates on the fly, and highlights key concepts.',
      icon: Cpu,
      tag: 'Step 2: Process',
    },
    {
      number: '03',
      title: 'Export Notes & Summaries',
      subtitle: 'One-Click Cloud Sync & Multi-Export',
      desc: 'Access your Supabase cloud library, review automated action items, and export formatted notes with one click.',
      icon: CheckCircle2,
      tag: 'Step 3: Export',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-b from-[#080a0e] via-[#0e121a] to-[#080a0e] relative overflow-hidden text-left">
      {/* Toast Alert */}
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

      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-orange-500/10 rounded-full blur-[180px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-widest mb-4 shadow-lg shadow-orange-950/40"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Workflow Simulation</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight"
          >
            How <span className="text-orange-500">ClarityStream</span> Works
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-slate-400 text-base sm:text-lg"
          >
            Start transcribing and generating accessible audio notes in under 30 seconds.
          </motion.p>
        </div>

        {/* 3 Interactive Stepper Cards Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {steps.map((step, idx) => {
            const IconComp = step.icon;
            const isActive = activeStep === idx;
            return (
              <motion.div
                key={idx}
                onClick={() => {
                  setActiveStep(idx);
                  setIsAutoPlaying(false);
                }}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className={`relative rounded-3xl p-8 cursor-pointer transition-all duration-300 border flex flex-col justify-between ${
                  isActive
                    ? 'bg-gradient-to-b from-[#181c28] to-[#0e111a] border-orange-500 shadow-2xl shadow-orange-500/20 scale-[1.02]'
                    : 'bg-[#0d0f16]/90 border-white/10 hover:border-white/20'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activePill"
                    className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-orange-500 text-white font-bold text-[10px] uppercase tracking-wider shadow-md shadow-orange-500/40 flex items-center gap-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    <span>Active Stage</span>
                  </motion.div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className={`text-4xl font-black ${isActive ? 'text-orange-500' : 'text-slate-600'}`}>
                      {step.number}
                    </span>
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                        isActive
                          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/40'
                          : 'bg-white/5 border border-white/10 text-slate-400'
                      }`}
                    >
                      <IconComp className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1">{step.title}</h3>
                  <p className="text-xs text-orange-400 font-semibold mb-3">{step.subtitle}</p>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </div>

                <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold">
                  <span className={isActive ? 'text-orange-400' : 'text-slate-500'}>{step.tag}</span>
                  <ArrowRight className={`w-4 h-4 transition-transform ${isActive ? 'text-orange-400 translate-x-1' : 'text-slate-600'}`} />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ---------------------------------------------------- */}
        {/* LIVE INTERACTIVE SIMULATION SCREEN */}
        {/* ---------------------------------------------------- */}
        <div className="relative rounded-3xl bg-[#0b0d14] border border-white/15 p-6 sm:p-10 shadow-2xl overflow-hidden backdrop-blur-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10 mb-8">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs font-mono font-semibold text-slate-300 ml-2">
                Pipeline Simulator — Stage 0{activeStep + 1}: {steps[activeStep].title}
              </span>
            </div>

            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              {isAutoPlaying ? <Pause className="w-3.5 h-3.5 text-orange-400" /> : <Play className="w-3.5 h-3.5 text-orange-400" />}
              <span>{isAutoPlaying ? 'Auto-Advancing' : 'Paused'}</span>
            </button>
          </div>

          {/* AnimatePresence for Active Step Simulation */}
          <AnimatePresence mode="wait">
            {/* STAGE 01: AUDIO INPUT & DROPZONE SIMULATOR */}
            {activeStep === 0 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-6 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold">
                    <Mic className="w-3.5 h-3.5" />
                    <span>Input Layer Active</span>
                  </div>

                  <h3 className="text-2xl font-extrabold text-white">
                    Step 1: Capture High-Fidelity Audio
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Connect your system microphone for live lecture closed-captioning, or drag-and-drop pre-recorded audio/video files.
                  </p>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                      <span>Supported Inputs:</span>
                      <span className="text-orange-400">Microphone, MP3, WAV, MP4, M4A</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>End-to-End TLS 1.3 Encryption & Local VAD Processing</span>
                    </div>
                  </div>
                </div>

                {/* Right Interactive Dropzone / Mic Control Graphic */}
                <div className="lg:col-span-6">
                  <div className="p-8 rounded-2xl bg-gradient-to-b from-[#141722] to-[#0d0f17] border-2 border-dashed border-orange-500/40 hover:border-orange-500 text-center relative group transition-all shadow-xl">
                    
                    {/* Interactive Mode Toggle */}
                    <div className="flex items-center justify-center gap-3 mb-6">
                      <button
                        onClick={() => {
                          setActiveInputType('mic');
                          showToast('🎙️ Active Input: System Microphone Streaming');
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          activeInputType === 'mic'
                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                            : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white'
                        }`}
                      >
                        <Mic className="w-3.5 h-3.5" />
                        <span>Use System Mic</span>
                      </button>

                      <button
                        onClick={handleFileUploadSim}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          activeInputType === 'file'
                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                            : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Audio File</span>
                      </button>
                    </div>

                    {/* Mic Stream View */}
                    {activeInputType === 'mic' ? (
                      <div className="space-y-4">
                        <div className="w-16 h-16 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center mx-auto shadow-lg shadow-orange-500/30 animate-pulse">
                          <Mic className="w-8 h-8" />
                        </div>
                        <h4 className="text-base font-bold text-white">System Microphone Active & Listening</h4>
                        <div className="flex items-end justify-center gap-1 h-8 px-4 py-1 bg-black/60 rounded-xl border border-white/10 max-w-xs mx-auto">
                          {Array.from({ length: 16 }).map((_, i) => (
                            <div
                              key={i}
                              className="w-1 rounded-full bg-gradient-to-t from-orange-500 to-amber-300 animate-wave-1"
                              style={{ height: `${(i % 5) * 4 + 8}px` }}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* File Upload View */
                      <div className="space-y-4 cursor-pointer" onClick={handleFileUploadSim}>
                        <div className="w-16 h-16 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center mx-auto shadow-lg shadow-orange-500/30">
                          <FileAudio className="w-8 h-8" />
                        </div>

                        {isUploading ? (
                          <div className="space-y-2">
                            <span className="text-xs font-bold text-orange-400 block">Uploading & Sampling VAD Frames... ({uploadProgress}%)</span>
                            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden max-w-xs mx-auto">
                              <div className="bg-orange-500 h-full transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                            </div>
                          </div>
                        ) : selectedFileName ? (
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-emerald-400 block flex items-center justify-center gap-1">
                              <Check className="w-4 h-4 text-emerald-400" />
                              {selectedFileName}
                            </span>
                            <span className="text-[10px] text-slate-400 block">Click box to upload another audio file</span>
                          </div>
                        ) : (
                          <div>
                            <h4 className="text-base font-bold text-white mb-1">
                              Drag & Drop Audio / Video File Here
                            </h4>
                            <p className="text-xs text-slate-400">
                              or click to select file from your computer (MP3, WAV, MP4)
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </div>
              </motion.div>
            )}

            {/* STAGE 02: REAL-TIME AI STREAMING & TYPING CAPTIONS */}
            {activeStep === 1 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-6 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Neural Processing Layer Active</span>
                  </div>

                  <h3 className="text-2xl font-extrabold text-white">
                    Step 2: Real-Time AI Speech Stream & Translation
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Our neural speech recognition engine transcribes with under 50ms latency, identifies speakers, and translates into 50+ languages.
                  </p>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-slate-400 block">Streaming Latency</span>
                      <span className="text-base font-extrabold text-orange-400">&lt; 48 ms</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-slate-400 block">Speech Precision</span>
                      <span className="text-base font-extrabold text-emerald-400">99.4% Accuracy</span>
                    </div>
                  </div>
                </div>

                {/* Right Live Typing Message Feed Graphic */}
                <div className="lg:col-span-6">
                  <div className="p-6 rounded-2xl bg-black/70 border border-orange-500/40 space-y-4 shadow-2xl">
                    <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/10 pb-3">
                      <span className="font-semibold text-orange-400 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                        Live Captions Stream (Speaker 1):
                      </span>
                      <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        EN ➔ ES
                      </span>
                    </div>

                    {/* Live Spoken Text Typing Animation */}
                    <div className="space-y-3 font-sans text-xs sm:text-sm">
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-100 leading-relaxed">
                        <span className="font-bold text-orange-400">Transcript: </span>
                        "{step2TypedText}"
                        <span className="inline-block w-1.5 h-3.5 bg-orange-500 ml-1 animate-pulse" />
                      </div>

                      <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-200 leading-relaxed">
                        <span className="font-bold text-amber-400">Spanish Translation: </span>
                        "{step2TransText}"
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STAGE 03: EXPORT NOTES & SUMMARIES */}
            {activeStep === 2 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-6 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Export & Knowledge Layer Active</span>
                  </div>

                  <h3 className="text-2xl font-extrabold text-white">
                    Step 3: Instant Notes & One-Click Cloud Export
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    AI automatically extracts action items, creates bullet-point meeting minutes, and saves everything to your searchable Supabase cloud library.
                  </p>

                  {/* Multi-Format Export Buttons */}
                  <div className="space-y-2 pt-2">
                    {step3ExportFormat ? (
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1">
                        <span className="text-orange-400 font-bold block">Exporting {step3ExportFormat}... ({step3ExportProgress}%)</span>
                        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                          <div className="bg-orange-500 h-full transition-all duration-200" style={{ width: `${step3ExportProgress}%` }} />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleStep3Export('PDF')}
                          className="px-3.5 py-2 rounded-xl bg-orange-500 text-white font-bold text-xs shadow-lg shadow-orange-500/30 flex items-center gap-2 hover:scale-105 transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Export PDF</span>
                        </button>

                        <button
                          onClick={() => handleStep3Export('Notion')}
                          className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-semibold text-xs flex items-center gap-2 transition-all"
                        >
                          <FileText className="w-3.5 h-3.5 text-orange-400" />
                          <span>Sync to Notion</span>
                        </button>

                        <button
                          onClick={() => handleStep3Export('SRT')}
                          className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-semibold text-xs flex items-center gap-2 transition-all"
                        >
                          <Share2 className="w-3.5 h-3.5 text-orange-400" />
                          <span>SRT Subtitles</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right AI Summary Card Populating */}
                <div className="lg:col-span-6">
                  <div className="p-6 rounded-2xl bg-[#141722] border border-orange-500/40 space-y-3 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <span className="font-bold text-white text-xs flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-orange-400" />
                        Automated Session Summary & Key Action Items
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                        SAVED TO VAULT
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-slate-200">
                      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="flex items-start gap-2.5 p-2 rounded-lg bg-white/5">
                        <Check className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                        <span><b>Key Topic:</b> Neural speech recognition & 50ms latency streaming.</span>
                      </motion.div>
                      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="flex items-start gap-2.5 p-2 rounded-lg bg-white/5">
                        <Check className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                        <span><b>Action Item 1:</b> Review lecture audio recordings & export Notion notes.</span>
                      </motion.div>
                      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="flex items-start gap-2.5 p-2 rounded-lg bg-white/5">
                        <Check className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                        <span><b>Action Item 2:</b> Share translated Spanish captions with global team.</span>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
