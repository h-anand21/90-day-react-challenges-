import React from "react";
import { CheckCircle2, Clock, Sparkles } from "lucide-react";

const quarters = [
  {
    quarter: "Q1 2026",
    status: "Completed",
    statusColor: "bg-emerald-100 text-emerald-700 border-emerald-300",
    icon: CheckCircle2,
    title: "Core Platform & 40-Tick Gauge Analytics",
    items: [
      "Real-time impressions & click tracking",
      "Custom gauge dashboard preview engine",
      "Multi-client team account management",
      "Initial media contact list CSV importer",
    ],
  },
  {
    quarter: "Q2 2026",
    status: "In Progress",
    statusColor: "bg-[#ef4d23]/10 text-[#ef4d23] border-[#ef4d23]/30",
    icon: Clock,
    title: "AI Pitching & Automated Outbox",
    items: [
      "Context-aware GPT-4o press release generator",
      "Automated follow-up sequence triggers",
      "Journalist open rate & reply sentiment tracking",
      "Integrations with Gmail & Outlook enterprise",
    ],
  },
  {
    quarter: "Q3 2026",
    status: "Upcoming",
    statusColor: "bg-neutral-100 text-neutral-600 border-neutral-300",
    icon: Sparkles,
    title: "Global Media DB & Crisis Radar",
    items: [
      "Direct API feed to 1M+ verified journalists",
      "Live broadcast audio & video clip transcription",
      "Crisis sentiment early warning alerts",
      "Custom white-labeled client reporting portal",
    ],
  },
  {
    quarter: "Q4 2026",
    status: "Vision",
    statusColor: "bg-purple-100 text-purple-700 border-purple-300",
    icon: Sparkles,
    title: "Predictive Virality Engine",
    items: [
      "Predictive virality scoring for headline variations",
      "Automated press release distribution network",
      "AI audio-to-text pitch generator for podcasts",
      "Global PR agency benchmarking index",
    ],
  },
];

export const Roadmap: React.FC = () => {
  return (
    <section id="roadmap" className="py-20 sm:py-28 px-4 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-2 bg-[#ef4d23]/10 text-[#ef4d23] text-xs font-semibold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
          Product Vision
        </span>
        <h2 className="mt-4 text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
          Our Roadmap for <span className="font-serif-italic font-normal text-[#ef4d23]">PR Innovation</span>
        </h2>
        <p className="mt-4 text-neutral-600 text-base sm:text-lg">
          We are continuously building features that give forward-thinking PR agencies an unfair advantage.
        </p>
      </div>

      <div className="mt-14 sm:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quarters.map((q, idx) => {
          const StatusIcon = q.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm flex flex-col justify-between hover:border-[#ef4d23]/50 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-slate-900">
                    {q.quarter}
                  </span>
                  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${q.statusColor}`}>
                    <StatusIcon className="w-3 h-3" />
                    {q.status}
                  </span>
                </div>

                <h3 className="mt-5 text-base font-bold text-slate-900 leading-snug">
                  {q.title}
                </h3>

                <ul className="mt-4 space-y-2.5">
                  {q.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-neutral-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ef4d23] mt-1 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-100 text-[11px] text-neutral-400 font-medium text-right">
                Milestone {idx + 1} of 4
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
