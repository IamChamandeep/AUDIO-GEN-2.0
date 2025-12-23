
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ScriptGenerator from './components/ScriptGenerator';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    // Fixed: Added optional modifier to aistudio to match the environment's global declaration and resolve modifier conflicts.
    aistudio?: AIStudio;
  }
}

const App: React.FC = () => {
  const [isAuthorized, setIsAuthorized] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Fixed: Use optional chaining when accessing window.aistudio to safely handle its potentially undefined state.
        const hasKey = await window.aistudio?.hasSelectedApiKey();
        setIsAuthorized(!!hasKey);
      } catch (e) {
        setIsAuthorized(false);
      }
    };
    checkAuth();
  }, []);

  const handleSwitchAccount = async () => {
    try {
      // Fixed: Use optional chaining when triggering openSelectKey.
      await window.aistudio?.openSelectKey();
      setIsAuthorized(true);
    } catch (e) {
      console.error("Auth failed", e);
    }
  };

  return (
    <div className="min-h-screen selection:bg-brand-orange/40 relative">
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header 
          isAuthorized={isAuthorized} 
          onSwitchAccount={handleSwitchAccount} 
        />
        
        <main className="flex-grow">
          <section className="relative pt-40 pb-20">
            <div className="max-w-5xl mx-auto px-8 text-center">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass-panel text-[11px] font-black uppercase tracking-[0.3em] text-white mb-10 shadow-xl border-white/30">
                <span className={`w-2 h-2 rounded-full ${isAuthorized ? 'bg-brand-cyan shadow-[0_0_10px_#00F0FF]' : 'bg-brand-orange shadow-[0_0_10px_#FF5C00]'} animate-pulse`}></span>
                {isAuthorized ? 'STUDIO ACTIVE' : 'PERSONAL QUOTA READY'}
              </div>
              <h2 className="text-7xl md:text-[8rem] font-black text-white tracking-tighter mb-8 leading-[0.85] drop-shadow-2xl">
                NARRATE YOUR <br/>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-cyan via-white to-brand-cyan text-glow-cyan">STORY</span>
              </h2>
              <p className="text-lg font-bold text-white/40 uppercase tracking-[0.5em] max-w-2xl mx-auto">
                Free Personal Story Studio
              </p>
            </div>
          </section>
          
          <ScriptGenerator onAuthError={() => setIsAuthorized(false)} />
        </main>

        <footer className="py-20 px-8 text-center border-t border-white/5 mt-10">
          <p className="text-[11px] font-black text-white uppercase tracking-[0.5em] opacity-30">
            &copy; 2024 CHAMANDEEP MEDIA • USES GOOGLE AI STUDIO FREE TIER
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
