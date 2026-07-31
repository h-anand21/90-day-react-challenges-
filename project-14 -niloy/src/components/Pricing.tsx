import React from 'react';
import { Check, Sparkles, Zap } from 'lucide-react';

export const Pricing: React.FC = () => {
  const plans = [
    {
      name: 'Free Starter',
      price: '$0',
      period: 'forever',
      description: 'Ideal for trying out real-time audio captioning and small meeting summaries.',
      features: [
        '100 minutes of Live Streaming / month',
        'Standard Speech-to-Text Model',
        'Export to TXT & Markdown',
        'Real-time Audio Visualizer',
        'Local Browser Storage',
      ],
      cta: 'Get Started Free',
      popular: false,
    },
    {
      name: 'Pro Accessibility',
      price: '$19',
      period: 'per month',
      description: 'Full real-time accessibility assistant for students, educators & professionals.',
      features: [
        'Unlimited Live Sessions',
        'Real-time Multilingual Translation (50+ Languages)',
        'Automated AI Summaries & Key Takeaways',
        'Cloud Library & Search across all sessions',
        'Export to Notion, PDF, Word & SRT Subtitles',
        'Priority < 50ms Streaming Latency',
      ],
      cta: 'Start Pro Free Trial',
      popular: true,
    },
    {
      name: 'Enterprise / Team',
      price: 'Custom',
      period: 'tailored billing',
      description: 'Custom deployment for universities, enterprises & high-compliance orgs.',
      features: [
        'Everything in Pro Plan',
        'Dedicated Local On-Premise GPU Inference',
        'SOC2 & HIPAA Compliant Data Vault',
        'Custom Supabase / Cloud Database Integration',
        'Dedicated 24/7 Support Manager & SLA',
        'Single Sign-On (SSO / SAML)',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-extrabold text-orange-400 tracking-widest">Flexible Pricing</span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-2">
            Plans for Every <span className="text-orange-500">Learner & Team</span>
          </h2>
          <p className="mt-3 text-slate-400 text-base sm:text-lg">
            Choose the plan that fits your live transcription and accessibility needs. No hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                plan.popular
                  ? 'bg-gradient-to-b from-[#191d29] to-[#0e1118] border-2 border-orange-500 shadow-2xl shadow-orange-500/20 scale-105 z-10'
                  : 'bg-[#0d0f15] border border-white/10 hover:border-white/20'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-xs tracking-wider uppercase shadow-lg shadow-orange-500/40 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Most Popular</span>
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-xs text-slate-400 mb-6">{plan.description}</p>

                <div className="flex items-baseline gap-2 mb-6 pb-6 border-b border-white/10">
                  <span className="text-4xl sm:text-5xl font-black text-white">{plan.price}</span>
                  <span className="text-xs font-medium text-slate-400">{plan.period}</span>
                </div>

                <ul className="space-y-3.5 mb-8">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                      <div className="w-4 h-4 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href="#demo"
                className={`w-full py-3.5 rounded-xl font-bold text-sm text-center transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
