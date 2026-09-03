'use client';

import { useState } from 'react';
import { ApiStatusDot } from './ApiStatusDot';
import { Github, Home, Compass, Map, X, Sparkles, Navigation } from 'lucide-react';
import { MUSEUM_EXHIBITS, MUSEUM_WINGS, MUSEUM_STATUES } from '../museumData';

interface MuseumHUDProps {
  currentView: string;
  isMacro: boolean;
  onSelectRoom: (roomId: string) => void;
  onReturnToFoyer: () => void;
}

export function MuseumHUD({ currentView, isMacro, onSelectRoom, onReturnToFoyer }: MuseumHUDProps) {
  const [showMap, setShowMap] = useState(false);
  const activeExhibit = MUSEUM_EXHIBITS.find((e) => e.id === currentView);
  const activeWing = MUSEUM_WINGS.find((w) => w.id === currentView);
  const activeStatue = MUSEUM_STATUES.find((s) => s.id === currentView);

  const getSubtext = () => {
    if (currentView === 'atrium') return 'Grand Entrance Lobby';
    if (activeStatue) return `Pioneer Monument • ${activeStatue.name} (${activeStatue.lifespan})`;
    if (activeWing) return activeWing.name;
    if (activeExhibit) return `${activeExhibit.wing} • ${activeExhibit.name}`;
    return '3D Museum Gallery';
  };

  return (
    <>
      {/* Top Left Branding & Navigation HUD */}
      <div className="fixed top-6 left-6 z-40 flex items-center gap-3">
        <div className="px-4 py-2.5 rounded-2xl bg-stone-950/85 backdrop-blur-xl border border-amber-500/30 text-stone-100 shadow-2xl flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
          <div>
            <h1 className="text-xs font-bold font-mono tracking-widest text-amber-400 uppercase">CRYPTOGRAPHY MUSEUM</h1>
            <p className="text-[10px] text-stone-400 font-sans">{getSubtext()}</p>
          </div>
        </div>

        {/* Return to Lobby Button */}
        {currentView !== 'atrium' && (
          <button
            onClick={onReturnToFoyer}
            className="px-3.5 py-2.5 rounded-2xl bg-amber-500/90 hover:bg-amber-400 text-stone-950 font-mono text-xs font-bold flex items-center gap-2 shadow-lg transition-all"
          >
            <Home className="w-4 h-4" /> Lobby Entrance
          </button>
        )}
      </div>

      {/* Top Center Wing & Navigation Bar */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-40 hidden md:flex items-center gap-1.5 p-1.5 rounded-2xl bg-stone-950/85 backdrop-blur-xl border border-amber-500/20 shadow-2xl">
        <button
          onClick={onReturnToFoyer}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all ${
            currentView === 'atrium' ? 'bg-amber-500 text-stone-950 shadow font-bold' : 'text-stone-300 hover:text-stone-100'
          }`}
        >
          LOBBY
        </button>

        {MUSEUM_WINGS.map((wing) => (
          <button
            key={wing.id}
            onClick={() => onSelectRoom(wing.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all ${
              currentView === wing.id ? 'bg-amber-500 text-stone-950 shadow font-bold' : 'text-stone-300 hover:text-stone-100'
            }`}
          >
            {wing.category.toUpperCase()} WING
          </button>
        ))}

        <div className="w-px h-4 bg-stone-800 mx-1" />

        {/* Toggle 2D Mini-Map */}
        <button
          onClick={() => setShowMap(!showMap)}
          aria-expanded={showMap}
          aria-label="Toggle 2D museum floorplan map"
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
            showMap ? 'bg-amber-400 text-stone-950' : 'bg-stone-900 hover:bg-stone-800 text-amber-400 border border-amber-500/30'
          }`}
        >
          <Map className="w-3.5 h-3.5" /> 2D MAP
        </button>
      </div>

      {/* Top Right Floating HUD Links */}
      <div className="fixed top-6 right-6 z-40 flex items-center gap-3">
        <a
          href="https://github.com/Arjundevjha/Cryptography"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View repository on GitHub"
          className="px-3.5 py-2.5 rounded-2xl bg-stone-950/85 hover:bg-stone-900 backdrop-blur-xl border border-stone-800 text-stone-200 text-xs font-mono flex items-center gap-2 shadow-2xl transition-all"
        >
          <Github className="w-4 h-4 text-stone-300" />
          <span className="hidden sm:inline">View Repository</span>
        </a>
      </div>

      {/* 2D INTERACTIVE MUSEUM FLOORPLAN MAP DRAWER */}
      {showMap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-stone-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl text-stone-100 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-amber-400" />
                <h2 className="text-sm font-extrabold font-mono text-amber-400 tracking-widest uppercase">
                  INTERACTIVE MUSEUM FLOORPLAN MAP
                </h2>
              </div>
              <button
                onClick={() => setShowMap(false)}
                aria-label="Close museum floorplan map"
                className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SVG Floorplan Graphic */}
            <div className="relative w-full h-80 bg-stone-950 rounded-2xl border border-stone-800 p-4 flex items-center justify-center overflow-hidden select-none">
              <svg viewBox="0 0 800 400" className="w-full h-full">
                {/* Background Grid */}
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                </pattern>
                <rect width="800" height="400" fill="url(#grid)" />

                {/* Grand Entrance Lobby Box */}
                <rect x="300" y="300" width="200" height="80" rx="10" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
                <text x="400" y="345" fill="#f59e0b" fontSize="13" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                  GRAND ENTRANCE LOBBY
                </text>

                {/* Classical Corridor (Left) */}
                <rect x="50" y="50" width="200" height="220" rx="10" fill="#0f172a" stroke="#0284c7" strokeWidth="1.5" />
                <text x="150" y="75" fill="#38bdf8" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                  CLASSICAL CIPHERS WING
                </text>
                {/* Connector line to lobby */}
                <path d="M 250 160 L 350 300" stroke="#0284c7" strokeWidth="2" strokeDasharray="4 4" />

                {/* Historical Corridor (Center) */}
                <rect x="310" y="50" width="180" height="200" rx="10" fill="#0f172a" stroke="#d97706" strokeWidth="1.5" />
                <text x="400" y="75" fill="#fbbf24" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                  HISTORICAL SYSTEMS WING
                </text>
                <path d="M 400 250 L 400 300" stroke="#d97706" strokeWidth="2" strokeDasharray="4 4" />

                {/* Modern Corridor (Right) */}
                <rect x="550" y="50" width="200" height="220" rx="10" fill="#0f172a" stroke="#9333ea" strokeWidth="1.5" />
                <text x="650" y="75" fill="#c084fc" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                  MODERN CRYPTOGRAPHY WING
                </text>
                <path d="M 550 160 L 450 300" stroke="#9333ea" strokeWidth="2" strokeDasharray="4 4" />

                {/* Interactive Clickable Room Dots */}
                {MUSEUM_EXHIBITS.map((ex) => {
                  let cx = 400;
                  let cy = 200;
                  if (ex.category === 'Classical') {
                    if (['caesar', 'affine'].includes(ex.id)) {
                      cx = ex.id === 'caesar' ? 100 : 200;
                      cy = 110;
                    } else if (['vigenere', 'playfair'].includes(ex.id)) {
                      cx = ex.id === 'vigenere' ? 100 : 200;
                      cy = 160;
                    } else {
                      cx = ex.id === 'polybius' ? 100 : 200;
                      cy = 210;
                    }
                  } else if (ex.category === 'Historical') {
                    cx = ex.id === 'enigma' ? 355 : 445;
                    cy = 150;
                  } else {
                    cx = ex.id === 'rsa' ? 600 : ex.id === 'aes' ? 700 : 650;
                    cy = ex.id === 'sha256' ? 200 : 120;
                  }

                  const isActive = currentView === ex.id;

                  return (
                    <g
                      key={ex.id}
                      onClick={() => {
                        onSelectRoom(ex.id);
                        setShowMap(false);
                      }}
                      className="cursor-pointer group"
                    >
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isActive ? "10" : "7"}
                        fill={isActive ? "#f59e0b" : "#334155"}
                        stroke={isActive ? "#ffffff" : "#64748b"}
                        strokeWidth="2"
                        className="transition-all group-hover:scale-125"
                      />
                      {isActive && (
                        <circle cx={cx} cy={cy} r="16" fill="none" stroke="#f59e0b" strokeWidth="1.5" className="animate-ping" />
                      )}
                      <text
                        x={cx}
                        y={cy + 18}
                        fill={isActive ? "#f59e0b" : "#94a3b8"}
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {ex.name.split(' ')[0]}
                      </text>
                    </g>
                  );
                })}

                {/* Founding Fathers Statue Markers in Lobby */}
                {MUSEUM_STATUES.map((statue) => {
                  let sx = 400;
                  let sy = 330;
                  if (statue.id === 'statue-alkindi') {
                    sx = 340;
                    sy = 335;
                  } else if (statue.id === 'statue-shannon') {
                    sx = 400;
                    sy = 325;
                  } else if (statue.id === 'statue-diffie-hellman') {
                    sx = 460;
                    sy = 335;
                  }

                  const isActive = currentView === statue.id;

                  return (
                    <g
                      key={statue.id}
                      onClick={() => {
                        onSelectRoom(statue.id);
                        setShowMap(false);
                      }}
                      className="cursor-pointer group"
                    >
                      <rect
                        x={sx - (isActive ? 7 : 5)}
                        y={sy - (isActive ? 7 : 5)}
                        width={isActive ? 14 : 10}
                        height={isActive ? 14 : 10}
                        transform={`rotate(45 ${sx} ${sy})`}
                        fill={isActive ? '#f59e0b' : '#d97706'}
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        className="transition-all group-hover:scale-125"
                      />
                      {isActive && (
                        <circle cx={sx} cy={sy} r="14" fill="none" stroke="#f59e0b" strokeWidth="1.5" className="animate-ping" />
                      )}
                      <text
                        x={sx}
                        y={sy + 14}
                        fill={isActive ? '#f59e0b' : '#fbbf24'}
                        fontSize="8"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {statue.name.split(' ')[0]}
                      </text>
                    </g>
                  );
                })}

                {/* Lobby Point */}
                <g
                  onClick={() => {
                    onReturnToFoyer();
                    setShowMap(false);
                  }}
                  className="cursor-pointer group"
                >
                  <circle
                    cx="400"
                    cy="365"
                    r={currentView === 'atrium' ? "8" : "6"}
                    fill={currentView === 'atrium' ? "#f59e0b" : "#334155"}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  {currentView === 'atrium' && (
                    <circle cx="400" cy="365" r="14" fill="none" stroke="#f59e0b" strokeWidth="1.5" className="animate-ping" />
                  )}
                  <text
                    x="400"
                    y="376"
                    fill={currentView === 'atrium' ? "#f59e0b" : "#94a3b8"}
                    fontSize="7"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    ENTRANCE
                  </text>
                </g>
              </svg>
            </div>

            {/* Quick Navigation Action Footer */}
            <div className="flex items-center justify-between text-xs font-mono text-stone-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <span>Click any room marker on the floorplan to fly camera directly inside</span>
              </div>
              <button
                onClick={() => setShowMap(false)}
                className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold hover:bg-amber-400 transition-colors"
              >
                CLOSE MAP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3D Exploration Hint Badge */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none px-4 py-2 rounded-full bg-stone-950/75 backdrop-blur-md border border-amber-500/20 text-stone-300 text-[11px] font-mono flex items-center gap-2 shadow-lg">
        <Compass className="w-3.5 h-3.5 text-amber-400 animate-spin" />
        <span>3D EXPLORATION: WASD / Arrow Keys to Walk • Drag Mouse to Look • Scroll to Zoom • Click Exhibit to Focus</span>
      </div>

      {/* Footer Minimal API Status Dot */}
      <div className="fixed bottom-6 left-6 z-40">
        <ApiStatusDot />
      </div>
    </>
  );
}
