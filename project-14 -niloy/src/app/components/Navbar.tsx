import React, { useState } from "react";
import { ChevronDown, ChevronRight, ShoppingCart, Menu, X } from "lucide-react";

export const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="w-full flex justify-center pt-4 sm:pt-6 px-3 sm:px-4 z-50">
      <nav className="bg-white rounded-full shadow-sm border border-neutral-200 pl-2.5 pr-2 py-2 w-full max-w-[760px] relative flex items-center justify-between">
        {/* Logo Left */}
        <a href="#" className="flex items-center gap-2 pl-1 shrink-0 group">
          <svg
            viewBox="0 0 32 32"
            className="w-7 h-7 sm:w-8 sm:h-8 transition-transform group-hover:rotate-12 duration-300"
            fill="#ef4d23"
          >
            {/* Center circle */}
            <circle cx="16" cy="16" r="3.5" />
            {/* 8 outer circles at radius 10 around center (16,16) */}
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i * Math.PI) / 4;
              const cx = 16 + 10 * Math.cos(angle);
              const cy = 16 + 10 * Math.sin(angle);
              return <circle key={i} cx={cx} cy={cy} r="3.5" />;
            })}
          </svg>
          <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
            Convix
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6 text-[14px] font-medium text-neutral-700">
          <a href="#" className="flex items-center gap-1.5 text-slate-900 font-semibold hover:text-[#ef4d23] transition-colors">
            <span className="w-[4.5px] h-[4.5px] rounded-full bg-black inline-block" />
            Home
          </a>
          <a href="#features" className="hover:text-[#ef4d23] transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-[#ef4d23] transition-colors">
            About
          </a>
          <a href="#roadmap" className="flex items-center gap-1 hover:text-[#ef4d23] transition-colors">
            Pages
            <ChevronDown className="w-3.5 h-3.5 stroke-[2.5] text-[#ef4d23]" />
          </a>
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          <button 
            aria-label="Shopping Cart" 
            className="hidden md:grid place-items-center w-9 h-9 rounded-full hover:bg-neutral-100 transition-colors text-neutral-700"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>

          <a
            href="#early-access"
            className="bg-[#ef4d23] hover:bg-[#d93f17] text-white font-medium rounded-full pl-4 pr-1.5 py-1.5 text-[13px] sm:text-[14px] inline-flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
          >
            <span className="hidden sm:inline">Get early access</span>
            <span className="sm:hidden">Early access</span>
            <span className="w-6 h-6 rounded-full bg-white/20 grid place-items-center shrink-0">
              <ChevronRight className="w-3.5 h-3.5 text-white" />
            </span>
          </a>

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden grid place-items-center w-9 h-9 rounded-full bg-neutral-100 text-neutral-800 hover:bg-neutral-200 transition-colors ml-1"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Panel */}
        {mobileOpen && (
          <div className="md:hidden absolute top-full left-2 right-2 mt-2 bg-white rounded-2xl shadow-xl border border-neutral-200 p-4 z-50 flex flex-col gap-3 text-[15px] font-medium text-neutral-800 animate-in fade-in slide-in-from-top-2 duration-200">
            <a
              href="#"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 py-2 px-3 rounded-lg bg-neutral-50 text-[#ef4d23] font-semibold"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#ef4d23]" />
              Home
            </a>
            <a
              href="#features"
              onClick={() => setMobileOpen(false)}
              className="py-2 px-3 hover:bg-neutral-50 rounded-lg transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileOpen(false)}
              className="py-2 px-3 hover:bg-neutral-50 rounded-lg transition-colors"
            >
              How It Works & About
            </a>
            <a
              href="#roadmap"
              onClick={() => setMobileOpen(false)}
              className="py-2 px-3 hover:bg-neutral-50 rounded-lg transition-colors"
            >
              Roadmap
            </a>
            <a
              href="#faq"
              onClick={() => setMobileOpen(false)}
              className="py-2 px-3 hover:bg-neutral-50 rounded-lg transition-colors"
            >
              FAQ
            </a>
          </div>
        )}
      </nav>
    </div>
  );
};
