'use client';

import { ApiStatusDot } from './ApiStatusDot';
import { Github, ExternalLink, Home, Compass } from 'lucide-react';
import { MUSEUM_EXHIBITS } from '../museumData';

interface MuseumHUDProps {
  currentView: string;
  isMacro: boolean;
  onSelectRoom: (roomId: string) => void;
  onReturnToFoyer: () => void;
}

export function MuseumHUD({ currentView, isMacro, onSelectRoom, onReturnToFoyer }: MuseumHUDProps) {
  const activeExhibit = MUSEUM_EXHIBITS.find((e) => e.id === currentView);

  return (
    <>
      {/* Top Left Branding & Navigation HUD */}
      <div className="fixed top-6 left-6 z-40 flex items-center gap-3">
        <div className="px-4 py-2.5 rounded-2xl bg-stone-950/85 backdrop-blur-xl border border-amber-500/30 text-stone-100 shadow-2xl flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
          <div>
            <h1 className="text-xs font-bold font-mono tracking-widest text-amber-400 uppercase">CRYPTOGRAPHY MUSEUM</h1>
            <p className="text-[10px] text-stone-400 font-sans">
              {currentView === 'atrium' ? 'Central Atrium Foyer' : activeExhibit?.name || '3D Exhibit Room'}
            </p>
          </div>
        </div>

        {/* Return to Foyer Button */}
        {currentView !== 'atrium' && (
          <button
            onClick={onReturnToFoyer}
            className="px-3.5 py-2.5 rounded-2xl bg-amber-500/90 hover:bg-amber-400 text-stone-950 font-mono text-xs font-bold flex items-center gap-2 shadow-lg transition-all"
          >
            <Home className="w-4 h-4" /> Return to Foyer
          </button>
        )}
      </div>

      {/* Top Center Quick Exploration Bar */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-40 hidden lg:flex items-center gap-1.5 p-1.5 rounded-2xl bg-stone-950/85 backdrop-blur-xl border border-amber-500/20 shadow-2xl">
        <button
          onClick={onReturnToFoyer}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all ${
            currentView === 'atrium' ? 'bg-amber-500 text-stone-950 shadow' : 'text-stone-300 hover:text-stone-100'
          }`}
        >
          FOYER
        </button>
        {MUSEUM_EXHIBITS.map((ex) => (
          <button
            key={ex.id}
            onClick={() => onSelectRoom(ex.id)}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-mono transition-all ${
              currentView === ex.id
                ? 'bg-amber-500 text-stone-950 font-bold shadow'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            {ex.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Top Right Floating HUD Links */}
      <div className="fixed top-6 right-6 z-40 flex items-center gap-3">
        {/* Repository Link Button */}
        <a
          href="https://github.com/Arjundevjha/Cryptography"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-2.5 rounded-2xl bg-stone-950/85 hover:bg-stone-900 backdrop-blur-xl border border-stone-800 text-stone-200 text-xs font-mono flex items-center gap-2 shadow-2xl transition-all"
        >
          <Github className="w-4 h-4 text-stone-300" />
          <span className="hidden sm:inline">View Repository</span>
        </a>
      </div>

      {/* 3D Exploration Hint Badge */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none px-4 py-2 rounded-full bg-stone-950/75 backdrop-blur-md border border-amber-500/20 text-stone-300 text-[11px] font-mono flex items-center gap-2 shadow-lg">
        <Compass className="w-3.5 h-3.5 text-amber-400 animate-spin" />
        <span>3D EXPLORATION: Drag to Orbit • Scroll to Zoom • Click Exhibit to Focus</span>
      </div>

      {/* Footer Minimal API Status Dot */}
      <div className="fixed bottom-6 left-6 z-40">
        <ApiStatusDot />
      </div>
    </>
  );
}
