
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
        // Fallback for local development or non-bridge environments
        setIsAuthenticated(true);
      }
    };
    
    checkAuth();
    // Poll for status changes every 2 seconds to catch updates from the bridge/header
    const interval = setInterval(checkAuth, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleConnect = async () => {
    const aiStudio = (window as any).aistudio;
    if (aiStudio) {
      try {
        await aiStudio.openSelectKey();
        // Assume success immediately to mitigate race conditions as per instructions
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
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
        {/* Subtle Background Ambience */}
        <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-brand-orange/5 blur-[180px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-brand-cyan/5 blur-[180px] rounded-full"></div>

        <div className="glass-panel p-10 md:p-24 rounded-[3.5rem] max-w-3xl w-full text-center relative z-10 border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.9)]">
          <div className="w-20 h-20 bg-white text-brand-dark rounded-2xl flex items-center justify-center font-black italic text-4xl mx-auto mb-10 shadow-2xl">
            C
          </div>
          
          <div className="mb-12">
            <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight mb-4">
              CHAMANDEEP <span className="text-brand-orange">STUDIO</span>
            </h1>
            <p className="text-brand-cyan text-[11px] md:text-[13px] font-black uppercase tracking-[0.6em] mb-6">
              Connect to Start Building
            </p>
            <div className="w-16 h-1 bg-white/10 mx-auto rounded-full mb-8"></div>
            <p className="text-white/60 font-medium text-lg leading-relaxed max-w-md mx-auto">
              Unlock the narration engine by connecting your Google account. Use your free quota to process high-fidelity AI voiceovers automatically.
            </p>
          </div>
          
          <button 
            onClick={handleConnect}
            className="group relative w-full py-6 bg-white hover:bg-brand-orange text-black font-black uppercase text-lg tracking-[0.2em] rounded-3xl transform transition-all hover:scale-[1.02] active:scale-[0.98] mb-10 overflow-hidden shadow-2xl"
          >
            <span className="relative z-10">Connect with Google Account</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          </button>

          <div className="space-y-6">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">
              Important: You must connect a project before use
            </p>
            <div className="flex justify-center gap-6">
               <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                className="text-[10px] font-bold text-white/40 hover:text-brand-cyan transition-all border-b border-white/10 hover:border-brand-cyan pb-1"
              >
                Billing & Quota Docs
              </a>
              <a 
                href="https://aistudio.google.com/" 
                target="_blank" 
                className="text-[10px] font-bold text-white/40 hover:text-brand-cyan transition-all border-b border-white/10 hover:border-brand-cyan pb-1"
              >
                Google AI Studio
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center opacity-30 relative z-10">
          <p className="text-[10px] font-black text-white uppercase tracking-[0.8em]">
            Optimized for High-Fidelity Audio Synthesis
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
