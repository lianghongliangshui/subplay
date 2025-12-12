import React, { useState } from 'react';
import { Button } from './Button';
import { parseSRT } from '../services/srtParser';
import { Subtitle, AISettings } from '../types';
import { SettingsModal } from './SettingsModal';

interface UploadViewProps {
  onStart: (audioFile: File, subtitles: Subtitle[], settings: AISettings) => void;
  initialSettings: AISettings;
  onSettingsChange: (settings: AISettings) => void;
}

export const UploadView: React.FC<UploadViewProps> = ({ onStart, initialSettings, onSettingsChange }) => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [srtFileName, setSrtFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  const handleSrtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSrtFileName(file.name);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        try {
          const parsed = parseSRT(text);
          if (parsed.length === 0) {
            setError("No subtitles found in this file. Please check the format.");
          } else {
            setSubtitles(parsed);
            setError(null);
          }
        } catch (err) {
          setError("Failed to parse SRT file.");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleStart = () => {
    if (audioFile && subtitles.length > 0) {
      onStart(audioFile, subtitles, initialSettings);
    } else {
      setError("Please upload both an MP3 and a valid SRT file.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 max-w-2xl mx-auto w-full relative">
      <div className="absolute top-6 right-6">
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white p-2.5 rounded-full transition-all border border-slate-700"
          title="AI Settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
      </div>

      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 mb-4">
          LinguaLoop AI
        </h1>
        <p className="text-slate-400 text-lg">
          Master languages by looping audio with AI-powered grammar insights.
        </p>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-8 rounded-2xl w-full shadow-2xl">
        <div className="space-y-6">
          
          {/* Audio Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">1. Upload Audio (MP3)</label>
            <div className="relative group">
              <input
                type="file"
                accept=".mp3,audio/*"
                onChange={handleAudioChange}
                className="block w-full text-sm text-slate-400
                  file:mr-4 file:py-2.5 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-500/10 file:text-indigo-400
                  hover:file:bg-indigo-500/20
                  cursor-pointer bg-slate-900/50 rounded-lg border border-slate-700 focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* SRT Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">2. Upload Subtitles (SRT)</label>
            <div className="relative group">
              <input
                type="file"
                accept=".srt"
                onChange={handleSrtChange}
                className="block w-full text-sm text-slate-400
                  file:mr-4 file:py-2.5 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-cyan-500/10 file:text-cyan-400
                  hover:file:bg-cyan-500/20
                  cursor-pointer bg-slate-900/50 rounded-lg border border-slate-700 focus:border-cyan-500 focus:outline-none transition-colors"
              />
            </div>
            {srtFileName && subtitles.length > 0 && (
              <p className="text-xs text-green-400 mt-1 flex items-center">
                <span className="mr-1">✓</span> Loaded {subtitles.length} subtitles
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="pt-4">
            <Button 
              onClick={handleStart} 
              disabled={!audioFile || subtitles.length === 0} 
              className="w-full py-3 text-lg"
            >
              Start Learning Session
            </Button>
          </div>
        </div>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        settings={initialSettings}
        onSave={onSettingsChange}
      />
    </div>
  );
};