export interface Subtitle {
  id: number;
  startTime: number; // in seconds
  endTime: number; // in seconds
  text: string;
}

export enum AppState {
  UPLOAD = 'UPLOAD',
  SESSION = 'SESSION',
}

export enum SessionStatus {
  IDLE = 'IDLE',        // Initial state or paused manually
  ANALYZING = 'ANALYZING', // Sending text to AI
  PLAYING = 'PLAYING',   // Audio is playing
  WAITING = 'WAITING',   // 5-second pause
}
