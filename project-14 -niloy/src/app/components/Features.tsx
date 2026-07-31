import React from "react";
import { Zap, Radio, Bot, BarChart3, Users, ShieldAlert } from "lucide-react";

const featureList = [
  {
    icon: Bot,
    title: "AI Pitch & Press Release Generator",
    desc: "Generate highly tailored press releases, executive quotes, and pitch emails customized to individual journalist beats in seconds.",
    tag: "AI Powered",
  },
  {
    icon: Radio,
    title: "Real-Time Media Coverage Tracker",
    desc: "Monitor global web, print, and broadcast channels live. Receive instant alerts the moment your clients are cited.",
    tag: "Live Stream",
  },
  {
    icon: Users,
    title: "Smart Journalist & Outlet CRM",
    desc: "Track media relations, historical pitch responses, preferred communication channels, and relationship health metrics.",
    tag: "Media Database",
  },
  {
    icon: BarChart3,
    title: "PR ROI & Valuation Engine",
    desc: "Convert earned media coverage into executive-ready metrics: estimated impressions, domain authority, and dollar-equivalent impact.",
    tag: "Analytics",
  },
  {
    icon: ShieldAlert,
    title: "Crisis Sentiment Early Warning",
    desc: "Proactively detect negative narrative shifts and social sentiment surges before they turn into full-scale PR crises.",
    tag: "Risk Prevention",
  },
  {
    icon: Zap,
    title: "Automated Client Reporting",
    desc: "Generate white-labeled executive pitch decks and PDF media coverage books in one click to prove agency value.",
    tag: "Automated",
  },
];

export const Features: React.FC = () => {
  return (
    <section id="features" className="py-20 sm:py-28 px-4 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-2 bg-[#ef4d23]/10 text-[#ef4d23] text-xs font-semibold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ef4d23]" />
          Platform Capabilities
        </span>
        <h2 className="mt-4 text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
          Everything your PR Agency needs to <span className="font-serif-italic font-normal text-[#ef4d23]">dominate media</span>
        </h2>
        <p className="mt-4 text-neutral-600 text-base sm:text-lg">
          Ditch fragmented spreadsheets and manual press tracking. Convix unifies pitching, monitoring, and client reporting under one intuitive roof.
        </p>
      </div>

      <div className="mt-14 sm:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {featureList.map((f, idx) => {
          const Icon = f.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-3xl p-7 border border-neutral-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-2xl bg-[#ef4d23]/10 text-[#ef4d23] grid place-items-center group-hover:bg-[#ef4d23] group-hover:text-white transition-colors duration-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full">
                    {f.tag}
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-bold text-slate-900 group-hover:text-[#ef4d23] transition-colors">
                  {f.title}
                </h3>
                <p className="mt-3 text-neutral-600 text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center text-xs font-semibold text-[#ef4d23] group-hover:gap-2 transition-all">
                Learn more &rarr;
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
