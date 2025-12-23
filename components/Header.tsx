
import React, { useState, useEffect } from 'react';

const Header: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [hasBridge, setHasBridge] = useState<boolean>(false);

  useEffect(() => {
    const checkStatus = async () => {
      const aiStudio = (window as any).aistudio;
      if (aiStudio && typeof aiStudio.hasSelectedApiKey === 'function') {
        setHasBridge(true);
        try {
          const hasKey = await aiStudio.hasSelectedApiKey();
          setIsConnected(hasKey);
        } catch (e) {
          setIsConnected(false);
        }
      } else {
        setHasBridge(false);
        setIsConnected(true);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleConnect = async () => {
    const aiStudio = (window as any).aistudio;
    if (aiStudio && typeof aiStudio.openSelectKey === 'function') {
      try {
        await aiStudio.openSelectKey();
        setIsConnected(true);
      } catch (e) {
        console.error("Connection Error:", e);
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[60] py-6 px-4 md:px-10">
      <div className="max-w-[1500px] mx-auto flex items-center justify-between glass-panel px-6 md:px-12 py-5 rounded-[1.5rem] border-white/20">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center font-black italic text-xl shadow-2xl">
            C
          </div>
          <div className="flex flex-col">
            <h1 className="text-[10px] md:text-sm font-black tracking-[0.4em] text-white uppercase leading-none">
              CHAMANDEEP AI
            </h1>
            <span className="text-[7px] md:text-[8px] font-bold text-white/40 uppercase tracking-[0.2em] mt-1.5">
              {isConnected ? 'Project Integrated' : 'Cloud Setup Pending'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 md:gap-12">
          {hasBridge && !isConnected ? (
            <button 
              onClick={handleConnect}
              className="text-[9px] font-black uppercase tracking-[0.2em] px-6 py-2.5 rounded-full border border-brand-orange text-brand-orange bg-brand-orange/5 hover:bg-brand-orange hover:text-black transition-all animate-pulse cursor-pointer shadow-[0_0_15px_rgba(255,92,0,0.2)]"
            >
              Link Project
            </button>
          ) : (
            <div className={`flex items-center gap-3 px-5 py-2 rounded-full border transition-all ${isConnected ? 'bg-brand-cyan/10 border-brand-cyan/30' : 'bg-brand-orange/10 border-brand-orange/30'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-brand-cyan shadow-[0_0_8px_#00F0FF]' : 'bg-brand-orange animate-pulse shadow-[0_0_8px_#FF5C00]'}`}></div>
              <span className={`text-[9px] font-black uppercase tracking-widest ${isConnected ? 'text-brand-cyan' : 'text-brand-orange'}`}>
                {isConnected ? 'System Ready' : 'Sync Required'}
              </span>
            </div>
          )}

          <a 
            href="https://www.instagram.com/iamchamandeep/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden lg:block text-[11px] font-black uppercase tracking-[0.4em] text-white/40 hover:text-white transition-all border-b-2 border-transparent hover:border-brand-orange pb-0.5"
          >
            INSTAGRAM
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
