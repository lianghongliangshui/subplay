import React, { useRef, useState } from 'react';
import { Button } from './Button';
import { parseSRT } from '../services/srtParser';
import { Subtitle } from '../types';

interface UploadViewProps {
  onStart: (audioFile: File, subtitles: Subtitle[]) => void;
}

export const UploadView: React.FC<UploadViewProps> = ({ onStart }) => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [srtFileName, setSrtFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      onStart(audioFile, subtitles);
    } else {
      setError("Please upload both an MP3 and a valid SRT file.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 max-w-2xl mx-auto w-full">
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
    </div>
  );
};