import React, { useState, useEffect } from 'react';
import { UploadView } from './components/UploadView';
import { SessionView } from './components/SessionView';
import { AppState, Subtitle, AISettings } from './types';

const DEFAULT_SETTINGS: AISettings = {
  provider: 'gemini',
  deepseekBaseUrl: 'https://api.deepseek.com/chat/completions',
  deepseekModel: 'deepseek-chat'
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  
  // Load settings from localStorage or use defaults
  const [aiSettings, setAiSettings] = useState<AISettings>(() => {
    try {
      const saved = localStorage.getItem('linguaLoopSettings');
      if (saved) {
        // Merge with defaults to ensure all fields exist
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error("Failed to load settings:", e);
    }
    return DEFAULT_SETTINGS;
  });

  // Save settings whenever they change
  useEffect(() => {
    localStorage.setItem('linguaLoopSettings', JSON.stringify(aiSettings));
  }, [aiSettings]);

  const handleStartSession = (file: File, parsedSubtitles: Subtitle[], settings: AISettings) => {
    setAudioFile(file);
    setSubtitles(parsedSubtitles);
    setAiSettings(settings); // Ensure latest settings are used
    setAppState(AppState.SESSION);
  };

  const handleBack = () => {
    setAppState(AppState.UPLOAD);
    setAudioFile(null);
    setSubtitles([]);
  };

  return (
    <div className="h-full w-full">
      {appState === AppState.UPLOAD && (
        <UploadView 
          onStart={handleStartSession} 
          initialSettings={aiSettings}
          onSettingsChange={setAiSettings}
        />
      )}
      {appState === AppState.SESSION && audioFile && subtitles.length > 0 && (
        <SessionView 
          audioFile={audioFile} 
          subtitles={subtitles} 
          onBack={handleBack}
          settings={aiSettings}
        />
      )}
    </div>
  );
};

export default App;