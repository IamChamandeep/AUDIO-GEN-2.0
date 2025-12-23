
import React from 'react';

const Header: React.FC = () => {
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
        
        <div className="flex items-center gap-10">
          <a 
            href="https://www.instagram.com/iamchamandeep/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[11px] font-black uppercase tracking-[0.4em] text-white hover:text-brand-orange transition-all border-b-2 border-transparent hover:border-brand-orange pb-0.5"
          >
            INSTAGRAM
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
