import React from 'react';

interface VisualizerProps {
  isActive: boolean;
}

export const Visualizer: React.FC<VisualizerProps> = ({ isActive }) => {
  return (
    <div className="flex justify-center items-end gap-1 h-12 w-full max-w-[200px]">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className={`w-2 bg-indigo-400 rounded-full transition-all duration-300 ${isActive ? 'animate-pulse' : 'h-1'}`}
          style={{
            height: isActive ? `${Math.random() * 100}%` : '4px',
            animationDelay: `${i * 0.1}s`,
            opacity: isActive ? 1 : 0.3
          }}
        />
      ))}
    </div>
  );
};