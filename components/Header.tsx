
import React, { useState, useEffect } from 'react';

const Header: React.FC = () => {
  const [hasKey, setHasKey] = useState<boolean>(false);

  const checkStatus = () => {
    const adminKey = localStorage.getItem('admin_api_key');
    // We only consider it "ready" if there's an admin key or a valid env key
    const envKey = process.env.API_KEY;
    const isReady = !!(adminKey && adminKey.length > 5) || !!(envKey && envKey.length > 5);
    setHasKey(isReady);
  };

  useEffect(() => {
    checkStatus();
    // Poll frequently to catch changes from the admin panel
    const interval = setInterval(checkStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-[60] py-6 px-4 md:px-10">
      <div className="max-w-[1500px] mx-auto flex items-center justify-between glass-panel px-6 md:px-12 py-5 rounded-[1.5rem] border-white/20">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center font-black italic text-xl shadow-2xl">
            AI
          </div>
          <div className="flex flex-col">
            <h1 className="text-[10px] md:text-sm font-black tracking-[0.4em] text-white uppercase leading-none">
              AI NARRATOR
            </h1>
            <span className="text-[7px] md:text-[8px] font-bold text-white/40 uppercase tracking-[0.2em] mt-1.5">
              {hasKey ? 'ENGINE ACTIVE' : 'CONFIGURATION REQUIRED'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 md:gap-12">
          <div className={`flex items-center gap-3 px-5 py-2 rounded-full border transition-all ${hasKey ? 'bg-brand-cyan/10 border-brand-cyan/30' : 'bg-brand-orange/10 border-brand-orange/30'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${hasKey ? 'bg-brand-cyan shadow-[0_0_8px_#00F0FF]' : 'bg-brand-orange animate-pulse shadow-[0_0_8px_#FF5C00]'}`}></div>
            <span className={`text-[9px] font-black uppercase tracking-widest ${hasKey ? 'text-brand-cyan' : 'text-brand-orange'}`}>
              {hasKey ? 'System Ready' : 'System Not Ready'}
            </span>
          </div>

          <a 
            href="https://www.instagram.com/iamchamandeep/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden lg:block text-[11px] font-black uppercase tracking-[0.4em] text-white/40 hover:text-white transition-all border-b-2 border-transparent hover:border-brand-orange pb-0.5"
          >
            SUPPORT
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
