import React from 'react';
import { Milestone, CheckCircle2, Clock, Sparkles, Cpu, Bot, Zap, Globe, Shield } from 'lucide-react';

const ROADMAP_QUARTERS = [
  {
    quarter: 'Q1 2026',
    status: 'Completed',
    statusBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    title: 'Ultra-Low Latency Engine',
    icon: Zap,
    points: [
      'Sub-50ms real-time audio transcription',
      'Dual Web Speech API & Gemini STT fusion',
      'Multi-language translation for 20+ BCP-47 languages',
      'Dyslexic font overlay & WCAG 2.1 AA accessibility'
    ]
  },
  {
    quarter: 'Q2 2026',
    status: 'In Active Progress',
    statusBg: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    title: 'Offline On-Device VAD Model',
    icon: Cpu,
    points: [
      '100% offline WebAssembly Whisper STT model',
      'Multi-speaker diarization (Speaker A, Speaker B identification)',
      'Custom enterprise glossary & terminology dictionary',
      'Automatic action items & flashcard generator'
    ]
  },
  {
    quarter: 'Q3 2026',
    status: 'Upcoming',
    statusBg: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    title: 'Live Meeting Bot Integration',
    icon: Bot,
    points: [
      'Direct Zoom, Microsoft Teams & Google Meet bot join',
      'Real-time lecture hall projector captions mode',
      'Notion, Obsidian, and Slack automated sync',
      'Haptic feedback alerts for hard-of-hearing users'
    ]
  },
  {
    quarter: 'Q4 2026',
    status: 'Planned',
    statusBg: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    title: 'Neural Voice Dubbing',
    icon: Globe,
    points: [
      'Real-time spoken translation with voice cloning',
      'Multi-modal video transcript indexing',
      'Enterprise SSO & SOC2 Type II compliance vault',
      'Developer API & Custom Webhooks SDK'
    ]
  }
];

export const Roadmap: React.FC = () => {
  return (
    <section id="roadmap" className="py-24 bg-[#090b10] text-slate-100 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 right-10 w-96 h-96 bg-orange-500/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold mb-4 shadow-sm">
            <Milestone className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
            <span>Product Innovation Timeline</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            ClarityStream AI <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">Roadmap 2026</span>
          </h2>
          <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
            Our vision for the future of accessible real-time speech AI. Track our feature rollout, model upgrades, and upcoming integrations.
          </p>
        </div>

        {/* 4-Quarter Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ROADMAP_QUARTERS.map((q, idx) => {
            const Icon = q.icon;
            return (
              <div
                key={idx}
                className="rounded-3xl border border-white/15 bg-slate-900/80 p-6 flex flex-col justify-between hover:border-orange-500/40 transition-all hover:-translate-y-1.5 shadow-xl backdrop-blur-md"
              >
                <div>
                  {/* Top Quarter Pill & Status */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-lg font-black text-white">{q.quarter}</span>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${q.statusBg}`}>
                      {q.status}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-white text-left leading-snug">{q.title}</h3>
                  </div>

                  {/* Points */}
                  <div className="space-y-2.5 text-left border-t border-white/10 pt-4">
                    {q.points.map((pt, pIdx) => (
                      <div key={pIdx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                        <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Milestone Stage 0{idx + 1}</span>
                  <span className="text-orange-400 font-bold">2026 Vision</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
