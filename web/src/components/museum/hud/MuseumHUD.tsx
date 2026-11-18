'use client';

import { useState, useEffect, useMemo } from 'react';
import { ApiStatusDot } from './ApiStatusDot';
import {
  Github,
  Home,
  Compass,
  Map,
  X,
  Navigation,
  GraduationCap,
  Award,
  ArrowLeft,
  ArrowRight,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { MUSEUM_EXHIBITS, MUSEUM_WINGS, MUSEUM_STATUES } from '../museumData';
import {
  AUDIO_STATE_EVENT,
  isAudioMuted,
  toggleAmbient,
  toggleAudioMuted,
} from '../audio/museumAudio';

export const PASSPORT_STORAGE_KEY = 'cryptography-museum-passport-v1';
export const PASSPORT_UPDATED_EVENT = 'museum-passport-updated';

export type TourMode = 'chronological' | 'wings';

export interface TourStop {
  targetId: string;
  era: string;
  title: string;
  note: string;
}

interface MuseumHUDProps {
  currentView: string;
  onSelectRoom: (roomId: string) => void;
  onReturnToFoyer: () => void;
  isTourActive?: boolean;
  onToggleTour?: () => void;
  tourMode?: TourMode;
  onSelectTourMode?: (mode: TourMode) => void;
  tourStops?: TourStop[];
  tourStepIdx?: number;
  onStepTour?: (nextIdx: number) => void;
  onExitTour?: () => void;
}

function readPassportStamps(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(PASSPORT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const validIds = new Set(MUSEUM_EXHIBITS.map((e) => e.id));
    return Array.from(new Set(parsed.filter((id): id is string => typeof id === 'string' && validIds.has(id))));
  } catch {
    return [];
  }
}

export function MuseumHUD({
  currentView,
  onSelectRoom,
  onReturnToFoyer,
  isTourActive = false,
  onToggleTour,
  tourMode = 'chronological',
  onSelectTourMode,
  tourStops = [],
  tourStepIdx = 0,
  onStepTour,
  onExitTour,
}: MuseumHUDProps) {
  const [showMap, setShowMap] = useState(false);
  const [stampedIds, setStampedIds] = useState<string[]>([]);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const syncAudio = () => setIsMuted(isAudioMuted());
    syncAudio();
    window.addEventListener('storage', syncAudio);
    window.addEventListener(AUDIO_STATE_EVENT, syncAudio);
    return () => {
      window.removeEventListener('storage', syncAudio);
      window.removeEventListener(AUDIO_STATE_EVENT, syncAudio);
    };
  }, []);

  useEffect(() => {
    const syncStamps = () => setStampedIds(readPassportStamps());
    syncStamps();
    window.addEventListener('storage', syncStamps);
    window.addEventListener(PASSPORT_UPDATED_EVENT, syncStamps);
    return () => {
      window.removeEventListener('storage', syncStamps);
      window.removeEventListener(PASSPORT_UPDATED_EVENT, syncStamps);
    };
  }, []);

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

  const handleToggleAudio = () => {
    const wingCategory = activeWing?.category ?? activeExhibit?.category;
    const nextMuted = toggleAudioMuted(wingCategory);
    setIsMuted(nextMuted);
    if (!nextMuted) {
      toggleAmbient(wingCategory);
    }
  };

  const getSubtext = () => {
    if (currentView === 'atrium') return 'Grand Entrance Rotunda';
    if (activeStatue) return `Pioneer Monument • ${activeStatue.name} (${activeStatue.lifespan})`;
    if (activeWing) return activeWing.name;
    if (activeExhibit) return `${activeExhibit.wing} • ${activeExhibit.name}`;
    return 'Permanent Collection';
  };

  const totalExhibits = MUSEUM_EXHIBITS.length;
  const stampedCount = stampedIds.length;
  const allStamped = totalExhibits > 0 && stampedCount >= totalExhibits;

  const mapPositions = useMemo(() => {
    const positions: Record<string, { cx: number; cy: number }> = {};
    const byCategory = (cat: 'Classical' | 'Historical' | 'Modern') =>
      MUSEUM_EXHIBITS.filter((e) => e.category === cat);

    // Classical Wing box: x=[45..250], y=[45..270]
    const classical = byCategory('Classical');
    const classicalRows = Math.max(1, Math.ceil(classical.length / 2));
    classical.forEach((ex, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const isLastSingle = idx === classical.length - 1 && classical.length % 2 === 1;
      const cx = isLastSingle ? 147 : col === 0 ? 100 : 195;
      const cy = classicalRows === 1 ? 155 : 102 + (row * 124) / Math.max(1, classicalRows - 1);
      positions[ex.id] = { cx, cy };
    });

    // Historical Wing box: x=[305..495], y=[45..250]
    const historical = byCategory('Historical');
    historical.forEach((ex, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const cx = historical.length === 1 ? 400 : col === 0 ? 355 : 445;
      const cy = historical.length <= 2 ? 152 : 118 + row * 72;
      positions[ex.id] = { cx, cy };
    });

    // Modern Wing box: x=[550..755], y=[45..270]
    const modern = byCategory('Modern');
    const modernRows = Math.max(1, Math.ceil(modern.length / 2));
    modern.forEach((ex, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const isLastSingle = idx === modern.length - 1 && modern.length % 2 === 1;
      const cx = isLastSingle ? 652 : col === 0 ? 602 : 702;
      const cy = modernRows === 1 ? 155 : 108 + (row * 114) / Math.max(1, modernRows - 1);
      positions[ex.id] = { cx, cy };
    });

    return positions;
  }, []);

  const currentTourStop = tourStops[tourStepIdx];

  return (
    <>
      {/* Unified Non-Overlapping 3-Zone Top Header HUD */}
      <header className="select-none fixed top-4 inset-x-4 sm:inset-x-5 z-40 flex items-center justify-between gap-2 pointer-events-none">
        {/* Left Zone: Branding & Return to Lobby */}
        <div className="pointer-events-auto flex items-center gap-2 min-w-0">
          <div className="px-3.5 py-2 rounded-2xl bg-[#161412]/95 backdrop-blur-xl border border-amber-500/30 text-stone-100 shadow-2xl flex items-center gap-2.5 min-w-0">
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
          className="pointer-events-auto hidden lg:flex items-center gap-1 p-1.5 rounded-2xl bg-[#161412]/95 backdrop-blur-xl border border-amber-500/25 shadow-2xl shrink-0"
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
                  : 'bg-[#161412]/95 text-amber-300 border-amber-500/30'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span className="hidden sm:inline">Tour</span>
            </button>
          )}

          <div
            data-testid="passport-progress-badge"
            role="status"
            aria-label={`Museum Passport: ${stampedCount} of ${totalExhibits} exhibits stamped`}
            title={`Museum Passport: ${stampedCount} of ${totalExhibits} exhibit challenges completed`}
            className={`px-3 py-2 rounded-2xl backdrop-blur-xl border text-xs font-sans font-semibold flex items-center gap-1.5 shadow-xl transition-colors ${
              allStamped
                ? 'bg-emerald-950/90 border-emerald-400/50 text-emerald-200'
                : 'bg-[#161412]/95 border-amber-500/25 text-stone-200'
            }`}
          >
            <Award className={`w-4 h-4 shrink-0 ${allStamped ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span className="hidden xl:inline">Passport</span>
            <span className="font-mono text-amber-300">
              {stampedCount}/{totalExhibits}
            </span>
          </div>

          <button
            type="button"
            onClick={handleToggleAudio}
            aria-label={isMuted ? 'Unmute museum audio' : 'Mute museum audio'}
            aria-pressed={!isMuted}
            title={isMuted ? 'Unmute Museum Audio' : 'Mute Museum Audio'}
            data-testid="hud-audio-toggle"
            className={`px-3 py-2 rounded-2xl backdrop-blur-xl border text-xs font-sans font-semibold flex items-center gap-1.5 shadow-xl transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
              !isMuted
                ? 'bg-amber-500/20 border-amber-400/50 text-amber-200 hover:bg-amber-500/30'
                : 'bg-[#161412]/95 border-amber-500/25 text-stone-300 hover:text-stone-100'
            }`}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-stone-400 shrink-0" />
            ) : (
              <Volume2 className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span className="hidden xl:inline">{isMuted ? 'Muted' : 'Audio'}</span>
          </button>

          <ApiStatusDot />

          <a
            href="https://github.com/Arjundevjha/Cryptography"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View repository on GitHub"
            className="px-3 py-2 rounded-2xl bg-[#161412]/95 hover:bg-stone-900 backdrop-blur-xl border border-stone-800 text-stone-200 text-xs font-sans font-medium flex items-center gap-2 shadow-2xl transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
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
                  const pos = mapPositions[ex.id] ?? { cx: 400, cy: 200 };
                  const { cx, cy } = pos;
                  const isActive = currentView === ex.id;
                  const isStamped = stampedIds.includes(ex.id);

                  return (
                    <g
                      key={ex.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`Navigate to exhibit ${ex.name}${isStamped ? ' (Passport Stamped)' : ''}`}
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
                        fill={isActive ? '#d4af37' : isStamped ? '#065f46' : '#1e293b'}
                        stroke={isActive ? '#fef3c7' : isStamped ? '#34d399' : '#94a3b8'}
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

      {/* === GUIDED MUSEUM TOUR DOCENT BAR === */}
      {isTourActive && currentTourStop && (
        <div
          role="region"
          aria-label="Guided historical tour"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 w-full max-w-3xl px-4 pointer-events-none"
        >
          <div className="pointer-events-auto p-4 rounded-2xl bg-[#161412]/95 backdrop-blur-2xl border border-amber-500/40 text-stone-100 shadow-2xl space-y-2.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-display text-sm sm:text-base font-semibold text-amber-300 truncate">
                  {currentTourStop.title}
                </h3>
                <p className="text-xs font-sans text-stone-300 mt-0.5">
                  Stop <span className="font-mono text-amber-300">{tourStepIdx + 1}</span> of{' '}
                  <span className="font-mono">{tourStops.length}</span> · {currentTourStop.era}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {onSelectTourMode && (
                  <div
                    role="group"
                    aria-label="Tour itinerary mode"
                    className="hidden sm:flex items-center p-0.5 rounded-lg bg-[#24201c] border border-stone-700/60 text-[11px] font-sans"
                  >
                    <button
                      type="button"
                      onClick={() => onSelectTourMode('chronological')}
                      aria-pressed={tourMode === 'chronological'}
                      className={`px-2 py-1 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                        tourMode === 'chronological'
                          ? 'bg-amber-500 text-stone-950 font-semibold'
                          : 'text-stone-300 hover:text-stone-100'
                      }`}
                    >
                      Chronological
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectTourMode('wings')}
                      aria-pressed={tourMode === 'wings'}
                      className={`px-2 py-1 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                        tourMode === 'wings'
                          ? 'bg-amber-500 text-stone-950 font-semibold'
                          : 'text-stone-300 hover:text-stone-100'
                      }`}
                    >
                      All Wings
                    </button>
                  </div>
                )}
                <button
                  onClick={onExitTour ?? onToggleTour}
                  aria-label="End guided historical tour (Escape)"
                  title="End guided tour [Esc]"
                  className="select-none p-1.5 rounded-lg bg-[#24201c] hover:bg-[#322d27] border border-stone-700/60 text-stone-300 hover:text-stone-100 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-200 font-sans leading-relaxed">{currentTourStop.note}</p>

            <div className="select-none flex items-center justify-between pt-2 border-t border-stone-800/80">
              <button
                onClick={() => onStepTour?.(tourStepIdx - 1)}
                aria-label="Previous tour stop"
                className="px-3 py-1.5 rounded-xl bg-[#24201c] hover:bg-[#322d27] border border-stone-700/60 text-xs font-sans font-medium text-stone-200 flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Previous Era
              </button>

              <nav aria-label="Tour stops" className="hidden sm:flex items-center gap-1.5 flex-wrap justify-center max-w-md">
                {tourStops.map((st, idx) => (
                  <button
                    key={`${st.targetId}-${idx}`}
                    type="button"
                    onClick={() => onStepTour?.(idx)}
                    aria-label={`Jump to stop ${idx + 1}: ${st.title}`}
                    aria-current={idx === tourStepIdx ? 'step' : undefined}
                    title={`Stop ${idx + 1}: ${st.title}`}
                    className={`h-2 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                      idx === tourStepIdx
                        ? 'w-6 bg-amber-400'
                        : 'w-2 bg-stone-700 hover:bg-stone-500'
                    }`}
                  />
                ))}
              </nav>

              <button
                onClick={() => onStepTour?.(tourStepIdx + 1)}
                aria-label="Next tour stop"
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-sans font-semibold flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none transition-colors"
              >
                Next Era <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subtle Gallery Exploration Hint (only inside exhibit chambers when not in guided tour) */}
      {!isTourActive && activeExhibit && (
        <div className="select-none fixed bottom-6 left-1/2 -translate-x-1/2 z-30 hidden xl:flex pointer-events-none px-4 py-1.5 rounded-full bg-[#161412]/90 backdrop-blur-md border border-amber-500/20 text-stone-300 text-xs font-sans items-center gap-2 shadow-lg">
          <Compass className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>WASD / Arrows to Walk · Drag to Orbit</span>
        </div>
      )}
    </>
  );
}
