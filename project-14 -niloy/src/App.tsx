import React from 'react';
import { LexoraNavbar } from './components/LexoraNavbar';
import { LexoraHero } from './components/LexoraHero';
import { Features } from './components/Features';
import { HowItWorks } from './components/HowItWorks';
import { Pricing } from './components/Pricing';
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 font-sans selection:bg-orange-500 selection:text-white">
      <LexoraNavbar />
      <main>
        <LexoraHero />
        <Features />
        <HowItWorks />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}

export default App;
