import React, { useState } from 'react';
import { UploadView } from './components/UploadView';
import { SessionView } from './components/SessionView';
import { AppState, Subtitle } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);

  const handleStartSession = (file: File, parsedSubtitles: Subtitle[]) => {
    setAudioFile(file);
    setSubtitles(parsedSubtitles);
    setAppState(AppState.SESSION);
  };

  const handleBack = () => {
    setAppState(AppState.UPLOAD);
    // Optional: clear state if you want a fresh start
    setAudioFile(null);
    setSubtitles([]);
  };

  return (
    <div className="h-full w-full">
      {appState === AppState.UPLOAD && (
        <UploadView onStart={handleStartSession} />
      )}
      {appState === AppState.SESSION && audioFile && subtitles.length > 0 && (
        <SessionView 
          audioFile={audioFile} 
          subtitles={subtitles} 
          onBack={handleBack} 
        />
      )}
    </div>
  );
};

export default App;