import React, { useState } from 'react';
import { Mic, Heart, Globe, Share2, MessageSquare, ArrowRight, CheckCircle2, X, Shield, Lock, FileText } from 'lucide-react';

export const Footer: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | 'soc2' | 'accessibility' | null>(null);

  const handleShare = () => {
    navigator.clipboard.writeText('http://localhost:5174/');
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const openChatbotOrContact = () => {
    const contactEl = document.getElementById('contact');
    if (contactEl) {
      contactEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#050608] border-t border-white/10 pt-16 pb-12 text-slate-400 text-sm relative">
      {/* Toast Notification when link is shared */}
      {copied && (
        <div className="fixed top-6 right-6 z-[100] px-5 py-3 rounded-2xl bg-emerald-500 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>ClarityStream AI Link Copied to Clipboard!</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Banner CTA inside footer */}
        <div className="relative rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 p-8 sm:p-12 mb-16 text-white overflow-hidden shadow-2xl shadow-orange-500/25">
          <div className="relative z-10 max-w-2xl text-left">
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
              Ready for Next-Level Live Audio Accessibility?
            </h3>
            <p className="text-orange-100 text-sm sm:text-base mb-6">
              Join thousands of students, researchers, and professionals transcribing with 99.4% AI accuracy.
            </p>
            <a
              href="http://localhost:5174/record"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-950 text-white font-bold text-sm hover:bg-slate-900 shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              <span>Start Live Session Now</span>
              <ArrowRight className="w-4 h-4 text-orange-400" />
            </a>
          </div>
          <div className="absolute right-[-40px] bottom-[-40px] opacity-20 pointer-events-none">
            <Mic className="w-72 h-72 text-white" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-white/10">
          
          {/* Brand & Active Social/Message Icons */}
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold">
                <Mic className="w-4 h-4" />
              </div>
              <span className="text-lg font-extrabold text-white">ClarityStream AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-Time AI Accessibility Assistant. Transcribe, translate, and summarize live audio in real-time.
            </p>

            {/* 3 FULLY ACTIVE FOOTER ACTION ICONS */}
            <div className="flex items-center gap-3 text-slate-400">
              {/* Globe Icon */}
              <button
                onClick={() => alert("Global Language Support: Active in English, Hindi, Spanish, French, German, Japanese + 20 languages.")}
                title="Global Language Settings"
                className="hover:text-orange-400 transition-colors p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10"
              >
                <Globe className="w-4 h-4 text-orange-400" />
              </button>

              {/* Share Icon */}
              <button
                onClick={handleShare}
                title="Share ClarityStream AI App Link"
                className="hover:text-orange-400 transition-colors p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10"
              >
                <Share2 className="w-4 h-4 text-orange-400" />
              </button>

              {/* Message / Contact Chat Icon */}
              <button
                onClick={openChatbotOrContact}
                title="Open 24/7 AI Contact Chat"
                className="hover:text-orange-400 transition-colors p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 relative"
              >
                <MessageSquare className="w-4 h-4 text-orange-400" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </button>
            </div>
          </div>

          {/* Product Links */}
          <div className="text-left">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="http://localhost:5174/record" className="hover:text-orange-400 transition-colors">Live Session Demo</a></li>
              <li><a href="http://localhost:5174/record" className="hover:text-orange-400 transition-colors">Speech-to-Text</a></li>
              <li><a href="http://localhost:5174/record" className="hover:text-orange-400 transition-colors">Live Translation</a></li>
              <li><a href="#pricing" className="hover:text-orange-400 transition-colors">Pricing Plans</a></li>
            </ul>
          </div>

          {/* Accessibility Links */}
          <div className="text-left">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Accessibility</h4>
            <ul className="space-y-2.5 text-xs">
              <li><button onClick={() => setActiveModal('accessibility')} className="hover:text-orange-400 transition-colors text-left">Deaf & Hard-of-Hearing</button></li>
              <li><a href="http://localhost:5174/record" className="hover:text-orange-400 transition-colors">Lecture Captions</a></li>
              <li><a href="http://localhost:5174/library" className="hover:text-orange-400 transition-colors">Meeting Notes</a></li>
              <li><button onClick={() => setActiveModal('accessibility')} className="hover:text-orange-400 transition-colors text-left">WCAG 2.1 AAA Standard</button></li>
            </ul>
          </div>

          {/* Legal & Privacy Links */}
          <div className="text-left">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Legal & Privacy</h4>
            <ul className="space-y-2.5 text-xs">
              <li><button onClick={() => setActiveModal('privacy')} className="hover:text-orange-400 transition-colors text-left">Privacy Policy</button></li>
              <li><button onClick={() => setActiveModal('terms')} className="hover:text-orange-400 transition-colors text-left">Terms of Service</button></li>
              <li><button onClick={() => setActiveModal('soc2')} className="hover:text-orange-400 transition-colors text-left">Data Encryption Vault</button></li>
              <li><button onClick={() => setActiveModal('soc2')} className="hover:text-orange-400 transition-colors text-left">SOC2 Compliance</button></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ClarityStream AI. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-orange-500 fill-orange-500" /> for accessible learning.
          </p>
        </div>
      </div>

      {/* Interactive Modal for Legal, Privacy, and Accessibility */}
      {activeModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setActiveModal(null)}>
          <div className="w-full max-w-lg bg-slate-900 border border-white/20 rounded-3xl p-6 sm:p-8 text-left shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg font-bold text-white uppercase">
                  {activeModal === 'privacy' && 'Privacy Policy'}
                  {activeModal === 'terms' && 'Terms of Service'}
                  {activeModal === 'soc2' && 'SOC2 & Encryption Vault'}
                  {activeModal === 'accessibility' && 'Accessibility Standard'}
                </h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-2 rounded-xl bg-white/10 text-white"><X className="w-4 h-4" /></button>
            </div>

            <div className="text-xs text-slate-300 space-y-3 leading-relaxed max-h-60 overflow-y-auto pr-2">
              {activeModal === 'privacy' && (
                <>
                  <p>ClarityStream AI is committed to protecting your voice data. All live audio streams are processed in real-time with zero raw audio storage.</p>
                  <p>End-to-end TLS 1.3 encryption guarantees that no unauthorized third party can inspect your lecture or meeting transcripts.</p>
                </>
              )}
              {activeModal === 'terms' && (
                <>
                  <p>By using ClarityStream AI, you agree to our fair usage terms for student and enterprise accounts.</p>
                  <p>You retain 100% ownership of your recorded sessions, notes, and multi-lingual transcripts.</p>
                </>
              )}
              {activeModal === 'soc2' && (
                <>
                  <p>Our platform maintains SOC2 Type II compliance and AES-256 data vault encryption at rest.</p>
                  <p>Enterprise keys are isolated using dedicated hardware security modules (HSM).</p>
                </>
              )}
              {activeModal === 'accessibility' && (
                <>
                  <p>ClarityStream AI complies fully with WCAG 2.1 AAA and ADA Section 508 accessibility guidelines.</p>
                  <p>Features include OpenDyslexic font support, high-contrast themes, custom text scaling, and haptic feedback alerts.</p>
                </>
              )}
            </div>

            <div className="pt-2 text-right">
              <button onClick={() => setActiveModal(null)} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs">
                Close Modal
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
