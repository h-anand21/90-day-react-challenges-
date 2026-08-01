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
  X,
  Database,
  Cpu,
  Layers,
  Sliders,
  CheckCircle2,
  Play,
  MousePointer,
  Sparkle,
  Volume2,
  Share2,
} from 'lucide-react';

interface VisualStep {
  stepNum: string;
  title: string;
  desc: string;
  icon: any;
}

interface ModalData {
  title: string;
  badge: string;
  icon: any;
  overview: string;
  specs: { label: string; val: string }[];
  userSteps: VisualStep[];
  interactiveDemoText: string;
}

export const Features: React.FC = () => {
  // Toast Alert Notification State
  const [featureToast, setFeatureToast] = useState<string | null>(null);
  // Active Detail Modal State
  const [activeModal, setActiveModal] = useState<ModalData | null>(null);
  // Modal Interactive Demo State
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [demoTextStream, setDemoTextStream] = useState('');

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
    { name: 'Japanese', flag: '🇯🇵', text: 'リアルタイムAI文字起こし' },
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

  // Trigger Modal Interactive Demo
  const triggerModalDemo = (demoText: string) => {
    setIsDemoActive(true);
    setDemoTextStream('');
    let idx = 0;
    const timer = setInterval(() => {
      idx += 2;
      setDemoTextStream(demoText.slice(0, idx));
      if (idx >= demoText.length) {
        clearInterval(timer);
      }
    }, 40);
  };

  // User-Friendly Visual Walkthrough Modal Provider
  const getModalDetails = (type: string): ModalData => {
    switch (type) {
      case 'Ultra-Low':
        return {
          title: 'How Ultra-Low Latency Streaming Works',
          badge: 'Live Step-by-Step User Guide',
          icon: Mic,
          overview:
            'Experience instant speech-to-text with zero lag. See how live audio is captured, processed, and displayed on screen in under 50 milliseconds.',
          specs: [
            { label: 'Latency Speed', val: '< 38 Milliseconds' },
            { label: 'Speech Accuracy', val: '99.4% Precision' },
            { label: 'Noise Reduction', val: 'Background Noise Filtering' },
            { label: 'Speaker Identification', val: 'Multi-Speaker Detection' },
          ],
          userSteps: [
            {
              stepNum: '01',
              title: 'Click the Microphone Button',
              desc: 'Press the glowing orange mic button in the studio console to start recording your voice.',
              icon: MousePointer,
            },
            {
              stepNum: '02',
              title: 'Speak Naturally',
              desc: 'Our AI model transcribes your words letter-by-letter on screen with live soundwave equalizer feedback.',
              icon: Volume2,
            },
            {
              stepNum: '03',
              title: 'Review Instant Captions',
              desc: 'Captions stream smoothly with under 50ms latency — perfect for fast lectures and live meetings.',
              icon: Zap,
            },
          ],
          interactiveDemoText:
            'Welcome! As you speak into your mic, ClarityStream AI processes speech frames in 38ms and displays live captions with 99.4% accuracy...',
        };

      case 'Live':
        return {
          title: 'How Live Multilingual Translation Works',
          badge: '50+ Languages Translation Guide',
          icon: Globe,
          overview:
            'Break language barriers in real time. Translate live spoken lectures and meetings into Spanish, French, Hindi, Japanese, and 50+ languages instantly.',
          specs: [
            { label: 'Supported Languages', val: '50+ World Languages' },
            { label: 'Translation Latency', val: '< 12 Milliseconds' },
            { label: 'Speaker Accents', val: 'Custom Accent Recognition' },
            { label: 'Technical Vocabulary', val: 'Medical & Legal Terminology' },
          ],
          userSteps: [
            {
              stepNum: '01',
              title: 'Select Target Language',
              desc: 'Click the language selector menu (e.g. English ➔ Spanish 🇪🇸) to choose your target language.',
              icon: Globe,
            },
            {
              stepNum: '02',
              title: 'Live Speech Translation',
              desc: 'As the speaker talks in English, translated captions update line-by-line right below the transcript.',
              icon: Cpu,
            },
            {
              stepNum: '03',
              title: 'Share Global Subtitles',
              desc: 'Export translated captions as SRT subtitles to share with international teams instantly.',
              icon: Share2,
            },
          ],
          interactiveDemoText:
            '¡Bienvenidos! Hoy estamos probando la traducción en tiempo real de ClarityStream AI en más de 50 idiomas con subtítulos instantáneos...',
        };

      case 'Automated':
        return {
          title: 'How Automated AI Summaries Work',
          badge: 'GPT-4o AI Notes Guide',
          icon: Sparkles,
          overview:
            'Stop spending hours writing meeting notes. GPT-4o AI extracts key takeaways, action points, and meeting minutes automatically.',
          specs: [
            { label: 'AI Intelligence', val: 'GPT-4o Neural Model' },
            { label: 'Generation Speed', val: '< 1.2 Seconds' },
            { label: 'Notes Storage', val: 'Supabase Encrypted Vault' },
            { label: 'Extraction', val: 'Action Items + Bullet Points' },
          ],
          userSteps: [
            {
              stepNum: '01',
              title: 'Record Lecture / Meeting',
              desc: 'Let ClarityStream transcribe your audio session in the background.',
              icon: Mic,
            },
            {
              stepNum: '02',
              title: 'Click "Generate Notes"',
              desc: 'Click the AI Summary button at the end of your session to analyze the full conversation.',
              icon: Sparkles,
            },
            {
              stepNum: '03',
              title: 'Get Structured Minutes',
              desc: 'Review organized action items, decision points, and key meeting takeaways ready to export.',
              icon: CheckCircle2,
            },
          ],
          interactiveDemoText:
            'AI Summary Generated: 1) Key decisions cataloged. 2) Action items assigned to team. 3) Meeting minutes saved to cloud vault.',
        };

      case 'Universal':
        return {
          title: 'How Universal Accessibility Works',
          badge: 'ADA & WCAG 2.1 AAA Accessibility Guide',
          icon: Headphones,
          overview:
            'Empower every learner. Designed specifically for deaf and hard-of-hearing individuals, ESL students, and neurodivergent users.',
          specs: [
            { label: 'Compliance Rating', val: 'WCAG 2.1 AAA Certified' },
            { label: 'Color Contrast', val: '21:1 Ultra High Contrast' },
            { label: 'Font Sizing', val: 'Scalable 12px - 28px Captions' },
            { label: 'Screen Readers', val: 'Full ARIA Compatibility' },
          ],
          userSteps: [
            {
              stepNum: '01',
              title: 'Enable High Contrast Mode',
              desc: 'Toggle high-contrast caption backgrounds for maximum visual readability.',
              icon: Sliders,
            },
            {
              stepNum: '02',
              title: 'Adjust Caption Font Size',
              desc: 'Click the font resizer (A+ / A-) to scale captions to your preferred size.',
              icon: Headphones,
            },
            {
              stepNum: '03',
              title: 'Follow Live Audio Stream',
              desc: 'Enjoy barrier-free captions with speaker color coding and clear text formatting.',
              icon: Check,
            },
          ],
          interactiveDemoText:
            'High-Contrast Caption Mode Active: Font size increased to 16px. Optimized for Deaf & Hard-of-Hearing accessibility.',
        };

      case 'Zero':
        return {
          title: 'How Zero Data Retention Security Works',
          badge: 'SOC2 & HIPAA Privacy Guide',
          icon: Shield,
          overview:
            'Your voice data remains 100% private. Choose between military-grade cloud encryption or local on-device transcription.',
          specs: [
            { label: 'Encryption Standard', val: 'TLS 1.3 & AES-256' },
            { label: 'Privacy Mode', val: 'Local On-Device ONNX' },
            { label: 'Audio Retention', val: '0 Days (Volatile Memory Only)' },
            { label: 'Security Certs', val: 'SOC2 Type II & HIPAA' },
          ],
          userSteps: [
            {
              stepNum: '01',
              title: 'Choose Privacy Mode',
              desc: 'Select "On-Device Local Mode" to process all voice data inside your browser.',
              icon: Lock,
            },
            {
              stepNum: '02',
              title: 'Local AI Processing',
              desc: 'Audio frames are transcribed locally without sending voice recordings to external servers.',
              icon: Shield,
            },
            {
              stepNum: '03',
              title: 'Zero Memory Footprint',
              desc: 'Once your session ends, temporary audio buffers are permanently wiped.',
              icon: CheckCircle2,
            },
          ],
          interactiveDemoText:
            'Security Mode Active: TLS 1.3 Vault Encryption enabled. Zero audio data stored on server.',
        };

      default: // Multi-Format
        return {
          title: 'How One-Click Multi-Format Export Works',
          badge: 'PDF • Notion • SRT Subtitles Guide',
          icon: FileCheck,
          overview:
            'Take your notes anywhere. Export audio transcripts and meeting minutes directly into PDF, Notion, Word, or SRT subtitle files with one click.',
          specs: [
            { label: 'Supported Formats', val: 'PDF, Notion, SRT, DOCX' },
            { label: 'Timestamps', val: 'Millisecond Timeline Marks' },
            { label: 'Cloud Sync', val: 'Automatic Supabase Vault Backup' },
            { label: 'Export Speed', val: 'Instant One-Click Download' },
          ],
          userSteps: [
            {
              stepNum: '01',
              title: 'Finish Audio Session',
              desc: 'Complete your live lecture or meeting transcription in the studio console.',
              icon: Check,
            },
            {
              stepNum: '02',
              title: 'Select Export Format',
              desc: 'Click on PDF, Notion, or SRT subtitle format buttons in the export bar.',
              icon: Download,
            },
            {
              stepNum: '03',
              title: 'Instant Download & Sync',
              desc: 'Watch the export progress bar complete (0% ➔ 100%) and save files directly to your device.',
              icon: Database,
            },
          ],
          interactiveDemoText:
            'Export Progress: 100% Complete. Session #CS-8924 exported to PDF with speaker timelines & AI notes.',
        };
    }
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

      {/* USER-FRIENDLY VISUAL WALKTHROUGH MODAL POPUP */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0e111a] border border-orange-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-left overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
                    <activeModal.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-white">{activeModal.title}</h3>
                    <span className="text-xs text-orange-400 font-semibold">{activeModal.badge}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveModal(null);
                    setIsDemoActive(false);
                  }}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Overview */}
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                {activeModal.overview}
              </p>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {activeModal.specs.map((sp, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{sp.label}</span>
                    <span className="text-xs font-extrabold text-orange-300 mt-0.5 block">{sp.val}</span>
                  </div>
                ))}
              </div>

              {/* STEP-BY-STEP VISUAL USER GUIDE */}
              <div className="mb-6 space-y-3">
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wider block">
                  3-Step User Guide (How to Use):
                </span>
                
                <div className="space-y-2">
                  {activeModal.userSteps.map((st, sIdx) => {
                    const StepIcon = st.icon;
                    return (
                      <div
                        key={sIdx}
                        className="p-3.5 rounded-2xl bg-black/50 border border-white/10 flex items-start gap-3 hover:border-orange-500/40 transition-colors"
                      >
                        <div className="w-7 h-7 rounded-xl bg-orange-500/20 text-orange-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {st.stepNum}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <StepIcon className="w-3.5 h-3.5 text-orange-400" />
                            {st.title}
                          </h4>
                          <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                            {st.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* LIVE INTERACTIVE DEMO SIMULATOR INSIDE MODAL */}
              <div className="p-4 rounded-2xl bg-black border border-orange-500/30 mb-6 space-y-2">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                    Interactive Feature Simulation
                  </span>
                  <button
                    onClick={() => triggerModalDemo(activeModal.interactiveDemoText)}
                    className="text-[10px] px-3 py-1 rounded-lg bg-orange-500 text-white font-bold hover:bg-orange-600 active:scale-95 transition-all flex items-center gap-1 shadow-md shadow-orange-500/30"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Run Live Demo</span>
                  </button>
                </div>

                <div className="text-xs text-slate-200 leading-relaxed font-mono min-h-[44px]">
                  {isDemoActive ? (
                    <span>"{demoTextStream}"<span className="inline-block w-1.5 h-3.5 bg-orange-500 ml-1 animate-pulse" /></span>
                  ) : (
                    <span className="text-slate-500 italic">Click "Run Live Demo" button above to see this feature in action...</span>
                  )}
                </div>
              </div>

              {/* Modal Action Footer */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-slate-400">Want to test in main studio?</span>
                <button
                  onClick={() => {
                    setActiveModal(null);
                    setIsDemoActive(false);
                    showToast(`🚀 Launching ${activeModal.title} in Studio Console!`);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-lg shadow-orange-500/30 flex items-center gap-2 transition-all"
                >
                  <span>Try in Main Studio Console</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
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

            {/* USER-FRIENDLY VISUAL WALKTHROUGH LINK */}
            <button
              onClick={() => setActiveModal(getModalDetails('Ultra-Low'))}
              className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-orange-400 group-hover:translate-x-1 transition-transform w-full text-left"
            >
              <span>Learn how to use Ultra-Low</span>
              <ArrowRight className="w-4 h-4" />
            </button>
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

            {/* USER-FRIENDLY VISUAL WALKTHROUGH LINK */}
            <button
              onClick={() => setActiveModal(getModalDetails('Live'))}
              className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-orange-400 group-hover:translate-x-1 transition-transform w-full text-left"
            >
              <span>Learn how to use Translation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
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

            {/* USER-FRIENDLY VISUAL WALKTHROUGH LINK */}
            <button
              onClick={() => setActiveModal(getModalDetails('Automated'))}
              className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-orange-400 group-hover:translate-x-1 transition-transform w-full text-left"
            >
              <span>Learn how to use AI Notes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
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

            {/* USER-FRIENDLY VISUAL WALKTHROUGH LINK */}
            <button
              onClick={() => setActiveModal(getModalDetails('Universal'))}
              className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-orange-400 group-hover:translate-x-1 transition-transform w-full text-left"
            >
              <span>Learn how Accessibility Works</span>
              <ArrowRight className="w-4 h-4" />
            </button>
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

            {/* USER-FRIENDLY VISUAL WALKTHROUGH LINK */}
            <button
              onClick={() => setActiveModal(getModalDetails('Zero'))}
              className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-orange-400 group-hover:translate-x-1 transition-transform w-full text-left"
            >
              <span>Learn how Security Works</span>
              <ArrowRight className="w-4 h-4" />
            </button>
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

            {/* USER-FRIENDLY VISUAL WALKTHROUGH LINK */}
            <button
              onClick={() => setActiveModal(getModalDetails('Multi-Format'))}
              className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-orange-400 group-hover:translate-x-1 transition-transform w-full text-left"
            >
              <span>Learn how Export Works</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
