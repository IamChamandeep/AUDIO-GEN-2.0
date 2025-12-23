import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ScriptGenerator from './components/ScriptGenerator';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      // Use type assertion to avoid conflict with pre-existing global declarations in the environment
      const aiStudio = (window as any).aistudio;
      if (aiStudio) {
        const hasKey = await aiStudio.hasSelectedApiKey();
        setIsAuthenticated(hasKey);
      } else {
        // Fallback for environments without the bridge
        setIsAuthenticated(true);
      }
    };
    checkAuth();
  }, []);

  const handleConnect = async () => {
    const aiStudio = (window as any).aistudio;
    if (aiStudio) {
      await aiStudio.openSelectKey();
      // Per instructions: assume success after triggering the dialog to avoid race conditions
      setIsAuthenticated(true);
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
        {/* Background Blobs for the Gate */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-orange/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-cyan/10 blur-[120px] rounded-full"></div>

        <div className="glass-panel p-16 rounded-[3rem] max-w-2xl w-full text-center relative z-10 border-white/20 shadow-2xl">
          <div className="w-24 h-24 bg-white text-brand-dark rounded-3xl flex items-center justify-center font-black italic text-5xl mx-auto mb-10 shadow-[0_0_50px_rgba(255,255,255,0.3)]">
            C
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-[0.2em] mb-4">Studio Authentication</h1>
          <p className="text-white/60 font-medium text-lg mb-12 leading-relaxed">
            Welcome to the Professional Narration Engine. <br/>
            Connect your Google AI Studio account to access high-fidelity TTS models and free-tier processing.
          </p>
          
          <button 
            onClick={handleConnect}
            className="w-full py-6 btn-primary text-black font-black uppercase text-lg tracking-[0.2em] rounded-2xl transform transition-all hover:scale-[1.02] active:scale-[0.98] mb-8"
          >
            Authenticate via Project Gate
          </button>

          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">
            Requires a valid Project API Key. <br/>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              className="text-brand-cyan hover:underline mt-2 inline-block"
            >
              Billing & Quota Documentation
            </a>
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