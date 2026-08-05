import React, { useState } from 'react';
import { GraduationCap, School, Building2, HeartHandshake, CheckCircle2, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';
import { getRecordUrl } from '@/config/urls';

const SOLUTIONS = [
  {
    id: 'students',
    icon: GraduationCap,
    title: 'For Students & Learners',
    badge: 'Higher Education',
    gradient: 'from-orange-500 to-amber-500',
    description: 'Capture every lecture word with zero lag. Get automatic multi-lingual transcripts, AI bullet summaries, and Notion exports.',
    features: [
      'Real-Time Closed Captioning under 50ms latency',
      'Automated Lecture Summaries & Flashcards',
      'Multi-Language Translation (Hindi, Spanish, French + 20 more)',
      '1-Click Export to PDF, Notion, and Markdown'
    ],
    stats: '99.4% Transcription Precision'
  },
  {
    id: 'educators',
    icon: School,
    title: 'For Educators & Universities',
    badge: 'Classroom & Hybrid',
    gradient: 'from-emerald-500 to-teal-500',
    description: 'Empower inclusive learning environments. Provide live captions for hard-of-hearing students and automatic lesson archives.',
    features: [
      'ADA & Section 508 Accessibility Compliance',
      'Live Classroom Projector Caption Stream',
      'Automated Attendance & Discussion Analytics',
      'LMS Integration (Canvas, Blackboard, Moodle)'
    ],
    stats: '100% WCAG 2.1 AA Compliant'
  },
  {
    id: 'enterprise',
    icon: Building2,
    title: 'For Enterprise & Meetings',
    badge: 'Corporate & Teams',
    gradient: 'from-blue-500 to-indigo-500',
    description: 'Streamline board meetings, Zoom calls, and international team syncs with real-time translation and action item tracking.',
    features: [
      'Zero-Retention Local VAD Processing',
      'TLS 1.3 Encryption & Enterprise Vault',
      'Automatic Meeting Minutes & Action Items',
      'Zoom, Microsoft Teams & Google Meet Bots'
    ],
    stats: 'SOC2 Type II Certified'
  },
  {
    id: 'accessibility',
    icon: HeartHandshake,
    title: 'For Deaf & Hard of Hearing',
    badge: 'Universal Design',
    gradient: 'from-purple-500 to-pink-500',
    description: 'Break communication barriers with high-contrast customizable captions, haptic alerts, and dyslexia-friendly font overlays.',
    features: [
      'Custom Font Sizes & High-Contrast Modes',
      'Dyslexic Font & OpenDyslexic Overlay',
      'Real-Time Speaker Identification & Diarization',
      'Offline Mic Streaming Mode'
    ],
    stats: 'Universal Accessibility'
  }
];

export const Solutions: React.FC = () => {
  const [activeId, setActiveId] = useState('students');
  const activeSolution = SOLUTIONS.find((s) => s.id === activeId) || SOLUTIONS[0];

  return (
    <section id="solutions" className="py-24 relative overflow-hidden bg-[#0a0d14] text-slate-100">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
            <span>Tailored Industry Solutions</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Designed for <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">Every Learner & Leader</span>
          </h2>
          <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
            Whether you are a university student, educator, or enterprise team, ClarityStream AI provides specialized tools tailored to your exact workflow.
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {SOLUTIONS.map((sol) => {
            const Icon = sol.icon;
            const active = sol.id === activeId;
            return (
              <button
                key={sol.id}
                onClick={() => setActiveId(sol.id)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                  active
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30 scale-105 border border-orange-400/40'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-orange-400'}`} />
                <span>{sol.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Solution Feature Box */}
        <div className="rounded-3xl border border-white/15 bg-slate-900/80 p-8 sm:p-12 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-orange-400 text-xs font-bold">
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>{activeSolution.badge}</span>
              </div>

              <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                {activeSolution.title}
              </h3>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {activeSolution.description}
              </p>

              <div className="space-y-3 pt-2">
                {activeSolution.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <a
                  href={getRecordUrl()}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange-500/30 hover:scale-105 transition-transform"
                >
                  <span>Try Solution in Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-400 text-xs font-semibold">
                  <Shield className="w-3.5 h-3.5 text-orange-400" />
                  <span>{activeSolution.stats}</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Card Preview Graphic */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-2xl bg-black/60 border border-white/15 p-6 shadow-inner text-left space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs font-bold text-orange-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Live Studio Engine</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">50ms Latency</span>
                </div>

                <div className="space-y-2 font-mono text-xs text-slate-300 leading-relaxed">
                  <p className="text-orange-300 font-bold">🎙️ Voice Input Stream:</p>
                  <p className="bg-white/5 p-3 rounded-xl border border-white/10 text-slate-200">
                    &ldquo;Welcome to ClarityStream AI — real-time lecture captions with zero audio delay.&rdquo;
                  </p>
                  <p className="text-emerald-400 font-bold pt-2">🇮🇳 Live Translation:</p>
                  <p className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-500/30 text-emerald-200">
                    &ldquo;ClarityStream AI में आपका स्वागत है — बिना किसी देरी के रियल-टाइम व्याख्यान कैप्शन।&rdquo;
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
