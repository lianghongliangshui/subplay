import { Subtitle } from '../types';

const timeToSeconds = (timeString: string): number => {
  const parts = timeString.split(':');
  if (parts.length < 3) return 0;

  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const secondsParts = parts[2].split(',');
  const seconds = parseInt(secondsParts[0], 10);
  const milliseconds = parseInt(secondsParts[1] || '0', 10);

  return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
};

export const parseSRT = (data: string): Subtitle[] => {
  const normalizedData = data.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = normalizedData.split('\n\n');
  
  const subtitles: Subtitle[] = [];

  blocks.forEach((block) => {
    const lines = block.split('\n').filter(line => line.trim() !== '');
    if (lines.length >= 3) {
      // Line 1: ID (sometimes optional in loose parsers, but standard in SRT)
      // Line 2: Timecode
      // Line 3+: Text
      
      const timecodeLineIndex = lines[0].includes('-->') ? 0 : 1;
      
      if (lines[timecodeLineIndex] && lines[timecodeLineIndex].includes('-->')) {
        const timeParts = lines[timecodeLineIndex].split(' --> ');
        if (timeParts.length === 2) {
          const startTime = timeToSeconds(timeParts[0].trim());
          const endTime = timeToSeconds(timeParts[1].trim());
          
          // Join the rest of the lines as text
          const textLines = lines.slice(timecodeLineIndex + 1);
          const text = textLines.join(' ').replace(/<[^>]*>/g, ''); // Remove HTML tags if any

          subtitles.push({
            id: subtitles.length + 1,
            startTime,
            endTime,
            text: text.trim(),
          });
        }
      }
    }
  });

  return subtitles;
};