import React from 'react';
import { Mic, Heart, Globe, Share2, MessageSquare, ArrowRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#050608] border-t border-white/10 pt-16 pb-12 text-slate-400 text-sm relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Banner CTA inside footer */}
        <div className="relative rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 p-8 sm:p-12 mb-16 text-white overflow-hidden shadow-2xl shadow-orange-500/25">
          <div className="relative z-10 max-w-2xl">
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
              Ready for Next-Level Live Audio Accessibility?
            </h3>
            <p className="text-orange-100 text-sm sm:text-base mb-6">
              Join thousands of students, researchers, and professionals transcribing with 99.4% AI accuracy.
            </p>
            <a
              href="#demo"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-950 text-white font-bold text-sm hover:bg-slate-900 shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              <span>Start Free Trial Now</span>
              <ArrowRight className="w-4 h-4 text-orange-400" />
            </a>
          </div>
          <div className="absolute right-[-40px] bottom-[-40px] opacity-20 pointer-events-none">
            <Mic className="w-72 h-72 text-white" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-white/10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold">
                <Mic className="w-4 h-4" />
              </div>
              <span className="text-lg font-extrabold text-white">ClarityStream AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-Time AI Accessibility Assistant. Transcribe, translate, and summarize live audio in real-time.
            </p>
            <div className="flex items-center gap-3 text-slate-400">
              <a href="#" className="hover:text-orange-400 transition-colors p-2 rounded-lg bg-white/5"><Globe className="w-4 h-4" /></a>
              <a href="#" className="hover:text-orange-400 transition-colors p-2 rounded-lg bg-white/5"><Share2 className="w-4 h-4" /></a>
              <a href="#" className="hover:text-orange-400 transition-colors p-2 rounded-lg bg-white/5"><MessageSquare className="w-4 h-4" /></a>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#demo" className="hover:text-orange-400 transition-colors">Live Session Demo</a></li>
              <li><a href="#features" className="hover:text-orange-400 transition-colors">Speech-to-Text</a></li>
              <li><a href="#features" className="hover:text-orange-400 transition-colors">Live Translation</a></li>
              <li><a href="#pricing" className="hover:text-orange-400 transition-colors">Pricing Plans</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Accessibility</h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#" className="hover:text-orange-400 transition-colors">Deaf & Hard-of-Hearing</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Lecture Captions</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Meeting Notes</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">WCAG 2.1 AAA Standard</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Legal & Privacy</h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#" className="hover:text-orange-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Data Encryption Vault</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">SOC2 Compliance</a></li>
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
    </footer>
  );
};
