
import React, { useState, useRef, useMemo, useEffect } from 'react';
import JSZip from 'jszip';
import { AVAILABLE_VOICES } from '../constants';
import { generateStorySpeech } from '../services/geminiService';
import { audioBufferToWav, mergeAudioBuffers } from '../services/audioUtils';

interface GeneratedPart {
  id: number;
  text: string;
  wordCount: number;
  audioBuffer: AudioBuffer | null;
  status: 'pending' | 'loading' | 'done' | 'error';
  error?: string;
  hash: string; 
  currentProgress?: number; 
}

interface ScriptGeneratorProps {
  onAuthError?: () => void;
}

const ScriptGenerator: React.FC<ScriptGeneratorProps> = ({ onAuthError }) => {
  const [script, setScript] = useState('');
  const [selectedVoice, setSelectedVoice] = useState(AVAILABLE_VOICES[0].id);
  const [speed, setSpeed] = useState(1.0);
  const [expressiveness, setExpressiveness] = useState(5);
  const [desiredParts, setDesiredParts] = useState<number>(0);
  const [parts, setParts] = useState<GeneratedPart[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<number | null>(null);

  const [showZipModal, setShowZipModal] = useState(false);
  const [zipFilename, setZipFilename] = useState('narrations');
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergeFilename, setMergeFilename] = useState('full_story');
  
  const [showAuthModal, setShowAuthModal] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const totalWordCount = useMemo(() => {
    return script.trim() === "" ? 0 : script.trim().split(/\s+/).filter(Boolean).length;
  }, [script]);

  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
  };

  const handleApiError = (err: any) => {
    const errorMsg = err.message || "";
    if (errorMsg.includes("Requested entity was not found") || errorMsg.includes("API key not valid") || errorMsg.includes("Quota")) {
      setShowAuthModal(true);
      onAuthError?.();
    }
  };

  const handleConnectAccount = async () => {
    try {
      // Fixed: Use optional chaining for window.aistudio to safely handle potentially missing environment object.
      await window.aistudio?.openSelectKey();
      setShowAuthModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  const playVoicePreview = async (voiceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    initAudio();
    if (previewingVoiceId) return;
    
    setPreviewingVoiceId(voiceId);
    const voice = AVAILABLE_VOICES.find(v => v.id === voiceId);
    const personaName = voice?.name || "Artist";
    const testScript = `नमस्ते, मैं ${personaName} हूँ।`;

    try {
      const buffer = await generateStorySpeech(testScript, audioContextRef.current!, voiceId, speed, expressiveness);
      stopGlobalAudio();
      const source = audioContextRef.current!.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current!.destination);
      source.onended = () => setPreviewingVoiceId(null);
      source.start();
      sourceNodeRef.current = source;
    } catch (err: any) {
      handleApiError(err);
      setPreviewingVoiceId(null);
    }
  };

  const processScript = () => {
    const trimmedScript = script.trim();
    if (!trimmedScript) return;
    const words = trimmedScript.split(/\s+/).filter(Boolean);
    const totalWords = words.length;
    let newPartsList: string[] = [];
    const targetWordsPerPart = desiredParts > 0 ? Math.ceil(totalWords / desiredParts) : 2500;
    
    let currentChunk: string[] = [];
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      currentChunk.push(word);
      const isLastWord = i === words.length - 1;
      if (!isLastWord && currentChunk.length >= targetWordsPerPart) {
        if (word.endsWith('.') || word.endsWith('।') || word.endsWith('?') || currentChunk.length >= (targetWordsPerPart * 1.3)) {
          newPartsList.push(currentChunk.join(' '));
          currentChunk = [];
        }
      }
    }
    if (currentChunk.length > 0) newPartsList.push(currentChunk.join(' '));

    setParts(newPartsList.map((text, idx) => {
      const wordCount = text.split(/\s+/).filter(Boolean).length;
      const prefix = text.slice(0, 30);
      const hash = `h_${text.length}_${encodeURIComponent(prefix).slice(-40)}_${selectedVoice}_${speed}`;
      const existing = parts.find(p => p.hash === hash && p.status === 'done');
      return { 
        id: idx + 1, text, wordCount,
        audioBuffer: existing ? existing.audioBuffer : null, 
        status: existing ? 'done' : 'pending', 
        hash, currentProgress: existing ? 100 : 0
      };
    }));
  };

  const updateOverallProgress = (allParts: GeneratedPart[]) => {
    const total = allParts.length;
    if (total === 0) return;
    const completedProgress = allParts.reduce((acc, p) => acc + (p.status === 'done' ? 100 : (p.currentProgress || 0)), 0);
    setOverallProgress(completedProgress / total);
  };

  const generateAll = async () => {
    initAudio();
    if (isProcessing) return;
    setIsProcessing(true);

    const updatedParts = [...parts];
    for (let i = 0; i < updatedParts.length; i++) {
      if (updatedParts[i].status === 'done') {
        updateOverallProgress(updatedParts);
        continue;
      }

      updatedParts[i].status = 'loading';
      updatedParts[i].currentProgress = 0;
      setParts([...updatedParts]);

      try {
        const buffer = await generateStorySpeech(
          updatedParts[i].text, 
          audioContextRef.current!, 
          selectedVoice, speed, expressiveness,
          (prog) => {
            updatedParts[i].currentProgress = prog;
            setParts([...updatedParts]);
            updateOverallProgress(updatedParts);
          }
        );
        updatedParts[i].audioBuffer = buffer;
        updatedParts[i].status = 'done';
        updatedParts[i].currentProgress = 100;
      } catch (err: any) {
        handleApiError(err);
        updatedParts[i].status = 'error';
        updatedParts[i].error = err.message;
        setIsProcessing(false);
        setParts([...updatedParts]);
        return; 
      }
      setParts([...updatedParts]);
      updateOverallProgress(updatedParts);
      
      if (i < updatedParts.length - 1) await new Promise(r => setTimeout(r, 6000));
    }
    setIsProcessing(false);
  };

  const retryPart = async (index: number) => {
    initAudio();
    const updatedParts = [...parts];
    updatedParts[index].status = 'loading';
    updatedParts[index].currentProgress = 0;
    updatedParts[index].error = undefined;
    setParts([...updatedParts]);
    try {
      const buffer = await generateStorySpeech(
        updatedParts[index].text, audioContextRef.current!, selectedVoice, speed, expressiveness,
        (prog) => {
          updatedParts[index].currentProgress = prog;
          setParts([...updatedParts]);
        }
      );
      updatedParts[index].audioBuffer = buffer;
      updatedParts[index].status = 'done';
      updatedParts[index].currentProgress = 100;
    } catch (err: any) {
      handleApiError(err);
      updatedParts[index].status = 'error';
      updatedParts[index].error = err.message;
    }
    setParts([...updatedParts]);
    updateOverallProgress(updatedParts);
  };

  const stopGlobalAudio = () => {
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch(e) {}
      sourceNodeRef.current = null;
    }
    setCurrentlyPlayingId(null);
  };

  const togglePlayPart = (p: GeneratedPart) => {
    if (!p.audioBuffer || !audioContextRef.current) return;
    if (currentlyPlayingId === p.id) {
      stopGlobalAudio();
      return;
    }
    stopGlobalAudio();
    const source = audioContextRef.current.createBufferSource();
    source.buffer = p.audioBuffer;
    source.connect(audioContextRef.current.destination);
    source.onended = () => setCurrentlyPlayingId(prev => prev === p.id ? null : prev);
    source.start();
    sourceNodeRef.current = source;
    setCurrentlyPlayingId(p.id);
  };

  const downloadPart = (part: GeneratedPart) => {
    if (!part.audioBuffer) return;
    const blob = audioBufferToWav(part.audioBuffer);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `segment_${part.id}.wav`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const triggerZipDownload = async () => {
    const doneParts = parts.filter(p => p.status === 'done' && p.audioBuffer);
    if (doneParts.length === 0) return;
    setIsExporting(true);
    try {
      const zip = new JSZip();
      for (const part of doneParts) {
        if (part.audioBuffer) zip.file(`segment_${part.id}.wav`, audioBufferToWav(part.audioBuffer));
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${zipFilename}.zip`;
      a.click();
      setShowZipModal(false);
    } catch (err) { alert("ZIP failed."); } finally { setIsExporting(false); }
  };

  const triggerMergeDownload = async () => {
    const doneParts = parts.filter(p => p.status === 'done' && p.audioBuffer);
    if (doneParts.length === 0) return;
    setIsExporting(true);
    initAudio();
    try {
      const mergedBuffer = mergeAudioBuffers(doneParts.map(p => p.audioBuffer as AudioBuffer), audioContextRef.current!);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(audioBufferToWav(mergedBuffer));
      a.download = `${mergeFilename}_MASTER.wav`;
      a.click();
      setShowMergeModal(false);
    } catch (err) { alert("Merge failed."); } finally { setIsExporting(false); }
  };

  useEffect(() => () => stopGlobalAudio(), []);

  return (
    <div className="max-w-[1300px] mx-auto px-6 pb-40">
      {/* Auth Error Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl text-center">
          <div className="glass-panel p-10 rounded-[2.5rem] w-full max-w-lg shadow-2xl border border-white/40">
            <h4 className="text-3xl font-black text-white uppercase mb-4 tracking-tighter text-glow-orange">PERSONAL ACCESS</h4>
            <p className="text-white/60 font-bold mb-8 uppercase tracking-widest text-[10px] leading-relaxed">
              Your session needs verification or has reached the community limit. Connect your free personal Google account to continue using your private AI Studio quota.
            </p>
            <div className="space-y-4">
              <button onClick={handleConnectAccount} className="w-full py-5 btn-primary text-black font-black uppercase tracking-widest text-[12px] rounded-2xl">CONNECT PERSONAL ACCOUNT</button>
              <button onClick={() => setShowAuthModal(false)} className="w-full py-4 text-white/40 font-black rounded-2xl text-[10px] uppercase tracking-widest">CONTINUE AS GUEST</button>
            </div>
          </div>
        </div>
      )}

      {(showZipModal || showMergeModal) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-3xl text-center">
          <div className="glass-panel p-10 rounded-[2.5rem] w-full max-w-lg shadow-2xl border border-white/40">
            <h4 className="text-3xl font-black text-white uppercase mb-8 tracking-tighter text-glow-orange">PREPARE EXPORT</h4>
            <div className="space-y-8">
              <input 
                type="text" 
                value={showZipModal ? zipFilename : mergeFilename}
                onChange={(e) => showZipModal ? setZipFilename(e.target.value) : setMergeFilename(e.target.value)}
                className="bg-white/10 border border-white/30 w-full px-6 py-4 text-white rounded-2xl outline-none focus:border-brand-orange transition-all text-xl font-bold text-center"
              />
              <div className="flex gap-4">
                <button onClick={() => {setShowZipModal(false); setShowMergeModal(false);}} className="flex-1 py-4 btn-liquid text-white font-black rounded-2xl text-[12px] uppercase tracking-widest">CANCEL</button>
                <button onClick={showZipModal ? triggerZipDownload : triggerMergeDownload} className="flex-1 py-4 btn-primary text-black font-black uppercase tracking-widest text-[12px] rounded-2xl">DOWNLOAD</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="glass-panel rounded-[2.5rem] p-10 relative overflow-hidden group">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-black text-brand-cyan uppercase tracking-[0.2em] flex items-center gap-4 text-glow-cyan">STORY SCRIPT</h3>
              <div className="flex items-center gap-4">
                 <span className="text-[12px] font-black text-white uppercase tracking-widest bg-brand-cyan/20 px-5 py-2 rounded-full border border-brand-cyan/40 backdrop-blur-md">{totalWordCount.toLocaleString()} WORDS</span>
              </div>
            </div>
            
            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="PASTE YOUR STORY SCRIPT HERE..."
              className="w-full h-[450px] bg-transparent border-none p-0 text-white/80 focus:outline-none transition-all resize-none text-base leading-relaxed font-['Noto_Serif_Devanagari']"
            />
            
            <div className="mt-10 flex items-center gap-6">
               <button onClick={processScript} className="px-10 py-5 btn-liquid text-white font-black rounded-2xl text-[12px] uppercase tracking-widest">PREPARE {parts.length > 0 ? `(${parts.length})` : ''}</button>
               <button 
                onClick={generateAll} 
                disabled={parts.length === 0 || isProcessing}
                className="flex-grow py-5 btn-primary disabled:opacity-30 text-black font-black uppercase rounded-2xl text-[13px] tracking-[0.2em]"
              >
                {isProcessing ? 'SYNTHESIZING...' : 'START NARRATION'}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel rounded-[2.5rem] p-10 border-brand-violet/20">
            <h3 className="text-2xl font-black text-brand-violet uppercase tracking-[0.3em] mb-10 text-center text-glow-violet">STUDIO SETUP</h3>
            <div className="space-y-8">
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[11px] font-black uppercase text-white mb-2">
                  <span>VOICE ARTISTS GALLERY</span>
                  <span className="text-white/40">{AVAILABLE_VOICES.length} AVAILABLE</span>
                </div>
                
                <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                  {AVAILABLE_VOICES.map((voice) => (
                    <div 
                      key={voice.id}
                      onClick={() => setSelectedVoice(voice.id)}
                      className={`group relative p-4 rounded-2xl border transition-all cursor-pointer ${
                        selectedVoice === voice.id 
                        ? 'bg-white/15 border-brand-cyan shadow-[0_0_20px_rgba(0,240,255,0.2)]' 
                        : 'bg-white/5 border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className={`text-[13px] font-black uppercase tracking-wider ${selectedVoice === voice.id ? 'text-brand-cyan' : 'text-white'}`}>
                            {voice.name}
                            {selectedVoice === voice.id && <span className="ml-2 text-[8px] bg-brand-cyan text-black px-2 py-0.5 rounded-full">ACTIVE</span>}
                          </span>
                          <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1">{voice.gender} • {voice.style}</span>
                        </div>
                        
                        <button 
                          onClick={(e) => playVoicePreview(voice.id, e)}
                          disabled={previewingVoiceId !== null}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border ${
                            previewingVoiceId === voice.id 
                            ? 'bg-brand-orange border-brand-orange animate-pulse' 
                            : 'bg-white/10 border-white/20 hover:bg-white hover:text-black'
                          }`}
                        >
                          {previewingVoiceId === voice.id ? (
                            <div className="w-4 h-4 border-2 border-brand-cyan/20 border-t-brand-cyan rounded-full animate-spin"></div>
                          ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/></svg>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="flex justify-between text-[11px] font-black uppercase text-white mb-1">
                  <span>TARGET SEGMENTS</span>
                  <span className="text-brand-orange">{desiredParts > 0 ? desiredParts : 'AUTO'}</span>
                </div>
                <input type="number" min="0" value={desiredParts || ''} onChange={(e) => setDesiredParts(Math.max(0, parseInt(e.target.value) || 0))} placeholder="0 = AUTO" className="w-full bg-white/10 border border-white/20 p-5 rounded-xl text-white font-black outline-none text-center" />
              </div>

              <div className="space-y-5">
                <div className="flex justify-between text-[11px] font-black text-white"><span>EMOTION</span><span className="text-brand-violet">{expressiveness}</span></div>
                <input type="range" min="0" max="10" value={expressiveness} onChange={(e) => setExpressiveness(parseInt(e.target.value))} className="w-full" />
              </div>

              <div className="space-y-5">
                <div className="flex justify-between text-[11px] font-black text-white"><span>SPEED</span><span className="text-brand-cyan">{speed}x</span></div>
                <input type="range" min="0.5" max="2.0" step="0.1" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} className="w-full" />
              </div>

              {parts.length > 0 && (
                <div className="pt-8 border-t border-white/10 space-y-4">
                  <button onClick={() => setShowZipModal(true)} disabled={!parts.some(p => p.status === 'done')} className="w-full py-4 btn-liquid text-white font-black text-[11px] uppercase tracking-widest rounded-xl disabled:opacity-30">BATCH ZIP</button>
                  <button onClick={() => setShowMergeModal(true)} disabled={!parts.some(p => p.status === 'done')} className="w-full py-4 btn-primary text-black font-black text-[11px] uppercase tracking-widest rounded-xl disabled:opacity-30">MASTER EXPORT</button>
                </div>
              )}
            </div>
          </div>

          {(isProcessing || overallProgress > 0) && (
            <div className="glass-panel p-10 rounded-[2.5rem] border-brand-orange/40 shadow-2xl">
               <div className="flex justify-between items-center mb-6 text-[12px] font-black text-white uppercase tracking-widest">
                  <span>OVERALL PROJECT</span>
                  <span className="text-brand-orange text-xl">{Math.round(overallProgress)}%</span>
               </div>
               <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden p-1">
                  <div className="h-full bg-gradient-to-r from-brand-orange via-brand-magenta to-brand-violet rounded-full transition-all duration-300" style={{ width: `${overallProgress}%` }}></div>
               </div>
               <p className="mt-4 text-[9px] font-bold text-white/30 uppercase tracking-[0.3em] text-center">
                 {isProcessing ? 'SYNTHESIZING...' : 'COMPLETE'}
               </p>
            </div>
          )}
        </div>
      </div>

      {parts.length > 0 && (
        <div className="mt-20">
          <h4 className="text-4xl font-black text-white uppercase tracking-tighter mb-12 text-glow-cyan">NARRATION QUEUE</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {parts.map((p, idx) => (
              <div key={p.id} className={`p-8 rounded-[2.5rem] liquid-card transition-all duration-500 border shadow-xl relative overflow-hidden ${currentlyPlayingId === p.id ? 'border-brand-cyan' : p.status === 'error' ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'}`}>
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-4">
                    <span className={`w-10 h-10 rounded-xl border flex items-center justify-center text-sm font-black ${p.status === 'done' ? 'bg-brand-orange text-black border-brand-orange' : p.status === 'error' ? 'bg-red-500 text-white border-red-500' : 'text-white/40 border-white/20'}`}>{p.id}</span>
                    <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${p.status === 'error' ? 'text-red-400 border-red-500/30' : 'text-brand-cyan border-brand-cyan/30'}`}>{p.wordCount} WORDS</span>
                  </div>
                  <div className="flex gap-3">
                    {p.status === 'done' && (
                      <>
                        <button onClick={() => togglePlayPart(p)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${currentlyPlayingId === p.id ? 'bg-brand-cyan text-black' : 'bg-white text-black'}`}>
                          {currentlyPlayingId === p.id ? <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2"/></svg> : <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/></svg>}
                        </button>
                        <button onClick={() => downloadPart(p)} className="w-12 h-12 bg-white/10 text-white rounded-full flex items-center justify-center border border-white/20 hover:bg-white/20">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                        </button>
                      </>
                    )}
                    {p.status === 'error' && (
                      <button onClick={() => retryPart(idx)} className="w-12 h-12 bg-red-500/20 text-red-500 border border-red-500/50 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-white/60 text-sm font-bold italic leading-relaxed line-clamp-2 mb-6 transition-colors">"{p.text}"</p>
                {p.status === 'loading' && (
                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-brand-cyan">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 border-2 border-brand-cyan/20 border-t-brand-cyan rounded-full animate-spin"></div>
                        SYNTHESIZING...
                      </div>
                      <span>{Math.round(p.currentProgress || 0)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-brand-cyan transition-all duration-300" style={{ width: `${p.currentProgress || 0}%` }}></div>
                    </div>
                  </div>
                )}
                {p.status === 'done' && (
                   <div className="mt-4 flex items-center gap-3">
                      <div className="h-1 flex-grow bg-white/10 rounded-full overflow-hidden">
                         <div className={`h-full bg-brand-cyan w-full ${currentlyPlayingId === p.id ? 'animate-[shimmer_1s_infinite]' : 'animate-pulse'} shadow-[0_0_10px_#00F0FF]`}></div>
                      </div>
                      <span className="text-[10px] font-black text-brand-cyan uppercase tracking-widest">{currentlyPlayingId === p.id ? 'PLAYING' : 'READY'}</span>
                   </div>
                )}
                {p.status === 'error' && p.error && (
                  <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                    <p className="text-[9px] font-black text-red-500 uppercase mb-1">ERROR:</p>
                    <p className="text-[10px] font-bold text-red-400 leading-tight">{p.error}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      <style>{`
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }
      `}</style>
    </div>
  );
};

export default ScriptGenerator;
