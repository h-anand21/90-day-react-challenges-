import React from "react";
import { ChevronRight } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0b0f1a] text-white pt-20 pb-12 px-4 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto">
        
        {/* Early Access Banner */}
        <div id="early-access" className="bg-gradient-to-r from-[#ef4d23] to-[#d93f17] rounded-3xl p-8 sm:p-14 mb-16 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="max-w-2xl text-center md:text-left z-10">
            <span className="inline-block text-xs uppercase font-bold tracking-widest bg-white/20 text-white px-3 py-1 rounded-full mb-4">
              Limited Agency Slots
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
              Ready to transform your PR agency's results?
            </h2>
            <p className="mt-3 text-white/90 text-sm sm:text-base">
              Get early access to Convix Software and start measuring, pitching, and reporting with precision today.
            </p>
          </div>
          
          <div className="w-full md:w-auto shrink-0 z-10 flex flex-col sm:flex-row items-center gap-3">
            <input
              type="email"
              placeholder="Enter your agency email"
              className="w-full sm:w-72 bg-white/10 border border-white/20 rounded-full px-5 py-3 text-sm text-white placeholder:text-white/60 focus:outline-none focus:bg-white/20"
            />
            <button className="w-full sm:w-auto bg-white text-[#0b0f1a] hover:bg-neutral-100 font-bold rounded-full px-7 py-3 text-sm flex items-center justify-center gap-2 transition-all shadow-lg hover:scale-105 shrink-0">
              Get Early Access
              <ChevronRight className="w-4 h-4 text-[#ef4d23]" />
            </button>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-neutral-800 text-sm">
          <div className="md:col-span-2">
            <a href="#" className="flex items-center gap-2 group">
              <svg viewBox="0 0 32 32" className="w-7 h-7" fill="#ef4d23">
                <circle cx="16" cy="16" r="3.5" />
                {Array.from({ length: 8 }).map((_, i) => {
                  const angle = (i * Math.PI) / 4;
                  return <circle key={i} cx={16 + 10 * Math.cos(angle)} cy={16 + 10 * Math.sin(angle)} r="3.5" />;
                })}
              </svg>
              <span className="font-bold text-xl text-white tracking-tight">Convix Software</span>
            </a>
            <p className="mt-4 text-neutral-400 text-xs sm:text-sm max-w-sm leading-relaxed">
              The All-In-One PR Agency platform for modern media relations, real-time campaign analytics, and executive client reporting.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Systems Operational (v1.4.0)</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2.5 text-neutral-400 text-xs sm:text-sm">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">Workflow</a></li>
              <li><a href="#roadmap" className="hover:text-white transition-colors">Roadmap</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Agency Resources</h4>
            <ul className="space-y-2.5 text-neutral-400 text-xs sm:text-sm">
              <li><a href="#" className="hover:text-white transition-colors">PR ROI Calculator</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Journalist Database</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Case Studies</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Company & Legal</h4>
            <ul className="space-y-2.5 text-neutral-400 text-xs sm:text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Security & Trust</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-neutral-500 gap-4">
          <p>© {new Date().getFullYear()} Convix Software Inc. All rights reserved.</p>
          <p className="flex gap-4">
            <a href="#" className="hover:underline">Privacy</a>
            <a href="#" className="hover:underline">Terms</a>
            <a href="#" className="hover:underline">Cookies</a>
          </p>
        </div>

      </div>
    </footer>
  );
};
