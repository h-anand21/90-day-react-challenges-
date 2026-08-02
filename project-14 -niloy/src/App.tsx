import React from 'react';
import { LexoraNavbar } from './components/LexoraNavbar';
import { LexoraHero } from './components/LexoraHero';
import { Features } from './components/Features';
import { HowItWorks } from './components/HowItWorks';
import { Pricing } from './components/Pricing';
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';

function App() {
  React.useEffect(() => {
    // If user navigates to /record, /demo, /live, auto-scroll to studio console
    if (window.location.pathname.includes('record') || window.location.hash.includes('record')) {
      setTimeout(() => {
        const el = document.getElementById('studio-console');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, []);

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
