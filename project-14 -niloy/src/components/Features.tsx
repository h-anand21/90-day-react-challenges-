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
  RefreshCw,
} from 'lucide-react';

export const Features: React.FC = () => {
  // Card 2 Language rotation state
  const [currentLangIdx, setCurrentLangIdx] = useState(0);
  const languages = [
    { name: 'English', text: 'Real-time AI captioning', flag: '🇺🇸' },
    { name: 'Spanish', text: 'Subtítulos en tiempo real', flag: '🇪🇸' },
    { name: 'French', text: 'Sous-titres en temps réel', flag: '🇫🇷' },
    { name: 'Hindi', text: 'लाइव ट्रांसक्रिप्शन और अनुवाद', flag: '🇮🇳' },
    { name: 'Japanese', text: 'リアルタイムAI文字起こし', flag: '🇯🇵' },
  ];

  useEffect(() => {
    const langInterval = setInterval(() => {
      setCurrentLangIdx((prev) => (prev + 1) % languages.length);
    }, 2800);
    return () => clearInterval(langInterval);
  }, []);

  // Card 6 Export Simulation state
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const triggerExportSim = () => {
    setIsExporting(true);
    setDownloadProgress(0);
    let p = 0;
    const interval = setInterval(() => {
      p += 25;
      setDownloadProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setTimeout(() => setIsExporting(false), 2000);
      }
    }, 200);
  };

  const featureList = [
    {
      icon: Mic,
      title: 'Ultra-Low Latency Streaming',
      description:
        'Streams transcripts line-by-line in real time with under 50ms latency. Perfect for fast-paced lectures and live Q&A sessions.',
      badge: '99.4% Precision',
      customPreview: (
        <div className="p-3 rounded-xl bg-black/50 border border-orange-500/30 text-xs text-slate-200 font-mono space-y-1.5 shadow-inner">
          <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-white/10 pb-1">
            <span className="text-orange-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
              Live Feed
            </span>
            <span className="text-emerald-400">⚡ 42ms Latency</span>
          </div>
          <p className="text-[11px] text-slate-200 truncate">
            &gt; Transcribing speech stream in real time...
          </p>
        </div>
      ),
    },
    {
      icon: Globe,
      title: 'Live Multilingual Translation',
      description:
        'Instantly translate live spoken audio into 50+ target languages with custom domain terminology and speaker accents.',
      badge: '50+ Languages',
      customPreview: (
        <div className="p-3 rounded-xl bg-black/50 border border-blue-500/30 text-xs text-slate-200 font-sans shadow-inner">
          <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-white/10 pb-1 mb-1.5">
            <span className="text-blue-400 font-bold flex items-center gap-1">
              <span>{languages[currentLangIdx].flag}</span>
              <span>{languages[currentLangIdx].name}</span>
            </span>
            <span className="text-slate-400">Auto-Detect</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={currentLangIdx}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-[11px] text-orange-200 font-medium truncate"
            >
              "{languages[currentLangIdx].text}"
            </motion.p>
          </AnimatePresence>
        </div>
      ),
    },
    {
      icon: Sparkles,
      title: 'Automated AI Summaries',
      description:
        'Extract key takeaways, highlight action items, and generate structured meeting minutes automatically as soon as the session ends.',
      badge: 'GPT-4o Powered',
      customPreview: (
        <div className="p-3 rounded-xl bg-black/50 border border-purple-500/30 text-xs text-slate-200 space-y-1 shadow-inner">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-400">
            <Sparkles className="w-3 h-3 animate-spin" style={{ animationDuration: '4s' }} />
            <span>AI Key Takeaways</span>
          </div>
          <div className="space-y-1 text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-orange-400 shrink-0" />
              <span className="truncate">Key decisions & action points extracted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-orange-400 shrink-0" />
              <span className="truncate">Automated meeting minutes generated</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: Headphones,
      title: 'Universal Accessibility',
      description:
        'Designed specifically for deaf and hard-of-hearing individuals, ESL students, and neurodivergent learners.',
      badge: 'ADA Compliant',
      customPreview: (
        <div className="p-3 rounded-xl bg-black/50 border border-amber-500/30 text-xs text-slate-200 flex items-center justify-between shadow-inner">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-amber-400 block">High-Contrast Captions</span>
            <span className="text-[11px] text-slate-300">Deaf & Hard-of-Hearing Optimized</span>
          </div>
          <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-md text-[10px] font-mono text-orange-400">
            <span>A+ Font</span>
          </div>
        </div>
      ),
    },
    {
      icon: Shield,
      title: 'Zero Data Retention Option',
      description:
        'Your sensitive voice recordings are encrypted with military-grade TLS 1.3. We offer on-device local transcription modes.',
      badge: 'SOC2 & HIPAA',
      customPreview: (
        <div className="p-3 rounded-xl bg-black/50 border border-emerald-500/30 text-xs text-slate-200 flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400 animate-pulse" />
            <div className="text-left">
              <span className="text-[10px] font-bold text-emerald-400 block">TLS 1.3 Vault Encrypted</span>
              <span className="text-[10px] text-slate-400">Zero Local Audio Retention</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: FileCheck,
      title: 'Multi-Format Instant Exports',
      description:
        'Export audio notes, transcripts, and speaker timelines directly into Notion, Google Docs, PDF, and SRT subtitles.',
      badge: 'One-Click Sync',
      customPreview: (
        <div className="p-3 rounded-xl bg-black/50 border border-teal-500/30 text-xs text-slate-200 shadow-inner">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-teal-400">One-Click Multi Export</span>
            <button
              onClick={triggerExportSim}
              className="text-[10px] px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 font-semibold hover:bg-teal-500 hover:text-white transition-all flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              <span>{isExporting ? `${downloadProgress}%` : 'Test Export'}</span>
            </button>
          </div>

          {isExporting ? (
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden mt-1">
              <div
                className="bg-teal-400 h-full transition-all duration-200"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-orange-300">PDF</span>
              <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-emerald-300">Notion</span>
              <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-blue-300">SRT</span>
              <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-purple-300">DOCX</span>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <section id="features" className="py-24 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider mb-4 shadow-lg shadow-orange-950/40"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Next-Gen Audio AI Capabilities</span>
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

        {/* Feature Cards Grid with Staggered Framer Motion Animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureList.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="group relative rounded-3xl bg-[#0d0f17]/90 border border-white/10 p-8 hover:bg-[#121522] hover:border-orange-500/50 transition-all duration-300 shadow-2xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-md">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-orange-400 group-hover:border-orange-500/40 transition-colors">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-sm text-slate-400 leading-relaxed mb-6">
                    {item.description}
                  </p>

                  {/* Interactive Embedded Preview Box */}
                  <div className="mb-4">
                    {item.customPreview}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-orange-400 group-hover:translate-x-1 transition-transform">
                  <span>Learn more about {item.title.split(' ')[0]}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
