import React from 'react';
import { TreeMorphState } from '../types';

interface UIOverlayProps {
  morphState: TreeMorphState;
  setMorphState: (state: TreeMorphState) => void;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({ morphState, setMorphState }) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 md:p-8 z-10 text-white font-sans">
      
      {/* Top Bar: Title Only */}
      <div className="flex justify-between items-start w-full">
        {/* Header */}
        <div className="flex flex-col items-start gap-2 animate-in fade-in duration-1000">
          <h1 className="flex flex-col text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            <span>Oli's</span>
            <span>XmasTree</span>
          </h1>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_#4ade80]" />
            <span className="text-xs md:text-sm tracking-[0.2em] text-cyan-300" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
              SYSTEM ONLINE // Y2K_EDITION
            </span>
          </div>
        </div>
      </div>

      {/* Footer / Decorative Elements + Controls Centered */}
      <div className="flex justify-between items-end w-full relative">
        <div className="hidden md:flex flex-col gap-1 text-[10px] text-pink-500/70" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
          <span>COORDINATES: {Math.random().toFixed(4)} / {Math.random().toFixed(4)}</span>
          <span>MEMORY: 64TB</span>
        </div>

        {/* Center Group: Controls + Hint */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 flex flex-col items-center gap-4">
          
          {/* Controls - Bottom Center & Small */}
          <div className="pointer-events-auto">
            <div className="backdrop-blur-md bg-black/30 border border-white/10 p-0.5 rounded-full shadow-[0_0_20px_rgba(255,0,127,0.2)] scale-75 origin-bottom">
              <div className="flex bg-black/50 rounded-full p-0.5 relative overflow-hidden">
                {/* Sliding Background */}
                <div 
                  className={`absolute top-0.5 bottom-0.5 w-1/2 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(236,72,153,0.6)] ${
                    morphState === TreeMorphState.TREE_SHAPE ? 'left-1/2' : 'left-0'
                  }`} 
                />
                
                <button
                  onClick={() => setMorphState(TreeMorphState.SCATTERED)}
                  className={`relative z-10 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest transition-colors duration-300 ${
                    morphState === TreeMorphState.SCATTERED ? 'text-white' : 'text-gray-400 hover:text-white'
                  }`}
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  CHAOS
                </button>
                <button
                  onClick={() => setMorphState(TreeMorphState.TREE_SHAPE)}
                  className={`relative z-10 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest transition-colors duration-300 ${
                    morphState === TreeMorphState.TREE_SHAPE ? 'text-white' : 'text-gray-400 hover:text-white'
                  }`}
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  ORDER
                </button>
              </div>
            </div>
          </div>

          <div className="text-[9px] text-gray-500 tracking-widest uppercase text-center whitespace-nowrap mb-1">
             Drag to Rotate &bull; Scroll to Zoom
          </div>
        </div>
        
        <div className="flex gap-4">
           {/* Decorative visualizers */}
           {[1, 2, 3].map((i) => (
             <div key={i} className="w-1 h-8 bg-gradient-to-t from-transparent to-cyan-400/50 animate-pulse" style={{ animationDelay: `${i * 0.2}s`}} />
           ))}
        </div>
      </div>
    </div>
  );
};