import React, { useState, useEffect } from 'react';
import {
  Mic,
  Upload,
  FolderClosed,
  Bell,
  ChevronDown,
  ArrowRight,
  Home,
  FileText,
  Calendar,
  Sparkles,
  Pause,
  Play,
  Volume2,
  CheckCircle2,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';

export const InteractiveAppPreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Home');
  const [isRecording, setIsRecording] = useState(true);
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [simulatedSpeechIndex, setSimulatedSpeechIndex] = useState(0);

  const speechLines = [
    "Welcome everyone. Today we are discussing quantum neural algorithms...",
    "Live translation into Spanish & Hindi is active with 99.4% precision.",
    "Key Takeaway: Real-time captioning improves lecture retention by 42%.",
    "Generating automated action items and notes for all attendees...",
  ];

  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(() => {
      setSimulatedSpeechIndex((prev) => (prev + 1) % speechLines.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isRecording]);

  return (
    <section id="demo" className="py-16 md:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-xs uppercase tracking-widest font-bold text-orange-400 mb-3">
            Interactive Product Interface
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white">
            Experience <span className="text-orange-500">ClarityStream AI</span> Live
          </p>
          <p className="mt-3 text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Interact with the dashboard mockup below. Click options to simulate live audio recording and real-time captioning.
          </p>
        </div>

        {/* Dashboard Showcase Frame */}
        <div className="relative rounded-3xl bg-[#0d0f14] border border-slate-800/80 shadow-2xl overflow-hidden backdrop-blur-2xl p-4 sm:p-8">
          {/* Subtle Top Ambient Light */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" />

          {/* Top Bar Header */}
          <div className="flex items-center justify-between pb-6 border-b border-white/5">
            <div className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <span>Good afternoon ☀️</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <button className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 border border-white/10 transition-colors">
                <Bell className="w-4 h-4" />
              </button>

              {/* User Profile Badge */}
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-200">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-600 flex items-center justify-center font-bold text-white text-xs">
                  R
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-semibold text-slate-100 leading-tight">Rohan</span>
                  <span className="text-[10px] text-slate-400">Free Plan</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </div>
            </div>
          </div>

          {/* Hero Greeting inside dashboard */}
          <div className="mt-8 mb-8 text-left">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              What would you like to <span className="text-orange-500">do today?</span>
            </h2>
          </div>

          {/* 3 Action Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {/* Card 1: Start Live Session */}
            <div
              onClick={() => setActiveCard(1)}
              className={`group relative rounded-2xl p-6 transition-all cursor-pointer border ${
                activeCard === 1
                  ? 'bg-orange-500/10 border-orange-500 shadow-lg shadow-orange-500/20'
                  : 'bg-white/[0.03] border-white/10 hover:border-orange-500/40 hover:bg-white/[0.05]'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 mb-4 group-hover:scale-110 transition-transform">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors">
                Start Live Session
              </h3>
              <p className="text-xs text-slate-400 mt-1 mb-6">
                Record and transcribe in real time.
              </p>
              <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400 group-hover:translate-x-1 transition-transform">
                <span>Get started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>

              {/* Background Soundwave Graphic */}
              <div className="absolute right-3 bottom-3 opacity-15 group-hover:opacity-30 transition-opacity pointer-events-none">
                <div className="flex items-end gap-1 h-12">
                  <div className="w-1 bg-orange-500 h-4 rounded-full" />
                  <div className="w-1 bg-orange-500 h-8 rounded-full" />
                  <div className="w-1 bg-orange-500 h-10 rounded-full" />
                  <div className="w-1 bg-orange-500 h-6 rounded-full" />
                </div>
              </div>
            </div>

            {/* Card 2: Upload Recording */}
            <div
              onClick={() => setActiveCard(2)}
              className={`group relative rounded-2xl p-6 transition-all cursor-pointer border ${
                activeCard === 2
                  ? 'bg-orange-500/10 border-orange-500 shadow-lg shadow-orange-500/20'
                  : 'bg-white/[0.03] border-white/10 hover:border-orange-500/40 hover:bg-white/[0.05]'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors">
                Upload Recording
              </h3>
              <p className="text-xs text-slate-400 mt-1 mb-6">
                Drop in an audio or video file.
              </p>
              <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400 group-hover:translate-x-1 transition-transform">
                <span>Get started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>

              {/* Background Cloud Upload Graphic */}
              <div className="absolute right-3 bottom-3 opacity-15 group-hover:opacity-30 transition-opacity pointer-events-none">
                <Upload className="w-14 h-14 text-orange-400" />
              </div>
            </div>

            {/* Card 3: Open My Library */}
            <div
              onClick={() => setActiveCard(3)}
              className={`group relative rounded-2xl p-6 transition-all cursor-pointer border ${
                activeCard === 3
                  ? 'bg-orange-500/10 border-orange-500 shadow-lg shadow-orange-500/20'
                  : 'bg-white/[0.03] border-white/10 hover:border-orange-500/40 hover:bg-white/[0.05]'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 mb-4 group-hover:scale-110 transition-transform">
                <FolderClosed className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors">
                Open My Library
              </h3>
              <p className="text-xs text-slate-400 mt-1 mb-6">
                Browse past sessions and notes.
              </p>
              <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400 group-hover:translate-x-1 transition-transform">
                <span>Get started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>

              {/* Background Folder Graphic */}
              <div className="absolute right-3 bottom-3 opacity-15 group-hover:opacity-30 transition-opacity pointer-events-none">
                <FolderClosed className="w-14 h-14 text-orange-400" />
              </div>
            </div>
          </div>

          {/* Main Central Interactive Panel */}
          <div className="relative rounded-3xl bg-gradient-to-b from-[#12151e] to-[#0c0e14] border border-white/10 p-6 sm:p-10 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column Text & Controls */}
              <div className="lg:col-span-7 space-y-6 text-left">
                {/* Status Pill */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  <span>Real-time AI, always listening</span>
                </div>

                {/* Big Panel Title */}
                <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  Real-Time <span className="text-orange-500">AI Accessibility</span> Assistant
                </h3>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  Record. Transcribe. Translate. Summarize. All in real time — designed for lectures, meetings, webinars and every learner.
                </p>

                {/* Live Captions Display */}
                <div className="p-4 rounded-xl bg-black/40 border border-orange-500/30 font-mono text-xs sm:text-sm text-orange-200/90 flex items-start gap-3 shadow-inner">
                  <Sparkles className="w-4 h-4 text-orange-400 shrink-0 mt-0.5 animate-spin" style={{ animationDuration: '4s' }} />
                  <p className="leading-relaxed font-sans">
                    <span className="font-semibold text-white">Live Speech Feed: </span>
                    <span className="text-orange-300">"{speechLines[simulatedSpeechIndex]}"</span>
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => setIsRecording(!isRecording)}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm shadow-lg shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all"
                  >
                    <Mic className="w-4 h-4" />
                    <span>{isRecording ? 'Session Active' : 'Start Live Session'}</span>
                  </button>

                  <button className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-semibold text-sm transition-all">
                    <Upload className="w-4 h-4 text-orange-400" />
                    <span>Upload Recording</span>
                  </button>
                </div>
              </div>

              {/* Right Column Audio Visualizer Ring (Inspired by Screenshot) */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center relative py-4">
                {/* Concentric Mic Glow Ring */}
                <div className="relative w-44 h-44 sm:w-56 sm:h-56 rounded-full flex items-center justify-center">
                  {/* Outer Pulsing Aura */}
                  <div className="absolute inset-0 rounded-full bg-orange-500/10 border border-orange-500/20 animate-mic-pulse" />
                  <div className="absolute inset-4 rounded-full bg-orange-500/15 border border-orange-500/30" />
                  <div className="absolute inset-8 rounded-full bg-orange-500/20 border border-orange-500/40" />

                  {/* Center Mic Orb */}
                  <button
                    onClick={() => setIsRecording(!isRecording)}
                    className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-2xl shadow-orange-500/60 hover:scale-110 active:scale-95 transition-all group"
                  >
                    <Mic className="w-10 h-10 sm:w-12 sm:h-12 text-white group-hover:rotate-6 transition-transform" />
                  </button>
                </div>

                {/* Bottom Sound Spectrum Bars Container */}
                <div className="mt-6 w-full max-w-xs px-4 py-3 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-between gap-3 shadow-xl">
                  <button
                    onClick={() => setIsRecording(!isRecording)}
                    className="w-9 h-9 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all shrink-0"
                  >
                    {isRecording ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>

                  {/* Sound Wave Bars */}
                  <div className="flex items-center gap-1 h-8 flex-1 justify-center overflow-hidden">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 rounded-full bg-gradient-to-t from-orange-600 to-amber-400 transition-all ${
                          isRecording
                            ? `animate-wave-${(i % 5) + 1}`
                            : 'h-1 bg-slate-700'
                        }`}
                        style={{
                          height: isRecording ? `${Math.sin(i + simulatedSpeechIndex) * 14 + 18}px` : '4px',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Dock Navigation Bar (Replicating exact screenshot navigation) */}
          <div className="mt-8 flex justify-center">
            <div className="inline-flex items-center gap-1.5 p-1.5 rounded-full bg-black/70 border border-white/15 backdrop-blur-xl shadow-2xl overflow-x-auto max-w-full">
              {[
                { name: 'Home', icon: Home },
                { name: 'Record', icon: Mic },
                { name: 'Upload', icon: Upload },
                { name: 'Library', icon: FolderClosed },
                { name: 'Meetings', icon: Calendar },
                { name: 'Text', icon: FileText },
              ].map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.name;
                return (
                  <button
                    key={tab.name}
                    onClick={() => setActiveTab(tab.name)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-orange-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
