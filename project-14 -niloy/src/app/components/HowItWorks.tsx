import React from "react";
import { Link2, Sparkles, Send, Award } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Link2,
    title: "Connect Outlets & Clients",
    desc: "Import your existing client roster, media contact lists, and target industry beats into Convix's centralized database.",
  },
  {
    step: "02",
    icon: Sparkles,
    title: "Craft AI-Personalized Pitches",
    desc: "Use context-aware AI to tailor pitches to each reporter's recent coverage history and personal writing style.",
  },
  {
    step: "03",
    icon: Send,
    title: "Automate Distribution & Follow-ups",
    desc: "Schedule pitch delivery at optimal journalist opening hours and trigger smart non-intrusive follow-up sequences.",
  },
  {
    step: "04",
    icon: Award,
    title: "Measure Impact & Showcase ROI",
    desc: "Track coverage live as hits land, calculate dollar-value earned media impact, and auto-export client reports.",
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-[#f5f2ee] border-y border-neutral-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 bg-[#0b0f1a] text-white text-xs font-semibold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
            Simple 4-Step Process
          </span>
          <h2 className="mt-4 text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
            How Convix accelerates <span className="font-serif-italic font-normal text-[#ef4d23]">agency results</span>
          </h2>
          <p className="mt-4 text-neutral-600 text-base sm:text-lg">
            From initial campaign brief to executive board report, Convix streamlines every phase of your PR agency's workflow.
          </p>
        </div>

        <div className="mt-14 sm:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-sm relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-extrabold text-[#ef4d23]/20 font-mono">
                      {s.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 text-[#0b0f1a] grid place-items-center">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="mt-6 text-lg font-bold text-slate-900 leading-snug">
                    {s.title}
                  </h3>
                  <p className="mt-3 text-neutral-600 text-xs sm:text-sm leading-relaxed">
                    {s.desc}
                  </p>
                </div>
                <div className="mt-6 w-full h-1 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#ef4d23] rounded-full"
                    style={{ width: `${(idx + 1) * 25}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
