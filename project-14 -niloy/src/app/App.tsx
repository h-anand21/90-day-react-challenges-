import React from "react";
import { ChevronRight } from "lucide-react";
import { Navbar } from "./components/Navbar";
import { DashboardPreview } from "./components/DashboardPreview";
import { Features } from "./components/Features";
import { HowItWorks } from "./components/HowItWorks";
import { Roadmap } from "./components/Roadmap";
import { FAQ } from "./components/FAQ";
import { Footer } from "./components/Footer";

export const App: React.FC = () => {
  return (
    <div className="w-full bg-[#ededed] min-h-screen font-sans text-neutral-900 selection:bg-[#ef4d23] selection:text-white">
      
      {/* Outer wrapper & Hero Container */}
      <div className="w-full p-3 sm:p-4">
        <div className="relative w-full min-h-[calc(100vh-24px)] sm:min-h-[calc(100vh-32px)] overflow-hidden bg-[#d9d9d9] rounded-2xl sm:rounded-3xl shadow-xl flex flex-col justify-between">
          
          {/* Background Video */}
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            disableRemotePlayback
            poster="https://images.unsplash.com/photo-1557683316-973673baf926?w=1600&q=60"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
            webkit-playsinline="true"
            x5-playsinline="true"
          >
            <source
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260424_064411_9e9d7f84-9277-41f4-ab10-59172d89e6be.mp4"
              type="video/mp4"
            />
          </video>

          {/* Above the video: absolute inset-0 bg-white/10 overlay */}
          <div className="absolute inset-0 bg-white/10 pointer-events-none z-[1]" />

          {/* Foreground content wrapper */}
          <div className="relative z-10 flex flex-col justify-between h-full pt-2">
            
            {/* Top Navigation */}
            <Navbar />

            {/* Hero Centered Content */}
            <div className="flex flex-col items-center px-4 pt-10 sm:pt-16 pb-8 sm:pb-12 text-center my-auto">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-1.5 shadow-sm text-[13px] font-medium text-neutral-800 border border-neutral-200/60">
                <span className="w-2 h-2 rounded-full bg-[#ef4d23]" />
                Convix Software
              </div>

              {/* Headline */}
              <h1
                className="mt-5 sm:mt-6 max-w-4xl text-neutral-900"
                style={{
                  fontSize: "clamp(36px, 8vw, 72px)",
                  lineHeight: 1.05,
                  fontWeight: 500,
                  letterSpacing: "-0.02em",
                }}
              >
                Shaping{" "}
                <span
                  style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontStyle: "italic",
                    fontWeight: 400,
                  }}
                  className="text-slate-900"
                >
                  Agencies
                </span>
                <br />
                of tomorrow
              </h1>

              {/* Subtitle */}
              <p
                className="mt-4 sm:mt-6 text-neutral-700 px-2 max-w-2xl font-medium"
                style={{
                  fontSize: "clamp(13px, 3.5vw, 16px)",
                }}
              >
                The All-In-One Software Powering the Future of PR Agencies
              </p>

              {/* CTA Button */}
              <a
                href="#early-access"
                className="mt-6 sm:mt-8 inline-flex items-center gap-3 bg-[#0b0f1a] hover:bg-[#1a2133] text-white rounded-full pl-6 sm:pl-7 pr-2 py-2 sm:py-2.5 text-[14px] font-medium transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                Get Started
                <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/15 grid place-items-center shrink-0">
                  <ChevronRight className="w-4 h-4 text-white" />
                </span>
              </a>
            </div>

            {/* Dashboard Preview (Bleeds off bottom inside rounded container) */}
            <div className="mt-4 pb-0 pt-4">
              <DashboardPreview />
            </div>

          </div>
        </div>
      </div>

      {/* Main Body Content Sections */}
      <main>
        <Features />
        <HowItWorks />
        <Roadmap />
        <FAQ />
      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
};
