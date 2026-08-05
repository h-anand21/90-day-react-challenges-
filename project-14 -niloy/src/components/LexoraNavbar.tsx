import React from 'react';
import { ShoppingBag, ArrowRight, Menu, X } from 'lucide-react';
import { getRecordUrl } from '@/config/urls';

export const LexoraNavbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const recordUrl = getRecordUrl();

  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between py-2.5 px-5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="flex items-center gap-1 h-6">
            <div className="w-1 bg-orange-500 h-3 rounded-full" />
            <div className="w-1 bg-orange-500 h-5 rounded-full" />
            <div className="w-1 bg-orange-500 h-6 rounded-full" />
            <div className="w-1 bg-orange-500 h-4 rounded-full" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
            ClarityStream <span className="text-orange-500">AI</span>
          </span>
        </a>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-200">
          <a href="#features" className="hover:text-orange-400 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-orange-400 transition-colors">How It Works</a>
          <a href="#solutions" className="hover:text-orange-400 transition-colors">Solutions</a>
          <a href="#roadmap" className="hover:text-orange-400 transition-colors">Roadmap</a>
          <a href="#pricing" className="hover:text-orange-400 transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-orange-400 transition-colors">FAQ</a>
          <a href="#contact" className="hover:text-orange-400 transition-colors">Contact</a>
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          <button className="p-2 text-slate-200 hover:text-white transition-colors">
            <ShoppingBag className="w-4 h-4" />
          </button>
          
          <a
            href={recordUrl}
            className="px-4 py-1.5 rounded-full text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-all"
          >
            Login
          </a>

          <a
            href={recordUrl}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-white glow-orange-button transition-all"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-white"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="md:hidden mt-3 p-5 rounded-3xl bg-slate-900/95 border border-white/20 backdrop-blur-2xl shadow-2xl flex flex-col gap-4 text-left font-semibold text-sm">
          <a href="#features" onClick={() => setMobileOpen(false)} className="hover:text-orange-400">Features</a>
          <a href="#how-it-works" onClick={() => setMobileOpen(false)} className="hover:text-orange-400">How It Works</a>
          <a href="#solutions" onClick={() => setMobileOpen(false)} className="hover:text-orange-400">Solutions</a>
          <a href="#roadmap" onClick={() => setMobileOpen(false)} className="hover:text-orange-400">Roadmap</a>
          <a href="#pricing" onClick={() => setMobileOpen(false)} className="hover:text-orange-400">Pricing</a>
          <a href="#contact" onClick={() => setMobileOpen(false)} className="hover:text-orange-400">Contact</a>
          <a
            href={recordUrl}
            className="w-full py-3 rounded-full text-center font-bold text-white glow-orange-button block"
          >
            Get Started Free
          </a>
        </div>
      )}
    </header>
  );
};
