import React, { useState } from 'react';
import { Check, Sparkles, Zap, Shield, CheckCircle2, X, CreditCard, QrCode, ArrowRight } from 'lucide-react';

export const Pricing: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: string; period: string } | null>(null);
  const [paymentStep, setPaymentStep] = useState<'method' | 'success'>('method');
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'gpay' | 'card'>('upi');

  const plans = [
    {
      name: 'Starter Plan',
      price: '₹0',
      period: 'free forever',
      description: 'Ideal for trying out real-time audio captioning and small meeting summaries.',
      features: [
        '100 minutes of Live Streaming / month',
        'Standard Speech-to-Text Model',
        'Export to TXT & Markdown',
        'Real-time Audio Visualizer',
        'Local Browser Storage'
      ],
      cta: 'Get Started Free',
      popular: false,
      accent: 'border-white/10'
    },
    {
      name: 'Pro Learner',
      price: '₹499',
      period: 'per month',
      description: 'Full real-time accessibility assistant for students, educators & active learners.',
      features: [
        'Unlimited Live Sessions & Captions',
        'Real-time Multilingual Translation (20+ Languages)',
        'Automated AI Summaries & Key Takeaways',
        'Cloud Library & Search across all sessions',
        'Export to Notion, PDF, Word & SRT Subtitles',
        'Priority < 50ms Streaming Latency'
      ],
      cta: 'Upgrade for ₹499/mo',
      popular: true,
      accent: 'border-orange-500 shadow-2xl shadow-orange-500/30'
    },
    {
      name: 'Enterprise Suite',
      price: '₹999',
      period: 'per month',
      description: 'Complete AI audio suite for universities, corporate teams & high-compliance orgs.',
      features: [
        'Everything in Pro Learner Plan',
        'Offline On-Device Whisper Model (100% Private)',
        'Multi-Speaker Diarization & Speaker Identification',
        'SOC2 & HIPAA Compliant Data Encryption Vault',
        'Dedicated 24/7 Support Manager & Priority SLA',
        'Custom University Glossary & Terminology'
      ],
      cta: 'Get Enterprise ₹999/mo',
      popular: false,
      accent: 'border-emerald-500/50 shadow-xl shadow-emerald-500/10'
    }
  ];

  const handleCheckout = (plan: { name: string; price: string; period: string }) => {
    if (plan.price === '₹0') {
      window.location.href = 'http://localhost:5174/record';
      return;
    }
    setSelectedPlan(plan);
    setPaymentStep('method');
  };

  const handleCompletePayment = () => {
    setPaymentStep('success');
    setTimeout(() => {
      setSelectedPlan(null);
      window.location.href = 'http://localhost:5174/record';
    }, 3000);
  };

  return (
    <section id="pricing" className="py-24 relative bg-[#0a0d14] text-slate-100">
      {/* Ambient Radial Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-orange-500/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold mb-4 shadow-sm">
            <Zap className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
            <span>Simple Indian Rupee Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Active Plans for <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">₹499 & ₹999 Only</span>
          </h2>
          <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
            Choose the plan that fits your live transcription, multi-language translation, and AI summary needs. No hidden charges.
          </p>
        </div>

        {/* 3 Active Rupee Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                plan.popular
                  ? 'bg-gradient-to-b from-[#191d29] to-[#0e1118] border-2 border-orange-500 shadow-2xl shadow-orange-500/30 scale-105 z-10'
                  : 'bg-slate-900/80 border border-white/15 hover:border-white/30 backdrop-blur-xl'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-xs tracking-wider uppercase shadow-lg shadow-orange-500/40 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Most Popular Plan</span>
                </div>
              )}

              <div className="text-left">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-black text-white">{plan.name}</h3>
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-white/10 text-orange-400 border border-white/10 uppercase">
                    INR Billing
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-6">{plan.description}</p>

                <div className="flex items-baseline gap-2 mb-6 pb-6 border-b border-white/10">
                  <span className="text-4xl sm:text-5xl font-black text-white">{plan.price}</span>
                  <span className="text-xs font-semibold text-slate-400">{plan.period}</span>
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

              <div>
                <button
                  onClick={() => handleCheckout(plan)}
                  className={`w-full py-4 rounded-2xl font-extrabold text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98]'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  }`}
                >
                  <span>{plan.cta}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Interactive Payment Gateway Simulator Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setSelectedPlan(null)}>
          <div className="w-full max-w-md bg-slate-900 border border-white/20 rounded-3xl p-6 sm:p-8 text-left shadow-2xl space-y-6" onClick={(e) => e.stopPropagation()}>
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <div className="text-xs text-orange-400 font-extrabold uppercase">Checkout Gateway</div>
                <h3 className="text-xl font-black text-white">{selectedPlan.name} — {selectedPlan.price}</h3>
              </div>
              <button onClick={() => setSelectedPlan(null)} className="p-2 rounded-xl bg-white/10 text-white"><X className="w-4 h-4" /></button>
            </div>

            {paymentStep === 'method' ? (
              <div className="space-y-4">
                <div className="text-xs text-slate-400">Select Instant Payment Option (India UPI / Cards):</div>

                <div className="space-y-2.5">
                  <button
                    onClick={() => setSelectedMethod('upi')}
                    className={`w-full p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs font-bold transition-all ${
                      selectedMethod === 'upi' ? 'bg-orange-500/20 border-orange-500 text-white' : 'bg-white/5 border-white/10 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <QrCode className="w-5 h-5 text-orange-400" />
                      <span>UPI / Google Pay / PhonePe / Paytm</span>
                    </div>
                    <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold">Instant</span>
                  </button>

                  <button
                    onClick={() => setSelectedMethod('card')}
                    className={`w-full p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs font-bold transition-all ${
                      selectedMethod === 'card' ? 'bg-orange-500/20 border-orange-500 text-white' : 'bg-white/5 border-white/10 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-orange-400" />
                      <span>Credit / Debit Card / NetBanking</span>
                    </div>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-1">
                  <div className="flex justify-between text-slate-400"><span>Plan Amount:</span><span className="text-white font-bold">{selectedPlan.price}</span></div>
                  <div className="flex justify-between text-slate-400"><span>Taxes & GST:</span><span className="text-emerald-400 font-bold">₹0 (Included)</span></div>
                  <div className="flex justify-between text-white font-extrabold pt-2 border-t border-white/10"><span>Total Payable:</span><span className="text-orange-400 text-base">{selectedPlan.price}</span></div>
                </div>

                <button
                  onClick={handleCompletePayment}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-sm shadow-lg shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  <span>Pay {selectedPlan.price} & Activate Instantly</span>
                </button>
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-xl font-extrabold text-emerald-400">Payment Successful!</h4>
                <p className="text-xs text-slate-300">
                  Your <span className="font-bold text-white">{selectedPlan.name} ({selectedPlan.price})</span> has been activated! Launching Live Studio...
                </p>
              </div>
            )}

          </div>
        </div>
      )}
    </section>
  );
};
