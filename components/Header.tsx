
import React, { useState, useEffect } from 'react';

const Header: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const checkStatus = async () => {
    const aiStudio = (window as any).aistudio;
    if (aiStudio) {
      const hasKey = await aiStudio.hasSelectedApiKey();
      setIsConnected(hasKey);
    }
  };

  useEffect(() => {
    checkStatus();
    // Periodically poll for status updates as the bridge doesn't always emit events
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleConnect = async () => {
    const aiStudio = (window as any).aistudio;
    if (aiStudio) {
      await aiStudio.openSelectKey();
      setIsConnected(true);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[60] py-6 px-10">
      <div className="max-w-[1500px] mx-auto flex items-center justify-between glass-panel px-10 py-4 rounded-2xl border-white/20">
        <div className="flex items-center gap-5">
          <div className="w-10 h-10 bg-white text-black rounded-lg flex items-center justify-center font-black italic text-xl shadow-2xl">
            C
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black tracking-[0.4em] text-white uppercase leading-none">
              CHAMANDEEP AI
            </h1>
            <span className="text-[8px] font-bold text-white/40 uppercase tracking-[0.2em] mt-1">Professional Narration</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6 md:gap-10">
          <button 
            onClick={handleConnect}
            className={`text-[10px] font-black uppercase tracking-[0.3em] px-5 py-2 rounded-full border transition-all flex items-center gap-3 ${
              isConnected 
              ? 'border-brand-cyan/30 text-brand-cyan bg-brand-cyan/5' 
              : 'border-brand-orange text-brand-orange bg-brand-orange/10 animate-pulse'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-brand-cyan shadow-[0_0_8px_#00F0FF]' : 'bg-brand-orange shadow-[0_0_8px_#FF5C00]'}`}></span>
            {isConnected ? 'STUDIO CONNECTED' : 'CONNECT STUDIO'}
          </button>

          <a 
            href="https://www.instagram.com/iamchamandeep/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden md:block text-[11px] font-black uppercase tracking-[0.4em] text-white hover:text-brand-orange transition-all border-b-2 border-transparent hover:border-brand-orange pb-0.5"
          >
            INSTAGRAM
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
