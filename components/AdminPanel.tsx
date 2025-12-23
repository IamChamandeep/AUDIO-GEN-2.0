
import React, { useState } from 'react';

const AdminPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [apiKey, setApiKey] = useState(localStorage.getItem('admin_api_key') || '');
  const [error, setError] = useState('');

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Chaman@@515251') {
      setIsUnlocked(true);
      setError('');
    } else {
      setError('Incorrect Password');
    }
  };

  const handleSave = () => {
    localStorage.setItem('admin_api_key', apiKey);
    // Instead of reload(), we simply close and the background polling in Header/App will catch it
    setIsUnlocked(false);
    setIsOpen(false);
    setPassword('');
    alert('API Key Updated Successfully');
  };

  const handleClear = () => {
    localStorage.removeItem('admin_api_key');
    setApiKey('');
    alert('Admin Key Cleared');
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-10 h-10 glass-panel rounded-full flex items-center justify-center text-white/20 hover:text-white transition-all z-[100]"
        title="Admin Settings"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="glass-panel p-10 rounded-[2.5rem] w-full max-w-md border-white/20 shadow-2xl">
        {!isUnlocked ? (
          <form onSubmit={handleUnlock} className="space-y-6">
            <h4 className="text-2xl font-black text-white uppercase tracking-widest text-center">ADMIN ACCESS</h4>
            <div className="space-y-2">
              <input 
                type="password"
                placeholder="Enter Admin Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-brand-orange transition-all text-center"
              />
              {error && <p className="text-red-500 text-[10px] font-black uppercase text-center">{error}</p>}
            </div>
            <div className="flex gap-4">
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 py-4 text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-white"
              >
                CANCEL
              </button>
              <button 
                type="submit"
                className="flex-1 py-4 bg-brand-orange text-black font-black uppercase tracking-widest rounded-xl"
              >
                UNLOCK
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-8">
            <h4 className="text-2xl font-black text-brand-orange uppercase tracking-widest text-center">API SETTINGS</h4>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">MASTER PAID API KEY</label>
              <input 
                type="text"
                placeholder="Enter your Paid API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-brand-cyan transition-all font-mono text-sm"
              />
              <p className="text-[9px] text-white/30 font-bold uppercase leading-relaxed text-center">
                This key will be stored locally in your browser and will be used for narration.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleSave}
                className="w-full py-4 bg-brand-cyan text-black font-black uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.3)]"
              >
                SAVE & APPLY
              </button>
              <div className="flex gap-3">
                <button 
                  onClick={handleClear}
                  className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 rounded-xl"
                >
                  CLEAR KEY
                </button>
                <button 
                  onClick={() => {setIsUnlocked(false); setIsOpen(false);}}
                  className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-white/40"
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
