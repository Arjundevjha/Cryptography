'use client';

import { useState, useEffect } from 'react';
import ThreeMuseumScene from './ThreeMuseumScene';
import { AudioSystem } from './AudioSystem';
import { MUSEUM_EXHIBITS } from './museumData';
import { MuseumHUD } from './hud/MuseumHUD';
import { WorkbenchPanel } from './workbench/WorkbenchPanel';
import { ArtifactMetadataDrawer } from './workbench/ArtifactMetadataDrawer';
import { BookOpen, History, ShieldAlert, ZoomIn, ArrowRight, Sparkles } from 'lucide-react';

export function MuseumCanvas() {
  const [isClient, setIsClient] = useState(false);
  const [currentView, setCurrentView] = useState<string>('atrium');
  const [isMacro, setIsMacro] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const activeExhibit = MUSEUM_EXHIBITS.find((e) => e.id === currentView);

  const handleSelectRoom = (roomId: string) => {
    setCurrentView(roomId);
    setIsMacro(false);
  };

  const handleReturnToFoyer = () => {
    setCurrentView('atrium');
    setIsMacro(false);
  };

  const handleCaseClick = (roomId: string) => {
    setCurrentView(roomId);
    setIsMacro(true);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none" style={{ background: '#d4e5f7' }}>
      {/* === FULL-SCREEN 3D WEBGL CANVAS (Layer 0) === */}
      {isClient && (
        <ThreeMuseumScene
          currentView={currentView}
          isMacro={isMacro}
          onSelectRoom={handleSelectRoom}
          onCaseClick={handleCaseClick}
        />
      )}

      {/* === SCREEN-SPACE HUD OVERLAYS (Layer 1) === */}
      <MuseumHUD
        currentView={currentView}
        isMacro={isMacro}
        onSelectRoom={handleSelectRoom}
        onReturnToFoyer={handleReturnToFoyer}
      />

      {/* Spatial Audio */}
      <AudioSystem currentView={currentView} />

      {/* === ATRIUM EXHIBIT SELECTION CARDS (Bottom strip, not covering 3D) === */}
      {currentView === 'atrium' && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-20 w-full max-w-5xl px-4 pointer-events-none">
          <div className="pointer-events-auto">
            {/* Atrium title */}
            <div className="text-center mb-4">
              <div className="inline-block px-6 py-3 rounded-2xl bg-white/80 backdrop-blur-xl border border-amber-400/30 shadow-xl">
                <h2 className="text-lg font-extrabold font-mono text-amber-700 tracking-widest uppercase flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" /> GRAND CRYPTOGRAPHIC ATRIUM
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Click any exhibit to enter its 3D curatorial room
                </p>
              </div>
            </div>

            {/* Exhibit cards grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {MUSEUM_EXHIBITS.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => handleSelectRoom(ex.id)}
                  className="p-2.5 rounded-xl bg-white/85 backdrop-blur-md hover:bg-white border border-stone-200 hover:border-amber-400 transition-all text-left group shadow-md hover:shadow-lg"
                >
                  <div className="text-[9px] font-mono text-amber-600 font-bold uppercase tracking-wider">{ex.category}</div>
                  <div className="text-xs font-bold text-stone-800 group-hover:text-amber-700 transition-colors">{ex.name}</div>
                  <div className="text-[9px] text-stone-400 font-mono mt-1 flex items-center justify-between">
                    <span>{ex.timeline.split('–')[0]}</span>
                    <span className="text-amber-500 font-bold flex items-center gap-0.5">
                      EXPLORE <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* === CURATORIAL EXHIBITION PANEL (Left side, inside exhibit rooms) === */}
      {activeExhibit && currentView !== 'atrium' && (
        <div className="fixed top-24 left-4 z-20 w-80 max-h-[calc(100vh-140px)] overflow-y-auto pointer-events-auto">
          <div className="bg-white/90 backdrop-blur-xl border border-stone-200 shadow-2xl rounded-2xl p-5 space-y-3 text-stone-800">
            {/* Header */}
            <div className="pb-2 border-b border-stone-200">
              <span className="text-[9px] font-mono tracking-widest text-amber-600 uppercase font-bold">{activeExhibit.wing}</span>
              <h2 className="text-lg font-extrabold text-stone-900 mt-0.5">{activeExhibit.name}</h2>
              <p className="text-[11px] text-stone-500 italic">{activeExhibit.subtitle}</p>
            </div>

            {/* Curatorial Overview */}
            <div className="space-y-1">
              <h3 className="text-[11px] font-mono text-amber-700 uppercase tracking-wider flex items-center gap-1.5 font-bold">
                <BookOpen className="w-3.5 h-3.5 text-amber-500 shrink-0" /> CURATORIAL OVERVIEW
              </h3>
              <p className="text-[11px] text-stone-600 leading-relaxed">{activeExhibit.description}</p>
            </div>

            {/* Historical Era */}
            <div className="space-y-1">
              <h3 className="text-[11px] font-mono text-amber-700 uppercase tracking-wider flex items-center gap-1.5 font-bold">
                <History className="w-3.5 h-3.5 text-amber-500 shrink-0" /> HISTORICAL ERA & ORIGIN
              </h3>
              <p className="text-[11px] text-stone-600 leading-relaxed">{activeExhibit.historicalContext}</p>
              <div className="inline-block px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-[10px] font-mono text-amber-700 font-semibold">
                Timeline: {activeExhibit.timeline}
              </div>
            </div>

            {/* Cryptanalytic Vulnerabilities */}
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 space-y-1">
              <h3 className="text-[11px] font-mono text-red-600 uppercase tracking-wider flex items-center gap-1.5 font-bold">
                <ShieldAlert className="w-3.5 h-3.5 text-red-500 shrink-0" /> CRYPTANALYTIC VULNERABILITIES
              </h3>
              <p className="text-[11px] text-red-700/80 leading-relaxed">{activeExhibit.vulnerabilities}</p>
            </div>

            {/* Macro Inspect Button */}
            <button
              onClick={() => handleCaseClick(activeExhibit.id)}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold text-[11px] uppercase tracking-wider font-mono flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
            >
              <ZoomIn className="w-3.5 h-3.5" /> Inspect Display Case
            </button>
          </div>
        </div>
      )}

      {/* === WORKBENCH PANEL (Right side, inside exhibit rooms) === */}
      {activeExhibit && (
        <div className="fixed top-24 right-4 z-20 pointer-events-auto">
          <WorkbenchPanel exhibit={activeExhibit} />
        </div>
      )}

      {/* === MACRO METADATA DRAWER === */}
      {activeExhibit && isMacro && (
        <ArtifactMetadataDrawer exhibit={activeExhibit} onClose={() => setIsMacro(false)} />
      )}
    </div>
  );
}
