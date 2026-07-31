import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
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
  Globe,
  Cpu,
  Shield,
  Zap,
} from 'lucide-react';

export const InteractiveAppPreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Home');
  const [isRecording, setIsRecording] = useState(false);
  const [isRealMicActive, setIsRealMicActive] = useState(false);
  const [activeCard, setActiveCard] = useState<number | null>(1);
  const [liveTranscript, setLiveTranscript] = useState<string>(
    'Click "Start Live Session" to activate Voice-to-Text speech recognition...'
  );
  const [detectedLanguage, setDetectedLanguage] = useState('English (US)');
  const [volumeLevel, setVolumeLevel] = useState<number>(10);
  const [summaryPoints, setSummaryPoints] = useState<string[]>([
    'Real-time VAD (Voice Activity Detection) ready',
    'Speech-to-text pipeline connected',
  ]);

  // Refs for Web Speech & Web Audio API
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Simulated fallback interval
  const simulatedSpeechIndex = useRef(0);
  const speechLines = [
    'Welcome everyone. Today we are testing ClarityStream Voice-to-Text engine.',
    'Live translation into Spanish, Hindi & French is active with 99.4% precision.',
    'Key Takeaway: Real-time captioning improves lecture & meeting comprehension by 42%.',
    'AI Interpreter Service auto-extracting key summary points and action items...',
  ];

  // Initialize Speech Recognition & Web Audio API
  const startLiveRecording = async () => {
    try {
      setIsRecording(true);
      setLiveTranscript('Listening... Speak into your microphone now!');

      // Check browser SpeechRecognition support
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript.trim()) {
            setLiveTranscript(currentTranscript);
            setIsRealMicActive(true);
            
            // Add dynamic AI summary
            if (currentTranscript.length > 25) {
              setSummaryPoints((prev) => [
                `User spoken query: "${currentTranscript.slice(-40)}..."`,
                'Live speech transcribed via Web Speech API',
                'AI Summary & Action items updated',
              ]);
            }
          }
        };

        recognition.onerror = () => {
          // Fallback to simulation if mic fails
          startSimulatedSpeech();
        };

        recognition.start();
        recognitionRef.current = recognition;
      } else {
        startSimulatedSpeech();
      }

      // Web Audio API for real volume visualization
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 64;
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateVolume = () => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setVolumeLevel(Math.min(100, Math.max(10, avg * 2.5)));
          animFrameRef.current = requestAnimationFrame(updateVolume);
        };
        updateVolume();
      }
    } catch (err) {
      console.warn('Microphone access fallback to simulation:', err);
      startSimulatedSpeech();
    }
  };

  const stopLiveRecording = () => {
    setIsRecording(false);
    setIsRealMicActive(false);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch (e) {}
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopLiveRecording();
    } else {
      startLiveRecording();
    }
  };

  const startSimulatedSpeech = () => {
    setIsRealMicActive(false);
    const line = speechLines[simulatedSpeechIndex.current % speechLines.length];
    simulatedSpeechIndex.current += 1;
    setLiveTranscript(line);
  };

  useEffect(() => {
    let interval: any = null;
    if (isRecording && !isRealMicActive) {
      interval = setInterval(() => {
        startSimulatedSpeech();
      }, 3500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, isRealMicActive]);

  return (
    <section id="demo" className="py-16 md:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Cpu className="w-3.5 h-3.5" />
            <span>Core Backend Integration</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white">
            Live <span className="text-orange-500">Voice-to-Text</span> & Interpreter Engine
          </h2>
          <p className="mt-3 text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Try real voice recognition below! Click <b>"Start Live Session"</b> and speak into your microphone to see instant captions & live waveform analytics.
          </p>
        </div>

        {/* Dashboard Showcase Frame */}
        <div className="relative rounded-3xl bg-[#0d0f14] border border-slate-800/80 shadow-2xl overflow-hidden backdrop-blur-2xl p-4 sm:p-8">
          {/* Top Ambient Bar */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" />

          {/* Top Bar Header */}
          <div className="flex items-center justify-between pb-6 border-b border-white/5">
            <div className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <span>Good afternoon ☀️</span>
            </div>

            <div className="flex items-center gap-3">
              <button className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 border border-white/10 transition-colors">
                <Bell className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-200">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-600 flex items-center justify-center font-bold text-white text-xs">
                  R
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-semibold text-slate-100 leading-tight">Rohan</span>
                  <span className="text-[10px] text-slate-400">Pro Plan</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </div>
            </div>
          </div>

          {/* Hero Greeting */}
          <div className="mt-8 mb-8 text-left">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              What would you like to <span className="text-orange-500">do today?</span>
            </h2>
          </div>

          {/* 3 Action Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {/* Card 1: Start Live Session */}
            <div
              onClick={() => {
                setActiveCard(1);
                toggleRecording();
              }}
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
                Real-time Voice-to-Text & live captioning.
              </p>
              <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400 group-hover:translate-x-1 transition-transform">
                <span>{isRecording ? 'Stop Recording' : 'Start Mic Stream →'}</span>
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
                Drop in MP3, WAV, or MP4 files.
              </p>
              <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400 group-hover:translate-x-1 transition-transform">
                <span>Upload File →</span>
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
                Supabase cloud saved sessions & summaries.
              </p>
              <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400 group-hover:translate-x-1 transition-transform">
                <span>View Library →</span>
              </div>
            </div>
          </div>

          {/* Main Central Panel */}
          <div className="relative rounded-3xl bg-gradient-to-b from-[#12151e] to-[#0c0e14] border border-white/10 p-6 sm:p-10 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column Controls */}
              <div className="lg:col-span-7 space-y-6 text-left">
                {/* Live Status Pill */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isRecording ? 'bg-orange-500 animate-ping' : 'bg-slate-500'
                      }`}
                    />
                    <span>
                      {isRecording
                        ? isRealMicActive
                          ? '🔴 Real Microphone Active (Listening...)'
                          : '🔴 Live AI Voice Simulation Active'
                        : '⏸️ Mic Idle - Click to Start'}
                    </span>
                  </div>

                  <span className="text-xs px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 font-mono">
                    Language: {detectedLanguage}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  Real-Time <span className="text-orange-500">AI Accessibility</span> Assistant
                </h3>

                {/* Voice-to-Text Live Output Feed Box */}
                <div className="relative p-5 rounded-2xl bg-black/60 border border-orange-500/40 font-sans text-sm text-slate-100 space-y-3 shadow-inner">
                  <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/10 pb-2">
                    <span className="font-semibold text-orange-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
                      Live Speech-to-Text Transcript Feed
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      {isRecording ? 'STREAMING ⚡' : 'PAUSED'}
                    </span>
                  </div>

                  <p className="text-base text-slate-100 font-medium leading-relaxed min-h-[50px]">
                    "{liveTranscript}"
                  </p>

                  {/* Dynamic AI Key Points Extraction */}
                  <div className="pt-3 border-t border-white/10 space-y-1.5">
                    <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider block">
                      Automated AI Action Items:
                    </span>
                    {summaryPoints.map((pt, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={toggleRecording}
                    className={`inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full font-bold text-sm text-white shadow-xl transition-all ${
                      isRecording
                        ? 'bg-red-600 hover:bg-red-500 shadow-red-500/30'
                        : 'bg-gradient-to-r from-orange-500 to-amber-500 shadow-orange-500/30 hover:scale-105'
                    }`}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    <span>{isRecording ? 'Stop Live Session' : '🎙️ Start Live Session'}</span>
                  </button>

                  <button
                    onClick={startSimulatedSpeech}
                    className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-semibold text-sm transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-orange-400" />
                    <span>Simulate Speech Line</span>
                  </button>
                </div>
              </div>

              {/* Right Column Audio Orb Visualizer */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center relative py-4">
                <div className="relative w-48 h-48 sm:w-60 sm:h-60 rounded-full flex items-center justify-center">
                  <div
                    className={`absolute inset-0 rounded-full bg-orange-500/10 border border-orange-500/20 ${
                      isRecording ? 'animate-mic-pulse' : ''
                    }`}
                  />
                  <div className="absolute inset-4 rounded-full bg-orange-500/15 border border-orange-500/30" />
                  <div className="absolute inset-8 rounded-full bg-orange-500/20 border border-orange-500/40" />

                  {/* Interactive Glowing Mic Button */}
                  <button
                    onClick={toggleRecording}
                    className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center text-white shadow-2xl transition-all group ${
                      isRecording
                        ? 'bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 shadow-orange-500/70 scale-105'
                        : 'bg-slate-900 border border-slate-700 hover:border-orange-500'
                    }`}
                  >
                    <Mic className="w-12 h-12 sm:w-14 sm:h-14 text-white group-hover:scale-110 transition-transform" />
                  </button>
                </div>

                {/* Real Sound Spectrum Bars */}
                <div className="mt-6 w-full max-w-xs px-4 py-3 rounded-2xl bg-black/70 border border-white/10 flex items-center justify-between gap-3 shadow-xl">
                  <button
                    onClick={toggleRecording}
                    className="w-9 h-9 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all shrink-0"
                  >
                    {isRecording ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>

                  <div className="flex items-end gap-1 h-8 flex-1 justify-center overflow-hidden">
                    {Array.from({ length: 24 }).map((_, i) => {
                      const barHeight = isRecording
                        ? Math.max(4, Math.sin(i * 0.5 + Date.now() * 0.005) * (volumeLevel * 0.3) + 12)
                        : 4;
                      return (
                        <div
                          key={i}
                          className="w-1 rounded-full bg-gradient-to-t from-orange-600 to-amber-400 transition-all duration-75"
                          style={{ height: `${barHeight}px` }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Dock Navigation */}
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
