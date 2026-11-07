'use client';

import { useState, useEffect } from 'react';
import { ApiStatusDot } from './ApiStatusDot';
import { Github, Home, Compass, Map, X, Navigation, GraduationCap } from 'lucide-react';
import { MUSEUM_EXHIBITS, MUSEUM_WINGS, MUSEUM_STATUES } from '../museumData';

interface MuseumHUDProps {
  currentView: string;
  isMacro: boolean;
  onSelectRoom: (roomId: string) => void;
  onReturnToFoyer: () => void;
  isTourActive?: boolean;
  onToggleTour?: () => void;
}

export function MuseumHUD({
  currentView,
  isMacro,
  onSelectRoom,
  onReturnToFoyer,
  isTourActive = false,
  onToggleTour,
}: MuseumHUDProps) {
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showMap) {
        setShowMap(false);
        return;
      }
      if (e.key === 'm' || e.key === 'M') {
        if (e.ctrlKey || e.altKey || e.metaKey) return;
        const target = e.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.tagName === 'SELECT' ||
            target.isContentEditable)
        ) {
          return;
        }
        setShowMap((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showMap]);

  const activeExhibit = MUSEUM_EXHIBITS.find((e) => e.id === currentView);
  const activeWing = MUSEUM_WINGS.find((w) => w.id === currentView);
  const activeStatue = MUSEUM_STATUES.find((s) => s.id === currentView);

  const getSubtext = () => {
    if (currentView === 'atrium') return 'Grand Entrance Rotunda';
    if (activeStatue) return `Pioneer Monument • ${activeStatue.name} (${activeStatue.lifespan})`;
    if (activeWing) return activeWing.name;
    if (activeExhibit) return `${activeExhibit.wing} • ${activeExhibit.name}`;
    return 'Permanent Collection';
  };

  return (
    <>
      {/* Unified Non-Overlapping 3-Zone Top Header HUD */}
      <header className="select-none fixed top-4 inset-x-4 sm:inset-x-5 z-40 flex items-center justify-between gap-2 pointer-events-none">
        {/* Left Zone: Branding & Return to Lobby */}
        <div className="pointer-events-auto flex items-center gap-2 min-w-0">
          <div className="px-3.5 py-2 rounded-2xl bg-[#161412]/92 backdrop-blur-xl border border-amber-500/30 text-stone-100 shadow-2xl flex items-center gap-2.5 min-w-0">
            <span className="text-amber-400 text-sm leading-none shrink-0" aria-hidden="true">
              ◈
            </span>
            <div className="min-w-0">
              <h1 className="font-display text-xs sm:text-sm font-semibold tracking-wider text-amber-300 truncate">
                CRYPTOGRAPHY MUSEUM
              </h1>
              <p className="text-[11px] text-stone-300 font-sans truncate max-w-[200px] xl:max-w-[260px]">
                {getSubtext()}
              </p>
            </div>
          </div>

          {/* Return to Lobby Button */}
          {currentView !== 'atrium' && (
            <button
              onClick={onReturnToFoyer}
              aria-label="Lobby Entrance"
              title="Return to Lobby Entrance"
              className="px-3 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-sans text-xs font-semibold flex items-center gap-1.5 shadow-lg transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
            >
              <Home className="w-4 h-4 shrink-0" />
              <span className="hidden 2xl:inline">Lobby Entrance</span>
              <span className="inline 2xl:hidden">Foyer</span>
            </button>
          )}
        </div>

        {/* Center Zone: Wing & Navigation Bar */}
        <nav
          aria-label="Museum wings and tools"
          className="pointer-events-auto hidden lg:flex items-center gap-1 p-1.5 rounded-2xl bg-[#161412]/92 backdrop-blur-xl border border-amber-500/25 shadow-2xl shrink-0"
        >
          <button
            onClick={onReturnToFoyer}
            aria-current={currentView === 'atrium' ? 'page' : undefined}
            className={`px-3 py-1.5 rounded-xl text-xs font-sans font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
              currentView === 'atrium' ? 'bg-amber-500 text-stone-950 shadow-sm font-bold' : 'text-stone-300 hover:text-stone-100'
            }`}
          >
            Lobby
          </button>

          {MUSEUM_WINGS.map((wing) => (
            <button
              key={wing.id}
              onClick={() => onSelectRoom(wing.id)}
              aria-current={currentView === wing.id ? 'page' : undefined}
              className={`px-3 py-1.5 rounded-xl text-xs font-sans font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                currentView === wing.id ? 'bg-amber-500 text-stone-950 shadow-sm font-bold' : 'text-stone-300 hover:text-stone-100'
              }`}
            >
              {wing.category} Wing
            </button>
          ))}

          <div className="w-px h-4 bg-stone-800 mx-1" />

          {onToggleTour && (
            <button
              onClick={onToggleTour}
              aria-pressed={isTourActive}
              aria-label="Toggle guided historical tour"
              className={`px-3 py-1.5 rounded-xl text-xs font-sans font-semibold flex items-center gap-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                isTourActive
                  ? 'bg-amber-400 text-stone-950 font-bold'
                  : 'bg-[#24201c] hover:bg-[#322d27] text-amber-300 border border-amber-500/25'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" /> Guided Tour
            </button>
          )}

          {/* Toggle 2D Mini-Map */}
          <button
            onClick={() => setShowMap(!showMap)}
            aria-expanded={showMap}
            aria-label="Toggle 2D museum floorplan map"
            className={`px-3 py-1.5 rounded-xl text-xs font-sans font-semibold flex items-center gap-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
              showMap ? 'bg-amber-400 text-stone-950 font-bold' : 'bg-[#24201c] hover:bg-[#322d27] text-amber-300 border border-amber-500/25'
            }`}
          >
            <Map className="w-3.5 h-3.5" /> 2D Map <span className="text-[10px] font-mono opacity-80">[M]</span>
          </button>
        </nav>

        {/* Right Zone: Floating HUD Links & Compact Mobile Actions */}
        <div className="pointer-events-auto flex items-center gap-2 shrink-0">
          {onToggleTour && (
            <button
              onClick={onToggleTour}
              aria-pressed={isTourActive}
              aria-label="Start or stop guided tour"
              className={`lg:hidden px-3 py-2 rounded-2xl text-xs font-sans font-semibold flex items-center gap-1.5 backdrop-blur-xl border shadow-xl transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                isTourActive
                  ? 'bg-amber-400 text-stone-950 border-amber-300'
                  : 'bg-[#161412]/92 text-amber-300 border-amber-500/30'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span className="hidden sm:inline">Tour</span>
            </button>
          )}

          <a
            href="https://github.com/Arjundevjha/Cryptography"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View repository on GitHub"
            className="px-3 py-2 rounded-2xl bg-[#161412]/92 hover:bg-stone-900 backdrop-blur-xl border border-stone-800 text-stone-200 text-xs font-sans font-medium flex items-center gap-2 shadow-2xl transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
          >
            <Github className="w-4 h-4 text-stone-300" />
            <span className="hidden xl:inline">View Repository</span>
          </a>
        </div>
      </header>

      {/* 2D INTERACTIVE MUSEUM FLOORPLAN MAP DRAWER */}
      {showMap && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Interactive Museum Floorplan Map"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowMap(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <div className="relative w-full max-w-4xl bg-[#161412] border border-amber-500/35 rounded-3xl p-6 shadow-2xl text-stone-100 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
              <div className="flex items-center gap-2.5">
                <Navigation className="w-5 h-5 text-amber-400" />
                <div>
                  <h2 className="font-display text-base font-semibold text-amber-300 tracking-wide">
                    Architectural Floorplan Blueprint
                  </h2>
                  <p className="text-xs text-stone-400 font-sans">
                    Select any gallery chamber or rotunda monument to travel directly inside
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMap(false)}
                aria-label="Close museum floorplan map"
                className="p-2 rounded-xl bg-[#24201c] hover:bg-[#322d27] border border-stone-700/60 text-stone-300 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SVG Architectural Floorplan Graphic */}
            <div className="relative w-full h-80 bg-[#1c1916] rounded-2xl border border-amber-500/20 p-4 flex items-center justify-center overflow-hidden select-none">
              <svg viewBox="0 0 800 400" className="w-full h-full">
                {/* Architectural Blueprint Grid */}
                <pattern id="blueprint-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#332c25" strokeWidth="0.6" />
                </pattern>
                <rect width="800" height="400" fill="url(#blueprint-grid)" />

                {/* Grand Entrance Rotunda Box */}
                <rect x="275" y="294" width="250" height="88" rx="12" fill="#221e1a" stroke="#d4af37" strokeWidth="1.8" />
                <text x="400" y="312" fill="#d4af37" fontSize="11" fontFamily="Georgia, serif" fontWeight="bold" textAnchor="middle">
                  GRAND ENTRANCE ROTUNDA
                </text>

                {/* Classical Corridor (Left) */}
                <rect x="45" y="45" width="205" height="225" rx="10" fill="#0d1320" stroke="#e2c792" strokeWidth="1.4" />
                <text x="147" y="70" fill="#f3e5ab" fontSize="11" fontFamily="Georgia, serif" fontWeight="bold" textAnchor="middle">
                  CLASSICAL CIPHERS WING
                </text>
                <path d="M 250 160 L 330 294" stroke="#e2c792" strokeWidth="1.5" strokeDasharray="4 4" />

                {/* Historical Corridor (Center) */}
                <rect x="305" y="45" width="190" height="205" rx="10" fill="#0d1320" stroke="#d4af37" strokeWidth="1.4" />
                <text x="400" y="70" fill="#fcd34d" fontSize="11" fontFamily="Georgia, serif" fontWeight="bold" textAnchor="middle">
                  HISTORICAL SYSTEMS WING
                </text>
                <path d="M 400 250 L 400 294" stroke="#d4af37" strokeWidth="1.5" strokeDasharray="4 4" />

                {/* Modern Corridor (Right) */}
                <rect x="550" y="45" width="205" height="225" rx="10" fill="#0d1320" stroke="#34d399" strokeWidth="1.4" />
                <text x="652" y="70" fill="#6ee7b7" fontSize="11" fontFamily="Georgia, serif" fontWeight="bold" textAnchor="middle">
                  MODERN CRYPTOGRAPHY WING
                </text>
                <path d="M 550 160 L 470 294" stroke="#34d399" strokeWidth="1.5" strokeDasharray="4 4" />

                {/* Interactive Clickable Room Dots */}
                {MUSEUM_EXHIBITS.map((ex) => {
                  let cx = 400;
                  let cy = 200;
                  if (ex.category === 'Classical') {
                    if (['caesar', 'affine'].includes(ex.id)) {
                      cx = ex.id === 'caesar' ? 100 : 195;
                      cy = 108;
                    } else if (['vigenere', 'playfair'].includes(ex.id)) {
                      cx = ex.id === 'vigenere' ? 100 : 195;
                      cy = 160;
                    } else {
                      cx = ex.id === 'polybius' ? 100 : 195;
                      cy = 212;
                    }
                  } else if (ex.category === 'Historical') {
                    cx = ex.id === 'enigma' ? 355 : 445;
                    cy = 152;
                  } else {
                    cx = ex.id === 'rsa' ? 600 : ex.id === 'aes' ? 705 : 652;
                    cy = ex.id === 'sha256' ? 202 : 122;
                  }

                  const isActive = currentView === ex.id;

                  return (
                    <g
                      key={ex.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`Navigate to exhibit ${ex.name}`}
                      onClick={() => {
                        onSelectRoom(ex.id);
                        setShowMap(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelectRoom(ex.id);
                          setShowMap(false);
                        }
                      }}
                      className="cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
                    >
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isActive ? '9' : '7'}
                        fill={isActive ? '#d4af37' : '#1e293b'}
                        stroke={isActive ? '#fef3c7' : '#94a3b8'}
                        strokeWidth="1.8"
                      />
                      {isActive && (
                        <circle cx={cx} cy={cy} r="14" fill="none" stroke="#d4af37" strokeWidth="1.2" />
                      )}
                      <text
                        x={cx}
                        y={cy + 19}
                        fill={isActive ? '#fcd34d' : '#cbd5e1'}
                        fontSize="9.5"
                        fontFamily="sans-serif"
                        fontWeight="600"
                        textAnchor="middle"
                      >
                        {ex.name.split(' ')[0]}
                      </text>
                    </g>
                  );
                })}

                {/* All 4 Founding Pioneer Monuments in the Grand Rotunda */}
                {MUSEUM_STATUES.map((statue) => {
                  let sx = 400;
                  let sy = 335;
                  if (statue.id === 'statue-alkindi') {
                    sx = 310;
                    sy = 338;
                  } else if (statue.id === 'statue-turing') {
                    sx = 368;
                    sy = 328;
                  } else if (statue.id === 'statue-shannon') {
                    sx = 432;
                    sy = 328;
                  } else if (statue.id === 'statue-diffie-hellman') {
                    sx = 490;
                    sy = 338;
                  }

                  const isActive = currentView === statue.id;

                  return (
                    <g
                      key={statue.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`Navigate to statue monument ${statue.name}`}
                      onClick={() => {
                        onSelectRoom(statue.id);
                        setShowMap(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelectRoom(statue.id);
                          setShowMap(false);
                        }
                      }}
                      className="cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
                    >
                      <rect
                        x={sx - (isActive ? 6.5 : 5)}
                        y={sy - (isActive ? 6.5 : 5)}
                        width={isActive ? 13 : 10}
                        height={isActive ? 13 : 10}
                        transform={`rotate(45 ${sx} ${sy})`}
                        fill={isActive ? '#fcd34d' : '#b45309'}
                        stroke="#fef3c7"
                        strokeWidth="1.3"
                      />
                      {isActive && (
                        <circle cx={sx} cy={sy} r="12" fill="none" stroke="#fcd34d" strokeWidth="1.2" />
                      )}
                      <text
                        x={sx}
                        y={sy + 15}
                        fill={isActive ? '#fcd34d' : '#fde68a'}
                        fontSize="8.5"
                        fontFamily="sans-serif"
                        fontWeight="600"
                        textAnchor="middle"
                      >
                        {statue.name.split(' ')[0]}
                      </text>
                    </g>
                  );
                })}

                {/* Lobby Foyer Point */}
                <g
                  role="button"
                  tabIndex={0}
                  aria-label="Navigate to Grand Entrance Lobby"
                  onClick={() => {
                    onReturnToFoyer();
                    setShowMap(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onReturnToFoyer();
                      setShowMap(false);
                    }
                  }}
                  className="cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
                >
                  <circle
                    cx="400"
                    cy="364"
                    r={currentView === 'atrium' ? '7' : '5.5'}
                    fill={currentView === 'atrium' ? '#d4af37' : '#334155'}
                    stroke="#fef3c7"
                    strokeWidth="1.4"
                  />
                  <text
                    x="400"
                    y="377"
                    fill={currentView === 'atrium' ? '#fcd34d' : '#cbd5e1'}
                    fontSize="7.5"
                    fontFamily="sans-serif"
                    fontWeight="600"
                    textAnchor="middle"
                  >
                    FOYER
                  </text>
                </g>
              </svg>
            </div>

            {/* Quick Navigation Action Footer */}
            <div className="flex items-center justify-between text-xs font-sans text-stone-300">
              <span>Diamonds mark Pioneer Monuments in the Rotunda; circles mark Exhibit Chambers.</span>
              <button
                onClick={() => setShowMap(false)}
                className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-semibold hover:bg-amber-400 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
              >
                Close Map
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subtle Gallery Exploration Hint (only inside exhibit chambers when not in guided tour) */}
      {!isTourActive && activeExhibit && !isMacro && (
        <div className="select-none fixed bottom-6 left-1/2 -translate-x-1/2 z-30 hidden xl:flex pointer-events-none px-4 py-1.5 rounded-full bg-[#161412]/90 backdrop-blur-md border border-amber-500/20 text-stone-300 text-xs font-sans items-center gap-2 shadow-lg">
          <Compass className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>WASD / Arrows to Walk · Drag to Orbit · Click Vitrine Case to Inspect</span>
        </div>
      )}

      {/* Footer Minimal API Status Dot */}
      <div className="fixed bottom-6 left-6 z-40">
        <ApiStatusDot />
      </div>
    </>
  );
}
