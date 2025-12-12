import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Subtitle, SessionStatus } from '../types';
import { getGrammarExplanation } from '../services/geminiService';
import { Button } from './Button';
import { Visualizer } from './Visualizer';

interface SessionViewProps {
  audioFile: File;
  subtitles: Subtitle[];
  onBack: () => void;
}

export const SessionView: React.FC<SessionViewProps> = ({ audioFile, subtitles, onBack }) => {
  const [status, setStatus] = useState<SessionStatus>(SessionStatus.IDLE);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [explanation, setExplanation] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [waitTimer, setWaitTimer] = useState(5);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize Audio URL
  useEffect(() => {
    if (audioFile) {
      audioUrlRef.current = URL.createObjectURL(audioFile);
    }
    return () => {
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [audioFile]);

  // Main Loop Logic
  const processCurrentStep = useCallback(async () => {
    if (status === SessionStatus.IDLE) return;

    const currentSub = subtitles[currentIndex];
    
    // 1. ANALYZE PHASE
    if (status === SessionStatus.ANALYZING) {
      // Pause audio if it's playing (safety check)
      if (audioRef.current) audioRef.current.pause();

      const explanationResult = await getGrammarExplanation(currentSub.text);
      setExplanation(explanationResult);
      setStatus(SessionStatus.PLAYING);
    } 
    // 2. PLAYING PHASE is handled by the useEffect watching 'status' below
    // 3. WAITING PHASE is handled by the useEffect watching 'status' below

  }, [currentIndex, subtitles, status]);

  // Effect to trigger logic based on status changes
  useEffect(() => {
    if (status === SessionStatus.ANALYZING) {
      processCurrentStep();
    } 
    else if (status === SessionStatus.PLAYING) {
      if (audioRef.current) {
        const currentSub = subtitles[currentIndex];
        // Ensure we seek to start only if we aren't already there (avoids stutter if re-rendering)
        if (Math.abs(audioRef.current.currentTime - currentSub.startTime) > 0.5) {
             audioRef.current.currentTime = currentSub.startTime;
        }
        audioRef.current.play().catch(e => console.error("Playback failed", e));
      }
    }
    else if (status === SessionStatus.WAITING) {
      if (audioRef.current) audioRef.current.pause();
      setWaitTimer(5);
      
      timerRef.current = window.setInterval(() => {
        setWaitTimer(prev => {
          if (prev <= 1) {
            // Timer finished
            if (timerRef.current) clearInterval(timerRef.current);
            moveToNextSubtitle();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [status, currentIndex, subtitles, processCurrentStep]);

  // Audio Progress Monitor (The loop breaker)
  useEffect(() => {
    const checkTime = () => {
      if (status === SessionStatus.PLAYING && audioRef.current) {
        const currentSub = subtitles[currentIndex];
        const currentTime = audioRef.current.currentTime;
        
        // Update progress bar
        const totalDuration = currentSub.endTime - currentSub.startTime;
        const currentProgress = ((currentTime - currentSub.startTime) / totalDuration) * 100;
        setProgress(Math.min(Math.max(currentProgress, 0), 100));

        // Check if finished
        if (currentTime >= currentSub.endTime) {
          audioRef.current.pause();
          setStatus(SessionStatus.WAITING);
        } else {
          animationFrameRef.current = requestAnimationFrame(checkTime);
        }
      }
    };

    if (status === SessionStatus.PLAYING) {
      animationFrameRef.current = requestAnimationFrame(checkTime);
    } else {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [status, currentIndex, subtitles]);

  const moveToNextSubtitle = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= subtitles.length) {
      setCurrentIndex(0); // Loop back to start
    } else {
      setCurrentIndex(nextIndex);
    }
    setExplanation(''); // Clear previous explanation
    setStatus(SessionStatus.ANALYZING);
  };

  const handleStartStop = () => {
    if (status === SessionStatus.IDLE) {
      setStatus(SessionStatus.ANALYZING);
    } else {
      // Stop everything
      setStatus(SessionStatus.IDLE);
      if (audioRef.current) audioRef.current.pause();
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleManualNext = () => {
     if (timerRef.current) clearInterval(timerRef.current);
     moveToNextSubtitle();
  };

  const currentSubtitle = subtitles[currentIndex];

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors">
            ← Back
          </button>
          <h2 className="text-xl font-semibold">Session Active</h2>
        </div>
        <div className="text-sm text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-700">
          Subtitle {currentIndex + 1} / {subtitles.length}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Panel: Content Display */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
            
            {/* Status Indicator Pill */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2">
                {status === SessionStatus.ANALYZING && (
                    <span className="bg-indigo-500/20 text-indigo-300 px-4 py-1.5 rounded-full text-sm font-medium border border-indigo-500/30 animate-pulse flex items-center gap-2">
                         <span className="w-2 h-2 bg-indigo-400 rounded-full animate-ping"/> AI Analyzing...
                    </span>
                )}
                {status === SessionStatus.WAITING && (
                    <span className="bg-amber-500/20 text-amber-300 px-4 py-1.5 rounded-full text-sm font-medium border border-amber-500/30 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Next in {waitTimer}s
                    </span>
                )}
                 {status === SessionStatus.PLAYING && (
                    <span className="bg-emerald-500/20 text-emerald-300 px-4 py-1.5 rounded-full text-sm font-medium border border-emerald-500/30 flex items-center gap-2">
                         <Visualizer isActive={true} /> Playing
                    </span>
                )}
            </div>

            {/* Subtitle Card */}
            <div className="w-full max-w-3xl space-y-8">
                <div className="bg-slate-800/80 backdrop-blur-md p-8 rounded-2xl border border-slate-700 shadow-xl text-center min-h-[200px] flex flex-col justify-center items-center">
                    <p className="text-3xl md:text-4xl font-bold leading-relaxed text-slate-100">
                        "{currentSubtitle?.text}"
                    </p>
                </div>

                {/* AI Explanation Card */}
                <div className={`transition-all duration-500 transform ${explanation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="bg-indigo-900/30 border border-indigo-500/30 p-6 rounded-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                        <h3 className="text-indigo-300 text-sm font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
                             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                             AI Tutor
                        </h3>
                        <p className="text-slate-200 text-lg leading-relaxed">
                            {explanation}
                        </p>
                    </div>
                </div>
            </div>
        </div>

      </div>

      {/* Footer Controls */}
      <div className="bg-slate-800 border-t border-slate-700 p-6">
        <div className="max-w-4xl mx-auto flex flex-col gap-4">
            {/* Progress Bar for Current Subtitle */}
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-indigo-500 transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="flex items-center justify-center gap-6">
                <Button 
                    variant={status === SessionStatus.IDLE ? 'primary' : 'secondary'}
                    onClick={handleStartStop}
                    className="min-w-[140px]"
                >
                    {status === SessionStatus.IDLE ? 'Resume Session' : 'Pause Session'}
                </Button>

                {status !== SessionStatus.IDLE && (
                   <button 
                     onClick={handleManualNext}
                     className="text-slate-400 hover:text-white underline text-sm"
                   >
                     Skip to next &rarr;
                   </button>
                )}
            </div>
        </div>
      </div>

      {/* Hidden Audio Element */}
      {audioUrlRef.current && (
        <audio 
            ref={audioRef} 
            src={audioUrlRef.current} 
            preload="auto"
        />
      )}
    </div>
  );
};