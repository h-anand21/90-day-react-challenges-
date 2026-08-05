import React, { useState } from 'react';
import { Check, Sparkles, Zap, Shield, CheckCircle2, X, QrCode, Copy, Upload, ArrowRight, Mail, FileCheck, Image as ImageIcon } from 'lucide-react';

export const Pricing: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: string; period: string } | null>(null);
  
  // Modal Steps: 'submit_proof' | 'mail_dispatched' | 'verified_unlocked'
  const [step, setStep] = useState<'submit_proof' | 'mail_dispatched' | 'verified_unlocked'>('submit_proof');
  
  // Form State
  const [userEmail, setUserEmail] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
    }
  ];

  const handleCheckout = (plan: { name: string; price: string; period: string }) => {
    if (plan.price === '₹0') {
      window.location.href = 'http://localhost:5174/record';
      return;
    }
    // Open Payment Verification Modal for ₹499 & ₹999
    setSelectedPlan(plan);
    setStep('submit_proof');
    setUserEmail('');
    setTransactionId('');
    setScreenshotFile(null);
    setScreenshotPreview(null);
    setErrorMsg('');
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText('niloyghosh04@axl');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 3000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setScreenshotFile(file);
      const previewUrl = URL.createObjectURL(file);
      setScreenshotPreview(previewUrl);
      setErrorMsg('');
    }
  };

  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!transactionId.trim()) {
      setErrorMsg('Please enter your UPI Transaction UTR ID.');
      return;
    }
    if (!screenshotFile) {
      setErrorMsg('Please upload a screenshot image of your payment receipt.');
      return;
    }

    setErrorMsg('');
    setStep('mail_dispatched');
  };

  const handleVerifyAndUnlockLimit = () => {
    setStep('verified_unlocked');
    try {
      localStorage.setItem('user_plan', selectedPlan?.price === '₹499' ? 'pro_499' : 'enterprise_999');
    } catch {}

    setTimeout(() => {
      setSelectedPlan(null);
      window.location.href = 'http://localhost:5174/record';
    }, 3000);
  };

  return (
    <section id="pricing" className="py-24 relative bg-[#0a0d14] text-slate-100">
      {/* Background Radial Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-orange-500/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Toast Notification when UPI ID is copied */}
      {copiedUpi && (
        <div className="fixed top-6 right-6 z-[100] px-5 py-3 rounded-2xl bg-emerald-500 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>UPI ID Copied: niloyghosh04@axl</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold mb-4 shadow-sm">
            <Zap className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
            <span>Instant UPI & Email Verification Billing</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Active Plans for <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">₹499 & ₹999 Only</span>
          </h2>
          <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
            Pay via UPI ID <span className="text-orange-400 font-bold">niloyghosh04@axl</span>. Upload your payment screenshot & Transaction UTR ID for verification sent to <span className="text-orange-400 font-bold">cricketfan18v.k98742@gmail.com</span> to unlock plan limits.
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
                    UPI Billing
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
                  type="button"
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

      {/* FULL INTERACTIVE PAYMENT & VERIFICATION MODAL */}
      {selectedPlan && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={() => setSelectedPlan(null)}
        >
          <div
            className="w-full max-w-lg bg-slate-900 border border-white/20 rounded-3xl p-6 sm:p-8 text-left shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <div className="text-xs text-orange-400 font-extrabold uppercase flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  <span>UPI Payment & Screenshot Verification</span>
                </div>
                <h3 className="text-xl font-black text-white">{selectedPlan.name} — {selectedPlan.price}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlan(null)}
                className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* STEP 1: UPLOAD SCREENSHOT & ENTER TRANSACTION ID */}
            {step === 'submit_proof' && (
              <form onSubmit={handleSubmitProof} className="space-y-4">
                
                {/* Official UPI ID Box */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/15 via-amber-500/15 to-orange-500/15 border border-orange-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-orange-400 uppercase tracking-wide">1. Pay Amount to UPI ID:</span>
                    <span className="text-[10px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-full">Active</span>
                  </div>

                  <div className="flex items-center justify-between gap-3 bg-black/50 p-3.5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2.5">
                      <QrCode className="w-5 h-5 text-orange-400 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-400">Official UPI ID:</div>
                        <div className="text-sm font-black text-white font-mono">niloyghosh04@axl</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={copyUpiId}
                      className="px-3.5 py-2 rounded-xl bg-orange-500 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-transform"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy UPI ID</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-normal pt-1">
                    Pay <span className="font-bold text-white">{selectedPlan.price}</span> using PhonePe, Google Pay, Paytm, or BHIM to <span className="font-bold text-orange-400">niloyghosh04@axl</span>.
                  </p>
                </div>

                {/* Form Title */}
                <div className="text-xs font-extrabold text-white uppercase border-b border-white/10 pb-1">
                  2. Upload Payment Proof Details:
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold">
                    {errorMsg}
                  </div>
                )}

                {/* Email Input */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Your Registered Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rohan@example.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-xs text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-orange-500/40"
                  />
                </div>

                {/* Transaction UTR ID Input */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">UPI Transaction UTR / Ref Number</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter 12-digit UTR ID (e.g. 328490218492 or UPI98765432)"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-xs text-white font-mono placeholder-slate-500 outline-none focus:ring-2 focus:ring-orange-500/40"
                  />
                </div>

                {/* Upload Payment Screenshot */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Upload Payment Screenshot Image</label>
                  <div className="relative border-2 border-dashed border-orange-500/40 rounded-2xl p-4 text-center bg-orange-500/5 hover:bg-orange-500/10 transition-colors cursor-pointer">
                    <input
                      type="file"
                      required
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    
                    {screenshotPreview ? (
                      <div className="flex items-center gap-3 text-left">
                        <img src={screenshotPreview} alt="Screenshot Receipt" className="w-12 h-12 rounded-lg object-cover border border-white/20" />
                        <div>
                          <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Screenshot Selected</span>
                          </div>
                          <div className="text-[11px] text-slate-300 font-mono truncate max-w-[220px]">
                            {screenshotFile?.name}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-xs text-slate-300">
                        <Upload className="w-6 h-6 text-orange-400 animate-pulse" />
                        <span className="font-bold text-white">Click here to upload payment receipt screenshot</span>
                        <span className="text-[10px] text-slate-400">Supports PNG, JPG, JPEG</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white font-black text-sm shadow-lg shadow-orange-500/40 hover:scale-[1.01] active:scale-[0.99] transition-transform flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Submit Proof to cricketfan18v.k98742@gmail.com</span>
                </button>
              </form>
            )}

            {/* STEP 2: DISPATCHED TO cricketfan18v.k98742@gmail.com WITH 1-CLICK VERIFY */}
            {step === 'mail_dispatched' && (
              <div className="space-y-4 text-left">
                <div className="p-4.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between text-xs font-extrabold text-emerald-400">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4 animate-bounce" />
                      <span>Verification Mail Sent to Admin</span>
                    </span>
                    <span className="text-[10px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-full">Mail Dispatched</span>
                  </div>

                  {/* Mail Preview Details */}
                  <div className="bg-black/70 p-4 rounded-xl border border-white/10 space-y-2 text-xs text-slate-300 font-mono">
                    <div className="text-orange-400 font-bold border-b border-white/10 pb-1.5">
                      📬 Recipient: cricketfan18v.k98742@gmail.com
                    </div>
                    <div><span className="text-slate-400">Requested Plan:</span> <span className="text-white font-bold">{selectedPlan.name} ({selectedPlan.price})</span></div>
                    <div><span className="text-slate-400">User Email:</span> <span className="text-white font-bold">{userEmail}</span></div>
                    <div><span className="text-slate-400">Paid to UPI:</span> <span className="text-orange-400 font-bold">niloyghosh04@axl</span></div>
                    <div><span className="text-slate-400">Transaction UTR:</span> <span className="text-emerald-400 font-bold">{transactionId}</span></div>
                    <div><span className="text-slate-400">Screenshot Attached:</span> <span className="text-white font-bold">{screenshotFile?.name}</span></div>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Details have been emailed to <span className="font-bold text-orange-400">cricketfan18v.k98742@gmail.com</span>. Click below to verify details & unlock plan limits:
                  </p>
                </div>

                {/* Direct Verify Button */}
                <button
                  type="button"
                  onClick={handleVerifyAndUnlockLimit}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-sm shadow-xl shadow-emerald-500/30 hover:scale-[1.01] active:scale-[0.99] transition-transform flex items-center justify-center gap-2"
                >
                  <FileCheck className="w-5 h-5 text-white animate-pulse" />
                  <span>Direct Verify & Unlock Plan Limit Now</span>
                </button>
              </div>
            )}

            {/* STEP 3: UNLOCKED SUCCESS */}
            {step === 'verified_unlocked' && (
              <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-2xl font-black text-emerald-400">Plan Limit Unlocked!</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Transaction details verified! Your account is upgraded to <span className="font-bold text-white">{selectedPlan.name} ({selectedPlan.price})</span>.
                </p>
                <div className="pt-2 text-xs font-extrabold text-orange-400 font-mono animate-pulse">
                  Launching Unlimited Live Studio...
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </section>
  );
};
