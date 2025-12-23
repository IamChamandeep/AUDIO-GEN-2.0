
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { STORY_CONTENT } from '../constants';
import { PlaybackStatus } from '../types';
import { generateStorySpeech } from '../services/geminiService';

const StoryPlayer: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>(PlaybackStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
  };

  const stopAudio = useCallback(() => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) {
        // Source already stopped
      }
      sourceNodeRef.current = null;
    }
    setPlaybackStatus(PlaybackStatus.IDLE);
  }, []);

  const playParagraph = async (index: number) => {
    initAudio();
    stopAudio();
    
    setPlaybackStatus(PlaybackStatus.LOADING);
    setError(null);
    setCurrentIdx(index);

    try {
      const text = STORY_CONTENT[index].text;
      const audioBuffer = await generateStorySpeech(text, audioContextRef.current!);
      
      const source = audioContextRef.current!.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current!.destination);
      
      source.onended = () => {
        setPlaybackStatus(PlaybackStatus.IDLE);
      };

      source.start();
      sourceNodeRef.current = source;
      setPlaybackStatus(PlaybackStatus.PLAYING);
    } catch (err: any) {
      setError(err.message || "Failed to generate audio.");
      setPlaybackStatus(PlaybackStatus.IDLE);
    }
  };

  const handleNext = () => {
    if (currentIdx < STORY_CONTENT.length - 1) {
      playParagraph(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      playParagraph(currentIdx - 1);
    }
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  return (
    <div className="max-w-4xl mx-auto px-6 pb-24">
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
        <div className="h-1 bg-slate-700 w-full">
          <div 
            className="h-full bg-indigo-500 transition-all duration-500 ease-out" 
            style={{ width: `${((currentIdx + 1) / STORY_CONTENT.length) * 100}%` }}
          />
        </div>

        <div className="p-8 md:p-12">
          <div className="min-h-[250px] flex flex-col justify-center">
            <p className="hindi-text text-2xl md:text-3xl font-medium text-slate-100 leading-relaxed mb-8">
              {STORY_CONTENT[currentIdx].text}
            </p>
            
            {error && (
              <div className="bg-red-900/20 border border-red-500/50 text-red-400 p-4 rounded-lg text-sm mb-6 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}
          </div>

          <div className="mt-12 flex flex-col items-center gap-6">
            <div className="flex items-center justify-center gap-6 md:gap-10">
              <button 
                onClick={handlePrev}
                disabled={currentIdx === 0 || playbackStatus === PlaybackStatus.LOADING}
                className="p-3 text-slate-400 hover:text-slate-100 hover:bg-slate-700 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Previous Paragraph"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                </svg>
              </button>

              <button 
                onClick={() => playbackStatus === PlaybackStatus.PLAYING ? stopAudio() : playParagraph(currentIdx)}
                disabled={playbackStatus === PlaybackStatus.LOADING}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all transform active:scale-95 shadow-xl ${
                  playbackStatus === PlaybackStatus.PLAYING 
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/20' 
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/20'
                } disabled:opacity-50 disabled:cursor-wait`}
              >
                {playbackStatus === PlaybackStatus.LOADING ? (
                  <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : playbackStatus === PlaybackStatus.PLAYING ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              <button 
                onClick={handleNext}
                disabled={currentIdx === STORY_CONTENT.length - 1 || playbackStatus === PlaybackStatus.LOADING}
                className="p-3 text-slate-400 hover:text-slate-100 hover:bg-slate-700 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Next Paragraph"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.599 7.2A1 1 0 005 8v8a1 1 0 001.599.8l5.334-4zM19.933 12.8a1 1 0 000-1.6l-5.334-4A1 1 0 0013 8v8a1 1 0 001.599.8l5.334-4z" />
                </svg>
              </button>
            </div>
            
            <div className="text-slate-500 font-medium tracking-wider">
              PARAGRAPH {currentIdx + 1} / {STORY_CONTENT.length}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-20">
        <h2 className="text-2xl font-bold text-slate-100 mb-8 flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
          Read Full Story
        </h2>
        <div className="space-y-6">
          {STORY_CONTENT.map((para, index) => (
            <div 
              key={para.id} 
              onClick={() => playParagraph(index)}
              className={`p-6 rounded-xl border cursor-pointer transition-all duration-300 ${
                index === currentIdx 
                ? 'bg-indigo-950/30 border-indigo-500/50 shadow-lg shadow-indigo-500/5' 
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-4">
                <span className={`text-sm font-bold w-6 h-6 flex items-center justify-center rounded shrink-0 ${
                  index === currentIdx ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500'
                }`}>
                  {index + 1}
                </span>
                <p className={`hindi-text text-lg leading-relaxed ${
                  index === currentIdx ? 'text-indigo-100' : 'text-slate-400'
                }`}>
                  {para.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoryPlayer;
