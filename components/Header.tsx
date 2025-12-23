
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
    // Poll for status updates frequently as the bridge doesn't emit events
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleConnect = async () => {
    const aiStudio = (window as any).aistudio;
    if (aiStudio) {
      try {
        await aiStudio.openSelectKey();
        // Optimistically set to connected
        setIsConnected(true);
      } catch (e) {
        console.error("Manual Connect Error:", e);
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[60] py-6 px-10">
      <div className="max-w-[1500px] mx-auto flex items-center justify-between glass-panel px-8 md:px-12 py-5 rounded-[1.5rem] border-white/20">
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center font-black italic text-xl shadow-2xl">
            C
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black tracking-[0.4em] text-white uppercase leading-none">
              CHAMANDEEP AI
            </h1>
            <span className="text-[8px] font-bold text-white/40 uppercase tracking-[0.2em] mt-1.5">Pro-Narration Studio</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6 md:gap-12">
          <button 
            onClick={handleConnect}
            className={`group text-[10px] font-black uppercase tracking-[0.3em] px-6 py-3 rounded-full border transition-all flex items-center gap-3 ${
              isConnected 
              ? 'border-brand-cyan/40 text-brand-cyan bg-brand-cyan/5 hover:bg-brand-cyan/10' 
              : 'border-white text-white bg-white/5 hover:bg-white hover:text-black animate-pulse'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-brand-cyan shadow-[0_0_10px_#00F0FF]' : 'bg-white shadow-[0_0_10px_#FFF]'}`}></span>
            {isConnected ? 'GOOGLE CONNECTED' : 'CONNECT GOOGLE ACCOUNT'}
          </button>

          <a 
            href="https://www.instagram.com/iamchamandeep/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden lg:block text-[11px] font-black uppercase tracking-[0.4em] text-white/60 hover:text-white transition-all border-b-2 border-transparent hover:border-brand-orange pb-0.5"
          >
            INSTAGRAM
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
