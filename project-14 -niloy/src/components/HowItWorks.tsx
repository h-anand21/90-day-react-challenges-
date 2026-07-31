import React from 'react';
import { Mic, Cpu, CheckCircle2, ArrowRight } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Select Audio Input',
      desc: 'Connect your system mic for live lectures/meetings, or drop any recorded audio/video file.',
      icon: Mic,
    },
    {
      number: '02',
      title: 'AI Streams Live Captions',
      desc: 'Our neural model transcribes speech instantly, translates on the fly, and highlights key concepts.',
      icon: Cpu,
    },
    {
      number: '03',
      title: 'Export Notes & Summaries',
      desc: 'Access your cloud library, review automated action items, and export formatted notes with one click.',
      icon: CheckCircle2,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-b from-transparent via-orange-950/10 to-transparent relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-extrabold text-orange-400 tracking-widest">Simple Workflow</span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-2">
            How <span className="text-orange-500">ClarityStream</span> Works
          </h2>
          <p className="mt-3 text-slate-400 text-base sm:text-lg">
            Start transcribing and generating accessible audio notes in under 30 seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => {
            const IconComp = step.icon;
            return (
              <div
                key={idx}
                className="relative rounded-2xl bg-[#0e1118] border border-slate-800 p-8 shadow-xl hover:border-orange-500/50 transition-all group"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl font-black text-orange-500/30 group-hover:text-orange-500 transition-colors">
                    {step.number}
                  </span>
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                    <IconComp className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
