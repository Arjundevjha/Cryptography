'use client';

import { useState, useEffect, useCallback } from 'react';
import ThreeMuseumScene from './ThreeMuseumScene';
import { MUSEUM_EXHIBITS, MUSEUM_WINGS, MUSEUM_STATUES } from './museumData';
import { MuseumHUD } from './hud/MuseumHUD';
import { WorkbenchPanel } from './workbench/WorkbenchPanel';
import { ArtifactMetadataDrawer } from './workbench/ArtifactMetadataDrawer';
import { StatueCuratorialDrawer } from './workbench/StatueCuratorialDrawer';
import { AudioSystem } from './AudioSystem';
import {
  BookOpen,
  History,
  ShieldAlert,
  ZoomIn,
  ZoomOut,
  ArrowRight,
  ArrowLeft,
  Eye,
  PanelLeftClose,
  PanelLeftOpen,
  GraduationCap,
  X,
} from 'lucide-react';

interface HistoricalTourStop {
  targetId: string;
  era: string;
  title: string;
  note: string;
}

const HISTORICAL_TOUR_STOPS: HistoricalTourStop[] = [
  {
    targetId: 'scytale',
    era: 'c. 500 BC · Ancient Sparta',
    title: 'The Spartan Ephor Scytale',
    note: 'Physical geometry becomes a cryptographic key: leather strips reveal coherent Greek dispatches only on a baton of matching diameter.',
  },
  {
    targetId: 'polybius',
    era: 'c. 200 BC · Hellenistic Greece',
    title: 'Polybius Fire-Beacon Coordinates',
    note: 'Letters map onto a 5×5 coordinate tablet so twin sets of Signal Torches can transmit text across mountain ridges.',
  },
  {
    targetId: 'caesar',
    era: 'c. 58 BC · Imperial Rome',
    title: 'Shift Ciphers of the Roman Legions',
    note: 'Julius Caesar rotates the Latin alphabet by three places—establishing modular arithmetic substitution.',
  },
  {
    targetId: 'statue-alkindi',
    era: 'c. 850 AD · House of Wisdom, Baghdad',
    title: 'Al-Kindi & Frequency Analysis',
    note: 'Statistical letter-counting shatters 1,300 years of monoalphabetic cipher security in a single treatise.',
  },
  {
    targetId: 'vigenere',
    era: '1586 · Renaissance Europe',
    title: 'Le Chiffre Indéchiffrable',
    note: 'Polyalphabetic key phrases interleave shifted alphabets to flatten statistical letter peaks.',
  },
  {
    targetId: 'enigma',
    era: '1918–1945 · Mechanized Warfare',
    title: 'The Wehrmacht Enigma Machine',
    note: 'Stepping electrical rotors and Steckerbrett patch cables mechanize polyalphabetic substitution at industrial scale.',
  },
  {
    targetId: 'statue-turing',
    era: '1940 · Bletchley Park, Hut 8',
    title: 'Alan Turing & The Bombe',
    note: 'Electromechanical rotor banks hunt known-plaintext cribs by eliminating logical electrical contradictions.',
  },
  {
    targetId: 'statue-shannon',
    era: '1949 · Bell Laboratories',
    title: 'Claude Shannon & Information Theory',
    note: 'Secrecy transitions from craft to exact mathematics through entropy, confusion, diffusion, and one-time pads.',
  },
  {
    targetId: 'statue-diffie-hellman',
    era: '1976 · Stanford University',
    title: 'The Public-Key Revolution',
    note: 'Asymmetric trapdoor functions allow strangers to establish shared secrets across open networks.',
  },
  {
    targetId: 'aes',
    era: '2001–Present · Global Digital Standard',
    title: 'The Rijndael 4×4 State Lattice',
    note: 'Sixteen byte blocks transformed across Galois Field rounds safeguard modern global infrastructure.',
  },
];

export function MuseumCanvas() {
  const [isClient, setIsClient] = useState(false);
  const [currentView, setCurrentView] = useState<string>('atrium');
  const [isMacro, setIsMacro] = useState(false);
  const [isCuratorialCollapsed, setIsCuratorialCollapsed] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);
  const [tourStepIdx, setTourStepIdx] = useState(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setIsCuratorialCollapsed(false);
  }, [currentView]);

  const activeExhibit = MUSEUM_EXHIBITS.find((e) => e.id === currentView);
  const activeWing = MUSEUM_WINGS.find((w) => w.id === currentView);
  const activeStatue = MUSEUM_STATUES.find((s) => s.id === currentView);

  // Keyboard shortcut [Escape] to dismiss Guided Tour dock or Vitrine Inspection mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isTourActive) {
          setIsTourActive(false);
        } else if (isMacro) {
          setIsMacro(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTourActive, isMacro]);

  // Keyboard shortcut [C] to collapse/expand Curatorial Plaque inside exhibit chambers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeExhibit || activeWing || currentView === 'atrium' || isMacro) return;
      if (e.key === 'c' || e.key === 'C') {
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
        setIsCuratorialCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeExhibit, activeWing, currentView, isMacro]);

  const handleSelectRoom = useCallback((roomId: string) => {
    setCurrentView(roomId);
    setIsMacro(false);
  }, []);

  const handleReturnToFoyer = useCallback(() => {
    setCurrentView('atrium');
    setIsMacro(false);
  }, []);

  const handleCaseClick = useCallback((roomId: string) => {
    setCurrentView(roomId);
    setIsMacro(true);
  }, []);

  const handleToggleTour = useCallback(() => {
    setIsTourActive((prev) => {
      const nextState = !prev;
      if (nextState) {
        setTourStepIdx(0);
        setCurrentView(HISTORICAL_TOUR_STOPS[0].targetId);
        setIsMacro(false);
      }
      return nextState;
    });
  }, []);

  const handleStepTour = useCallback((nextIdx: number) => {
    const clamped = (nextIdx + HISTORICAL_TOUR_STOPS.length) % HISTORICAL_TOUR_STOPS.length;
    setTourStepIdx(clamped);
    setCurrentView(HISTORICAL_TOUR_STOPS[clamped].targetId);
    setIsMacro(false);
  }, []);

  const currentTourStop = HISTORICAL_TOUR_STOPS[tourStepIdx];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#1f1c18]">
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
        isTourActive={isTourActive}
        onToggleTour={handleToggleTour}
      />

      {/* === GUIDED HISTORICAL TOUR DOCENT BAR === */}
      {isTourActive && currentTourStop && (
        <div
          role="region"
          aria-label="Guided historical tour"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 w-full max-w-3xl px-4 pointer-events-none"
        >
          <div className="pointer-events-auto p-4 rounded-2xl bg-[#161412]/95 backdrop-blur-2xl border border-amber-500/40 text-stone-100 shadow-2xl space-y-2.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-sm sm:text-base font-semibold text-amber-300">
                  {currentTourStop.title}
                </h3>
                <p className="text-xs font-sans text-stone-300 mt-0.5">
                  Stop <span className="font-mono text-amber-300">{tourStepIdx + 1}</span> of{' '}
                  <span className="font-mono">{HISTORICAL_TOUR_STOPS.length}</span> · {currentTourStop.era}
                </p>
              </div>
              <button
                onClick={() => setIsTourActive(false)}
                aria-label="End guided historical tour"
                className="select-none p-1.5 rounded-lg bg-[#24201c] hover:bg-[#322d27] border border-stone-700/60 text-stone-300 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-stone-200 font-sans leading-relaxed">{currentTourStop.note}</p>

            <div className="select-none flex items-center justify-between pt-2 border-t border-stone-800/80">
              <button
                onClick={() => handleStepTour(tourStepIdx - 1)}
                aria-label="Previous tour stop"
                className="px-3 py-1.5 rounded-xl bg-[#24201c] hover:bg-[#322d27] border border-stone-700/60 text-xs font-sans font-medium text-stone-200 flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Previous Era
              </button>

              <nav aria-label="Tour stops" className="hidden sm:flex items-center gap-1.5">
                {HISTORICAL_TOUR_STOPS.map((st, idx) => (
                  <button
                    key={st.targetId}
                    type="button"
                    onClick={() => handleStepTour(idx)}
                    aria-label={`Jump to tour stop ${idx + 1}: ${st.title}`}
                    aria-current={idx === tourStepIdx ? 'step' : undefined}
                    title={`Stop ${idx + 1}: ${st.title}`}
                    className={`h-2 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                      idx === tourStepIdx ? 'w-6 bg-amber-400' : 'w-2 bg-stone-700 hover:bg-stone-500'
                    }`}
                  />
                ))}
              </nav>

              <button
                onClick={() => handleStepTour(tourStepIdx + 1)}
                aria-label="Next tour stop"
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-sans font-semibold flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none transition-colors"
              >
                Next Era <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === LOBBY ROTUNDA PIONEER ACCESSION STRIP === */}
      {currentView === 'atrium' && !isTourActive && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-20 w-full max-w-5xl px-4 pointer-events-none">
          <div className="pointer-events-auto">
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 mb-2 rounded-xl bg-[#161412]/92 backdrop-blur-xl border border-amber-500/25 text-stone-200">
              <div className="flex items-center gap-2.5">
                <span className="text-amber-400 text-xs" aria-hidden="true">◈</span>
                <span className="font-display text-xs sm:text-sm font-semibold text-amber-300 tracking-wide">
                  Grand Rotunda — The Four Pillars of Cryptography
                </span>
              </div>
              <button
                onClick={handleToggleTour}
                className="select-none text-xs font-sans font-semibold text-amber-300 hover:text-amber-200 flex items-center gap-1.5 underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none rounded px-1"
              >
                <GraduationCap className="w-3.5 h-3.5" /> Begin Chronological Tour (500 BC – Present)
              </button>
            </div>

            {/* 4 Founding Pioneers Accession Tiles (Title first, metadata below) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
              {MUSEUM_STATUES.map((statue) => (
                <button
                  key={statue.id}
                  onClick={() => handleSelectRoom(statue.id)}
                  className="p-3 rounded-xl bg-[#161412]/92 backdrop-blur-xl hover:bg-[#221e1a] border border-amber-500/30 hover:border-amber-400 shadow-lg transition-colors text-left group focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                >
                  <div className="font-display text-xs sm:text-sm font-semibold text-stone-100 group-hover:text-amber-300 transition-colors line-clamp-1">
                    {statue.name}
                  </div>
                  <div className="text-[11px] text-stone-300 font-sans mt-0.5 line-clamp-1">
                    {statue.title}
                  </div>
                  <div className="text-[11px] text-amber-300/85 font-sans mt-1 flex items-center justify-between">
                    <span>{statue.lifespan}</span>
                    <ArrowRight className="w-3 h-3 opacity-70 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* === WING OVERVIEW BANNER & GALLERY ACCESSION CARDS === */}
      {activeWing && !isTourActive && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-4xl px-4 pointer-events-none">
          <div className="pointer-events-auto space-y-2.5">
            <div className="text-center">
              <div className="inline-block px-5 py-2.5 rounded-2xl bg-[#161412]/94 backdrop-blur-xl border border-amber-500/35 text-stone-100 shadow-2xl">
                <h3 className="font-display text-sm sm:text-base font-semibold text-amber-300 tracking-wide">
                  {activeWing.name}
                </h3>
                <p className="text-xs text-stone-300 font-sans mt-0.5">{activeWing.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {MUSEUM_EXHIBITS.filter((e) => e.wing === activeWing.name).map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => handleSelectRoom(ex.id)}
                  className="p-3 rounded-xl bg-[#161412]/92 backdrop-blur-xl hover:bg-[#221e1a] border border-stone-800 hover:border-amber-400/70 transition-colors text-left group shadow-lg focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                >
                  <div className="font-display text-xs font-semibold text-stone-100 group-hover:text-amber-300 transition-colors line-clamp-1">
                    {ex.name}
                  </div>
                  <div className="text-[11px] text-stone-300 font-sans mt-1 flex items-center justify-between">
                    <span>{ex.timeline.split('–')[0]}</span>
                    <ArrowRight className="w-3 h-3 text-amber-400 shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* === COLLAPSIBLE CURATORIAL EXHIBITION PLAQUE (Left side, inside exhibit rooms) === */}
      {activeExhibit && !activeWing && currentView !== 'atrium' && !isMacro && (
        <div className="fixed top-24 left-5 z-20 pointer-events-auto">
          {isCuratorialCollapsed ? (
            <button
              onClick={() => setIsCuratorialCollapsed(false)}
              aria-expanded="false"
              aria-label="Expand curatorial plaque / show curatorial exhibition panel"
              className="select-none px-3.5 py-2.5 rounded-2xl bg-[#161412]/94 hover:bg-[#221e1a] backdrop-blur-2xl border border-amber-500/30 text-stone-100 shadow-2xl flex items-center gap-2 text-xs font-sans font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
            >
              <PanelLeftOpen className="w-4 h-4 text-amber-400" />
              <span>Curatorial Plaque</span>
              <span className="text-[10px] font-mono text-amber-300/80">[C]</span>
            </button>
          ) : (
            <div className="museum-scroller w-80 max-h-[calc(100vh-150px)] overflow-y-auto bg-[#161412]/94 backdrop-blur-2xl border border-amber-500/25 shadow-2xl rounded-2xl p-5 space-y-3.5 text-stone-100">
              {/* Heading first, wing/timeline below, plus collapse toggle */}
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-amber-500/20">
                <div className="space-y-1">
                  <h2 className="font-display text-lg font-semibold text-stone-100 leading-snug">
                    {activeExhibit.name}
                  </h2>
                  <p className="text-xs font-sans text-amber-300/90">
                    {activeExhibit.wing} · {activeExhibit.timeline}
                  </p>
                  <p className="text-xs font-sans text-stone-400 italic">{activeExhibit.subtitle}</p>
                </div>
                <button
                  onClick={() => setIsCuratorialCollapsed(true)}
                  aria-expanded="true"
                  aria-label="Collapse curatorial plaque / close curatorial exhibition panel"
                  title="Collapse plaque [C]"
                  className="select-none p-1.5 rounded-lg bg-[#24201c] hover:bg-[#322d27] border border-stone-700/60 text-stone-300 hover:text-stone-100 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none transition-colors shrink-0"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-display text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Curatorial Overview
                </h3>
                <p className="text-xs text-stone-300 font-sans leading-relaxed">{activeExhibit.description}</p>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-display text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Historical Origin
                </h3>
                <p className="text-xs text-stone-300 font-sans leading-relaxed">{activeExhibit.historicalContext}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/25 space-y-1.5">
                <h3 className="font-display text-xs font-semibold text-rose-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" /> Cryptanalytic Vulnerabilities
                </h3>
                <p className="text-xs text-stone-300 font-sans leading-relaxed">{activeExhibit.vulnerabilities}</p>
              </div>

              <button
                onClick={() => handleCaseClick(activeExhibit.id)}
                className="select-none w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-sans font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
              >
                <ZoomIn className="w-3.5 h-3.5" /> Inspect Display Vitrine
              </button>
            </div>
          )}
        </div>
      )}

      {/* === WORKBENCH PANEL (Right side, inside exhibit rooms) === */}
      {activeExhibit && !activeWing && currentView !== 'atrium' && !isMacro && (
        <div className="fixed top-24 right-5 z-20 pointer-events-auto">
          <WorkbenchPanel exhibit={activeExhibit} />
        </div>
      )}

      {/* === STATUE CURATORIAL & INTERACTIVE DRAWER === */}
      {activeStatue && (
        <StatueCuratorialDrawer
          statue={activeStatue}
          onClose={handleReturnToFoyer}
          onSelectWing={handleSelectRoom}
        />
      )}

      {/* === AUDIO SYSTEM (Spatial Ambient & Synth Audio) === */}
      <AudioSystem currentView={currentView} />

      {/* === INSPECTION MODE FLOATING BANNER & DRAWER === */}
      {activeExhibit && isMacro && (
        <>
          <div className="select-none fixed top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-[#161412]/94 backdrop-blur-xl border border-amber-500/35 text-stone-100 shadow-2xl">
            <div className="flex items-center gap-2 text-amber-300 font-display text-xs sm:text-sm font-semibold">
              <Eye className="w-4 h-4 text-amber-400" />
              <span>Vitrine Inspection — {activeExhibit.name}</span>
            </div>
            <button
              onClick={() => setIsMacro(false)}
              className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-sans font-bold flex items-center gap-1.5 shadow transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
            >
              <ZoomOut className="w-3.5 h-3.5" /> Exit Inspection
            </button>
          </div>
          <ArtifactMetadataDrawer exhibit={activeExhibit} onClose={() => setIsMacro(false)} />
        </>
      )}
    </div>
  );
}
