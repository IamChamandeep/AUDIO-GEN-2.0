
import React from 'react';

interface HeaderProps {
  isAuthorized: boolean;
  onSwitchAccount: () => void;
}

const Header: React.FC<HeaderProps> = ({ isAuthorized, onSwitchAccount }) => {
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
            <span className="text-[8px] font-bold text-white/40 uppercase tracking-[0.2em] mt-1">Free Story Studio</span>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
             <div className={`px-3 py-1 rounded-md border text-[9px] font-black uppercase tracking-widest ${isAuthorized ? 'text-brand-cyan border-brand-cyan/20 bg-brand-cyan/5' : 'text-white/40 border-white/10'}`}>
               {isAuthorized ? 'FREE QUOTA ACTIVE' : 'READY TO CONNECT'}
             </div>
             <button 
                onClick={onSwitchAccount}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-white transition-all border border-white/10 hover:border-white/40 px-4 py-2 rounded-lg"
              >
                SWITCH ACCOUNT
              </button>
          </div>
          
          <a 
            href="https://www.instagram.com/iamchamandeep/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden md:block text-[11px] font-black uppercase tracking-[0.4em] text-white hover:text-brand-orange transition-all"
          >
            INSTAGRAM
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
