
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ScriptGenerator from './components/ScriptGenerator';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const aiStudio = (window as any).aistudio;
      if (aiStudio) {
        const hasKey = await aiStudio.hasSelectedApiKey();
        setIsAuthenticated(hasKey);
      } else {
        // Fallback for non-bridge environments (dev)
        setIsAuthenticated(true);
      }
    };
    checkAuth();
    
    // Check frequently to see if user has authorized via header or elsewhere
    const interval = setInterval(checkAuth, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleConnect = async () => {
    const aiStudio = (window as any).aistudio;
    if (aiStudio) {
      try {
        await aiStudio.openSelectKey();
        // Set authenticated immediately to improve UX and avoid bridge race conditions
        setIsAuthenticated(true);
      } catch (e) {
        console.error("Auth Error:", e);
      }
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-cyan/20 border-t-brand-cyan rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* Deep Ambient Background */}
        <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-brand-orange/5 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-brand-cyan/5 blur-[150px] rounded-full animate-pulse"></div>

        <div className="glass-panel p-10 md:p-20 rounded-[4rem] max-w-3xl w-full text-center relative z-10 border-white/20 shadow-[0_50px_100px_rgba(0,0,0,0.8)]">
          <div className="w-24 h-24 bg-white text-brand-dark rounded-3xl flex items-center justify-center font-black italic text-5xl mx-auto mb-12 shadow-[0_0_60px_rgba(255,255,255,0.2)]">
            C
          </div>
          
          <div className="space-y-4 mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-[0.1em] leading-tight">
              Project <span className="text-brand-orange">Gate</span> Authentication
            </h1>
            <p className="text-brand-cyan text-xs font-black uppercase tracking-[0.4em]">
              Mandatory Security Clearance Required
            </p>
          </div>

          <div className="mb-14">
            <p className="text-white/70 font-medium text-lg leading-relaxed max-w-lg mx-auto">
              Unlock professional-grade narration by connecting your Google account. 
              <span className="block mt-2 text-white/40 text-sm">Automated project selection enables free-tier processing with high-fidelity studio models.</span>
            </p>
          </div>
          
          <button 
            onClick={handleConnect}
            className="group relative w-full py-7 bg-white hover:bg-brand-orange text-black font-black uppercase text-xl tracking-[0.2em] rounded-[2rem] transform transition-all hover:scale-[1.03] active:scale-[0.97] mb-10 overflow-hidden shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
          >
            <span className="relative z-10">Connect via Google Cloud</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          </button>

          <div className="flex flex-col items-center gap-6">
            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.6em]">
              Requires Google AI Studio access
            </p>
            <div className="flex gap-4">
               <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                className="text-[10px] font-bold text-white/40 hover:text-brand-cyan transition-colors border border-white/10 px-4 py-2 rounded-full"
              >
                Quota Docs
              </a>
              <a 
                href="https://aistudio.google.com/" 
                target="_blank" 
                className="text-[10px] font-bold text-white/40 hover:text-brand-cyan transition-colors border border-white/10 px-4 py-2 rounded-full"
              >
                Go to AI Studio
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center relative z-10">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em]">
            Optimized for Gemini 2.5 Flash-Native Audio
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen selection:bg-brand-orange/40 relative">
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow">
          <section className="relative pt-44 pb-20">
            <div className="max-w-5xl mx-auto px-8 text-center">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass-panel text-[11px] font-black uppercase tracking-[0.3em] text-white mb-10 shadow-xl border-white/30">
                <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse"></span>
                PROFESSIONAL STUDIO V3.5
              </div>
              <h2 className="text-7xl md:text-[8rem] font-black text-white tracking-tighter mb-8 leading-[0.85] drop-shadow-2xl">
                NARRATE YOUR <br/>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-cyan via-white to-brand-cyan text-glow-cyan">STORY</span>
              </h2>
              <p className="text-lg font-bold text-white/40 uppercase tracking-[0.5em] max-w-2xl mx-auto">
                High-Performance AI Narrative Engine
              </p>
            </div>
          </section>
          
          <ScriptGenerator />
        </main>

        <footer className="py-20 px-8 text-center border-t border-white/5 mt-10">
          <p className="text-[11px] font-black text-white uppercase tracking-[0.5em] opacity-30">
            &copy; 2024 CHAMANDEEP MEDIA • ALL RIGHTS RESERVED
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
