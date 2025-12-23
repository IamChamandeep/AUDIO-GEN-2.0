
import React, { useState, useEffect } from 'react';

const Header: React.FC = () => {
  const [hasCustomKey, setHasCustomKey] = useState<boolean>(false);

  const checkStatus = async () => {
    const aiStudio = (window as any).aistudio;
    if (aiStudio) {
      const hasKey = await aiStudio.hasSelectedApiKey();
      setHasCustomKey(hasKey);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSwitchAccount = async () => {
    const aiStudio = (window as any).aistudio;
    if (aiStudio) {
      try {
        await aiStudio.openSelectKey();
      } catch (e) {
        console.error("Account Switch Error:", e);
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
            <span className="text-[8px] font-bold text-white/40 uppercase tracking-[0.2em] mt-1.5">Free Studio Mode</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6 md:gap-12">
          <button 
            onClick={handleSwitchAccount}
            className="group text-[9px] font-black uppercase tracking-[0.3em] px-5 py-2.5 rounded-full border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-all flex items-center gap-3 bg-white/5"
          >
            <div className={`w-1.5 h-1.5 rounded-full ${hasCustomKey ? 'bg-brand-cyan' : 'bg-white/40'}`}></div>
            {hasCustomKey ? 'PROJECT LINKED' : 'SWITCH ACCOUNT'}
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
