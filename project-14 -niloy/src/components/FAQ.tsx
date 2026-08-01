import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  Mic,
  Globe,
  Lock,
  Download,
  Video,
  Shield,
  Zap,
  Check,
  FileText,
  Share2,
} from 'lucide-react';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
  visualDemo: React.ReactNode;
}

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First open by default
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // FAQ Demo States
  const [faq1Precision, setFaq1Precision] = useState(99.4);
  const [faq2Platform, setFaq2Platform] = useState('Zoom Meeting');
  const [faq3Lang, setFaq3Lang] = useState('Spanish 🇪🇸');
  const [faq4Encrypted, setFaq4Encrypted] = useState(true);
  const [faq5ExportProgress, setFaq5ExportProgress] = useState(0);
  const [faq5Exporting, setFaq5Exporting] = useState<string | null>(null);

  const triggerFaq5Export = (format: string) => {
    setFaq5Exporting(format);
    setFaq5ExportProgress(0);
    let p = 0;
    const interval = setInterval(() => {
      p += 25;
      setFaq5ExportProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        showToast(`📥 FAQ Demo: Session exported to ${format} file!`);
        setTimeout(() => setFaq5Exporting(null), 2000);
      }
    }, 180);
  };

  const faqData: FAQItem[] = [
    {
      id: 1,
      question: 'How accurate is the real-time AI audio transcription?',
      answer:
        'ClarityStream AI achieves a verified 99.4% precision rate. Our fine-tuned Whisper neural model uses Voice Activity Detection (VAD) to filter background noise and recognize speaker accents in real time.',
      category: 'Accuracy & Latency',
      visualDemo: (
        <div className="mt-4 p-4 rounded-2xl bg-black/60 border border-orange-500/30 text-xs space-y-3">
          <div className="flex items-center justify-between text-slate-300 border-b border-white/10 pb-2">
            <span className="font-bold text-orange-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              Accuracy Benchmark Visualizer
            </span>
            <span className="text-emerald-400 font-bold font-mono">99.4% Precision</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Speech Precision</span>
                <span className="text-lg font-black text-white">99.4%</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                ✓
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Noise Reduction</span>
                <span className="text-lg font-black text-orange-400">- 45 dB</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                ⚡
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      question: 'Can I use ClarityStream for live lectures and online meetings?',
      answer:
        'Yes! ClarityStream seamlessly connects to your system microphone, Zoom, Microsoft Teams, Google Meet, or uploaded MP3/MP4 lecture files to stream captions in under 50ms.',
      category: 'Lectures & Meetings',
      visualDemo: (
        <div className="mt-4 p-4 rounded-2xl bg-black/60 border border-blue-500/30 text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-bold text-blue-400 flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5" />
              Supported Live Platform Connections
            </span>
            <span className="text-[10px] text-slate-400">Click platform to test connect</span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {['Zoom Meeting', 'Microsoft Teams', 'Google Meet', 'Live Lecture Mic'].map((plat) => (
              <button
                key={plat}
                onClick={() => {
                  setFaq2Platform(plat);
                  showToast(`🎥 Connected ClarityStream to ${plat}!`);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all text-[11px] flex items-center gap-1.5 ${
                  faq2Platform === plat
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-white/5 border border-white/10 text-slate-300 hover:text-white'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{plat}</span>
              </button>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 3,
      question: 'Does it support multi-language live translation?',
      answer:
        'Absolutely. ClarityStream supports 50+ languages including Spanish, French, German, Hindi, Japanese, and Mandarin with automatic language detection and custom domain vocabulary.',
      category: 'Translation',
      visualDemo: (
        <div className="mt-4 p-4 rounded-2xl bg-black/60 border border-purple-500/30 text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-bold text-purple-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              Live Multilingual Translation Tester
            </span>
            <span className="text-[10px] text-purple-300 font-bold">{faq3Lang} Active</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { lang: 'Spanish 🇪🇸', txt: 'Subtítulos en vivo' },
              { lang: 'French 🇫🇷', txt: 'Sous-titres en direct' },
              { lang: 'Hindi 🇮🇳', txt: 'लाइव अनुवाद' },
              { lang: 'Japanese 🇯🇵', txt: 'リアルタイム字幕' },
            ].map((item) => (
              <button
                key={item.lang}
                onClick={() => {
                  setFaq3Lang(item.lang);
                  showToast(`🌐 Switched Live Translation to ${item.lang}!`);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  faq3Lang === item.lang
                    ? 'bg-purple-500/20 border-purple-500 text-white font-bold'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <span className="text-[11px] block">{item.lang}</span>
                <span className="text-[10px] text-orange-300 italic truncate block mt-0.5">{item.txt}</span>
              </button>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 4,
      question: 'Is my audio data private and secure?',
      answer:
        'Yes. We enforce SOC2 Type II and HIPAA data protection protocols with military-grade TLS 1.3 encryption. You can also activate "Zero Data Retention Mode" to process voice locally on your device.',
      category: 'Security & Privacy',
      visualDemo: (
        <div className="mt-4 p-4 rounded-2xl bg-black/60 border border-emerald-500/30 text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Security & Privacy Controls
            </span>
            <span className="text-[10px] text-emerald-300 font-mono">SOC2 & HIPAA Compliant</span>
          </div>

          <div
            onClick={() => {
              setFaq4Encrypted(!faq4Encrypted);
              showToast(!faq4Encrypted ? '🔒 Enabled Encrypted TLS 1.3 Vault!' : '🛡️ Activated Zero-Retention On-Device Private Mode!');
            }}
            className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between cursor-pointer hover:border-emerald-500 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-emerald-400 animate-pulse" />
              <div>
                <span className="font-bold text-white block text-xs">
                  {faq4Encrypted ? 'TLS 1.3 Vault Encrypted' : 'Zero-Retention On-Device Local Mode'}
                </span>
                <span className="text-[10px] text-slate-400">Click to toggle security mode</span>
              </div>
            </div>
            <span className="px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
              ACTIVE
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      question: 'Can I export transcripts and AI summaries to Notion or PDF?',
      answer:
        'Yes! Export your complete lecture transcripts, AI meeting minutes, and speaker timelines directly into PDF, Notion, Word, or SRT subtitle formats in one click.',
      category: 'Exports & Cloud',
      visualDemo: (
        <div className="mt-4 p-4 rounded-2xl bg-black/60 border border-teal-500/30 text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-bold text-teal-400 flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" />
              One-Click Instant Export Engine
            </span>
            {faq5Exporting && <span className="text-teal-300 font-mono text-[10px]">{faq5ExportProgress}%</span>}
          </div>

          {faq5Exporting ? (
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden my-2">
              <div className="bg-teal-400 h-full transition-all duration-200" style={{ width: `${faq5ExportProgress}%` }} />
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {[
                { name: 'PDF', icon: Download },
                { name: 'Notion', icon: FileText },
                { name: 'SRT', icon: Share2 },
                { name: 'DOCX', icon: Download },
              ].map((fmt) => (
                <button
                  key={fmt.name}
                  onClick={() => triggerFaq5Export(fmt.name)}
                  className="py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-orange-500 hover:text-white font-bold text-xs text-orange-300 transition-all flex items-center justify-center gap-1"
                >
                  <fmt.icon className="w-3 h-3" />
                  <span>{fmt.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <section id="faq" className="py-24 relative overflow-hidden bg-[#080a0e] text-left">
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

      {/* Radial Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-orange-500/10 rounded-full blur-[180px] pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider mb-4 shadow-lg shadow-orange-950/40"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Interactive Answers & Demos</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight"
          >
            Frequently Asked <span className="text-orange-500">Questions</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-slate-400 text-base sm:text-lg"
          >
            Click any question to view live interactive solution demos and feature guides.
          </motion.p>
        </div>

        {/* ACCORDION LIST WITH LIVE ANIMATED SOLUTION DEMOS */}
        <div className="space-y-4">
          {faqData.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className={`rounded-3xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'bg-[#0e111a] border-orange-500/50 shadow-2xl shadow-orange-500/10'
                    : 'bg-[#0b0d14]/90 border-white/10 hover:border-white/20'
                }`}
              >
                {/* Question Header Button */}
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-6 sm:p-7 text-left flex items-center justify-between gap-4 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 ${
                      isOpen ? 'bg-orange-500 text-white' : 'bg-white/5 border border-white/10 text-slate-400'
                    }`}>
                      0{item.id}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                      {item.question}
                    </h3>
                  </div>

                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                    isOpen ? 'bg-orange-500/20 text-orange-400 rotate-180' : 'bg-white/5 text-slate-400'
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {/* Animated Accordion Body */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 pb-7 sm:px-7 text-slate-300 text-sm leading-relaxed border-t border-white/5 pt-4"
                    >
                      <p>{item.answer}</p>

                      {/* LIVE INTERACTIVE SOLUTION DEMO BOX */}
                      {item.visualDemo}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
