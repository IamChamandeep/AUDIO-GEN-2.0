
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ScriptGenerator from './components/ScriptGenerator';
import AdminPanel from './components/AdminPanel';

const App: React.FC = () => {
  const [hasKey, setHasKey] = useState<boolean>(false);

  useEffect(() => {
    const checkKey = () => {
      const adminKey = localStorage.getItem('admin_api_key');
      const envKey = process.env.API_KEY;
      const isReady = !!(adminKey && adminKey.length > 5) || !!(envKey && envKey.length > 5);
      setHasKey(isReady);
    };
    checkKey();
    const interval = setInterval(checkKey, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen selection:bg-brand-orange/40 relative bg-brand-dark">
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow">
          <section className="relative pt-44 pb-20">
            <div className="max-w-5xl mx-auto px-8 text-center">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass-panel text-[11px] font-black uppercase tracking-[0.3em] text-white mb-10 shadow-xl border-white/30">
                <span className={`w-2 h-2 rounded-full ${hasKey ? 'bg-brand-cyan animate-pulse shadow-[0_0_8px_#00F0FF]' : 'bg-brand-orange shadow-[0_0_8px_#FF5C00]'}`}></span>
                {hasKey ? 'ENGINE READY' : 'CONFIGURATION REQUIRED'}
              </div>
              <h2 className="text-7xl md:text-[8rem] font-black text-white tracking-tighter mb-8 leading-[0.85] drop-shadow-2xl">
                NARRATE YOUR <br/>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-cyan via-white to-brand-cyan text-glow-cyan">STORY</span>
              </h2>
              <p className="text-lg font-bold text-white/40 uppercase tracking-[0.5em] max-w-2xl mx-auto">
                AI Powered Narrative System
              </p>
            </div>
          </section>
          
          <ScriptGenerator />
        </main>

        <footer className="py-20 px-8 text-center border-t border-white/5 mt-10">
          <p className="text-[11px] font-black text-white uppercase tracking-[0.5em] opacity-30">
            &copy; 2024 AI MEDIA • INDEPENDENT STUDIO
          </p>
        </footer>
      </div>
      <AdminPanel />
    </div>
  );
};

export default App;
