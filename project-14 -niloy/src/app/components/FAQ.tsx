import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqData = [
  {
    q: "What makes Convix specifically built for PR agencies?",
    a: "Unlike generic CRM or social media tools, Convix is tailored for PR workflows—combining media list management, beat-specific AI pitching, real-time earned coverage tracking, and client ROI reporting in one unified platform.",
  },
  {
    q: "Can I import my agency's existing media contact databases?",
    a: "Yes! Convix accepts CSV/XLSX imports for journalists, publications, and client rosters. Our AI deduplicates contacts and enriches them with recent article links automatically.",
  },
  {
    q: "How does the custom 40-tick Gauge dashboard work?",
    a: "The dashboard preview measures client targets (such as impressions, article hits, and video starts) against set monthly or annual goals, displaying real-time completion percentages and comparative metrics.",
  },
  {
    q: "Is there a limit on how many clients or team members I can add?",
    a: "Convix is built for scale. Our Agency tier supports unlimited client brand profiles, team seat permissions, and custom white-labeled reporting portals.",
  },
  {
    q: "How can my agency gain Early Access to Convix Software?",
    a: "Simply click the 'Get early access' button in the header or footer to reserve your agency's slot. Our onboarding team will contact you within 24 hours to initiate your setup.",
  },
];

export const FAQ: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 sm:py-28 bg-[#f5f2ee] border-t border-neutral-200">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 bg-[#0b0f1a] text-white text-xs font-semibold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
            Got Questions?
          </span>
          <h2 className="mt-4 text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
            Frequently Asked <span className="font-serif-italic font-normal text-[#ef4d23]">Questions</span>
          </h2>
          <p className="mt-4 text-neutral-600 text-base sm:text-lg">
            Everything you need to know about Convix Software for PR agencies.
          </p>
        </div>

        <div className="mt-12 sm:mt-16 space-y-4">
          {faqData.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-5 sm:p-6 text-left flex justify-between items-center gap-4 hover:bg-neutral-50/50 transition-colors"
                >
                  <span className="text-base sm:text-lg font-bold text-slate-900">
                    {item.q}
                  </span>
                  <span className="w-8 h-8 rounded-full bg-neutral-100 grid place-items-center shrink-0 text-[#ef4d23]">
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-0 text-neutral-600 text-sm sm:text-base leading-relaxed border-t border-neutral-100/60 animate-in fade-in duration-200">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
