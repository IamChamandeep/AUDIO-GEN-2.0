
import React, { useState, useEffect } from 'react';

const Header: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const checkStatus = async () => {
    const aiStudio = (window as any).aistudio;
    // 1. Check bridge if it exists
    if (aiStudio && typeof aiStudio.hasSelectedApiKey === 'function') {
      try {
        const hasKey = await aiStudio.hasSelectedApiKey();
        setIsConnected(hasKey);
        return;
      } catch (e) {
        console.warn("Bridge status check failed", e);
      }
    }
    
    // 2. Fallback: If no bridge, check if environment key exists (Vercel/Local)
    if (process.env.API_KEY && process.env.API_KEY !== "") {
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleConnect = async () => {
    const aiStudio = (window as any).aistudio;
    
    // If bridge exists, use it
    if (aiStudio && typeof aiStudio.openSelectKey === 'function') {
      try {
        await aiStudio.openSelectKey();
        setIsConnected(true);
      } catch (e) {
        console.error("Connection Error:", e);
      }
    } else {
      // If bridge is missing (e.g. Vercel), provide feedback
      if (process.env.API_KEY) {
        alert("System is currently active using the deployment's Environment Key (Free Quota). No further connection needed.");
      } else {
        alert("AI Studio bridge not detected. To use this app on Vercel, please add your 'API_KEY' to the Vercel Environment Variables dashboard.");
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
            <span className="text-[7px] md:text-[8px] font-bold text-white/40 uppercase tracking-[0.2em] mt-1.5">Free Studio Mode</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 md:gap-12">
          <button 
            onClick={handleConnect}
            className={`group text-[9px] font-black uppercase tracking-[0.2em] px-4 md:px-6 py-2.5 rounded-full border transition-all flex items-center gap-2 md:gap-3 cursor-pointer ${
              isConnected 
              ? 'border-brand-cyan/40 text-brand-cyan bg-brand-cyan/5 hover:bg-brand-cyan/10' 
              : 'border-brand-orange text-brand-orange bg-brand-orange/5 hover:bg-brand-orange hover:text-black animate-pulse'
            }`}
          >
            <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${isConnected ? 'bg-brand-cyan shadow-[0_0_10px_#00F0FF]' : 'bg-brand-orange shadow-[0_0_10px_#FF5C00]'}`}></div>
            <span className="hidden xs:inline">{isConnected ? 'SYSTEM ACTIVE' : 'CONNECT ACCOUNT'}</span>
            <span className="xs:hidden">{isConnected ? 'ACTIVE' : 'CONNECT'}</span>
          </button>

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
