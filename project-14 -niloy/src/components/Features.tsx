import React from 'react';
import {
  Mic,
  Globe,
  Sparkles,
  Shield,
  FileCheck,
  Headphones,
  Zap,
  Layers,
  Cpu,
} from 'lucide-react';

export const Features: React.FC = () => {
  const featureList = [
    {
      icon: Mic,
      title: 'Ultra-Low Latency Streaming',
      description:
        'Streams transcripts line-by-line in real time with under 50ms latency. Perfect for fast-paced lectures and live Q&A sessions.',
      badge: '99.4% Precision',
    },
    {
      icon: Globe,
      title: 'Live Multilingual Translation',
      description:
        'Instantly translate live spoken audio into 50+ target languages with custom domain terminology and speaker accents.',
      badge: '50+ Languages',
    },
    {
      icon: Sparkles,
      title: 'Automated AI Summaries',
      description:
        'Extract key takeaways, highlight action items, and generate structured meeting minutes automatically as soon as the session ends.',
      badge: 'GPT-4o Powered',
    },
    {
      icon: Headphones,
      title: 'Universal Accessibility',
      description:
        'Designed specifically for deaf and hard-of-hearing individuals, ESL students, and neurodivergent learners.',
      badge: 'ADA Compliant',
    },
    {
      icon: Shield,
      title: 'Zero Data Retention Option',
      description:
        'Your sensitive voice recordings are encrypted with military-grade TLS 1.3. We offer on-device local transcription modes.',
      badge: 'SOC2 & HIPAA',
    },
    {
      icon: FileCheck,
      title: 'Multi-Format Instant Exports',
      description:
        'Export audio notes, transcripts, and speaker timelines directly into Notion, Google Docs, PDF, and SRT subtitles.',
      badge: 'One-Click Sync',
    },
  ];

  return (
    <section id="features" className="py-20 relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Zap className="w-3.5 h-3.5" />
            <span>Built for Modern Learning</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Supercharge Accessibility with <span className="text-orange-500">Next-Gen Audio AI</span>
          </h2>
          <p className="mt-4 text-slate-400 text-base sm:text-lg">
            Everything you need to turn live spoken words into structured knowledge, accessible captions, and instant notes.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureList.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                className="group relative rounded-2xl bg-white/[0.03] border border-white/10 p-8 hover:bg-white/[0.06] hover:border-orange-500/40 transition-all duration-300 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-sm text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-white/5 flex items-center text-xs font-semibold text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Learn more about {item.title.split(' ')[0]} →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
