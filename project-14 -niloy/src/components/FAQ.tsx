import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How accurate is the real-time AI audio transcription?',
      a: 'ClarityStream achieves up to 99.4% speech accuracy by leveraging state-of-the-art neural speech recognition models. It handles background noise, technical jargon, and multi-speaker conversations with ease.',
    },
    {
      q: 'Can I use ClarityStream for live lectures and online meetings?',
      a: 'Yes! ClarityStream captures both system audio (Zoom, Teams, Google Meet) and direct microphone input to provide live closed captions, real-time translations, and instant meeting notes.',
    },
    {
      q: 'Does it support multi-language live translation?',
      a: 'Absolutely. ClarityStream can translate live speech into 50+ languages simultaneously, allowing non-native speakers or global participants to follow along with live subtitles.',
    },
    {
      q: 'Is my audio data private and secure?',
      a: 'Data privacy is our top priority. Transcripts are encrypted end-to-end using TLS 1.3. We also offer local on-device transcription modes where no audio ever leaves your computer.',
    },
    {
      q: 'Can I export transcripts and AI summaries to Notion or PDF?',
      a: 'Yes! You can export your formatted notes, bullet point summaries, and full timestamped transcripts to PDF, TXT, SRT (subtitles), and directly sync to Notion.',
    },
  ];

  return (
    <section id="faq" className="py-20 bg-[#080a0e] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Frequently Asked <span className="text-orange-500">Questions</span>
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-white text-base hover:text-orange-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-orange-400 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-4">
                    {faq.a}
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
