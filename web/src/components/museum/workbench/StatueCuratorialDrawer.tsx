'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CryptographicStatue } from '../museumData';
import {
  X,
  BookOpen,
  FlaskConical,
  Award,
  Scroll,
  Cpu,
  CheckCircle2,
} from 'lucide-react';
import { AlKindiFrequencyLab } from './statues/AlKindiFrequencyLab';
import { TuringBombeLab } from './statues/TuringBombeLab';
import { ShannonEntropyLab } from './statues/ShannonEntropyLab';
import { DiffieHellmanMerkleLab } from './statues/DiffieHellmanMerkleLab';

interface StatueCuratorialDrawerProps {
  statue: CryptographicStatue;
  onClose: () => void;
  onSelectWing?: (wingId: string) => void;
}

export function StatueCuratorialDrawer({ statue, onClose }: StatueCuratorialDrawerProps) {
  const [activeTab, setActiveTab] = useState<'curation' | 'lab'>('curation');
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const curationTabRef = useRef<HTMLButtonElement>(null);
  const labTabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    };
  }, [onClose]);

  const handleTabListKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      let nextTab: 'curation' | 'lab' = activeTab;
      if (e.key === 'Home') {
        nextTab = 'curation';
      } else if (e.key === 'End') {
        nextTab = 'lab';
      } else {
        nextTab = activeTab === 'curation' ? 'lab' : 'curation';
      }
      setActiveTab(nextTab);
      if (nextTab === 'curation') {
        curationTabRef.current?.focus();
      } else {
        labTabRef.current?.focus();
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Statue details for ${statue.name}`}
      className="museum-scroller fixed top-0 right-0 h-full w-full sm:w-[480px] md:w-[560px] bg-[#161412]/95 backdrop-blur-2xl border-l border-amber-500/30 p-6 z-50 text-stone-100 overflow-y-auto shadow-2xl"
    >
      {/* Header — Heading first, metadata below (Zero Eyebrow Kicker) */}
      <div className="flex items-start justify-between pb-4 mb-5 border-b border-amber-500/20">
        <div className="space-y-1.5">
          <h2 className="font-display text-2xl font-semibold text-stone-100 tracking-wide">{statue.name}</h2>
          <div className="flex flex-wrap items-center gap-2 text-xs text-stone-300 font-sans">
            <span className="text-amber-300 font-medium">{statue.title}</span>
            <span className="text-stone-500" aria-hidden="true">·</span>
            <span>{statue.lifespan}</span>
          </div>
          <p className="text-xs text-stone-400 italic font-sans">{statue.landmarkPaper}</p>
        </div>

        <button
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="Close statue details"
          className="p-2 rounded-xl bg-[#24201c] hover:bg-[#322d27] border border-stone-700/60 text-stone-300 hover:text-stone-100 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Mode Switcher Tabs */}
      <div
        role="tablist"
        aria-label="Statue details view mode"
        onKeyDown={handleTabListKeyDown}
        className="flex rounded-xl bg-[#221f1c] p-1 mb-6 border border-stone-800"
      >
        <button
          ref={curationTabRef}
          id="statue-tab-curation"
          role="tab"
          aria-selected={activeTab === 'curation'}
          aria-controls="statue-tabpanel-curation"
          tabIndex={activeTab === 'curation' ? 0 : -1}
          onClick={() => setActiveTab('curation')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-sans font-semibold flex items-center justify-center gap-2 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
            activeTab === 'curation'
              ? 'bg-amber-500 text-stone-950 shadow-sm font-bold'
              : 'text-stone-300 hover:text-stone-100'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Historical Curation
        </button>
        <button
          ref={labTabRef}
          id="statue-tab-lab"
          role="tab"
          aria-selected={activeTab === 'lab'}
          aria-controls="statue-tabpanel-lab"
          tabIndex={activeTab === 'lab' ? 0 : -1}
          onClick={() => setActiveTab('lab')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-sans font-semibold flex items-center justify-center gap-2 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
            activeTab === 'lab'
              ? 'bg-amber-500 text-stone-950 shadow-sm font-bold'
              : 'text-stone-300 hover:text-stone-100'
          }`}
        >
          <FlaskConical className="w-4 h-4" /> Interactive Pioneer Lab
        </button>
      </div>

      {/* TAB 1: CURATORIAL OVERVIEW & ARCHIVAL CITATION */}
      {activeTab === 'curation' && (
        <div
          id="statue-tabpanel-curation"
          role="tabpanel"
          aria-labelledby="statue-tab-curation"
          className="space-y-6"
        >
          {/* Framed Archival Citation Plaque */}
          <div className="p-4 rounded-xl bg-[#111520] border border-amber-500/30 space-y-2.5">
            <h3 className="font-display text-sm font-semibold text-amber-300 flex items-center gap-2">
              <Scroll className="w-4 h-4 text-amber-400 shrink-0" /> Curatorial Landmark Citation
            </h3>
            <p className="text-xs sm:text-sm text-stone-200 font-sans leading-relaxed italic">
              &ldquo;{statue.description}&rdquo;
            </p>
          </div>

          {/* Historical Significance */}
          <div className="space-y-2">
            <h3 className="font-display text-sm font-semibold text-amber-300 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400 shrink-0" /> Historical Epoch &amp; Impact
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">{statue.historicalSignificance}</p>
          </div>

          {/* Core Mathematical Breakthrough */}
          <div className="p-4 rounded-xl bg-[#111520] border border-stone-800 space-y-2">
            <h3 className="font-display text-sm font-semibold text-amber-300 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-400 shrink-0" /> Core Breakthrough
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">{statue.coreBreakthrough}</p>
          </div>

          {/* Key Contributions */}
          <div className="space-y-2.5">
            <h3 className="font-display text-sm font-semibold text-amber-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Key Cryptographic Contributions
            </h3>
            <ul className="space-y-2">
              {statue.keyContributions.map((contrib, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-300 font-sans">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                  <span>{contrib}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Wing Portal Link */}
          <div className="pt-3 border-t border-stone-800 flex items-center justify-between text-xs font-sans">
            <span className="text-stone-400">Associated Gallery Wing</span>
            <span className="text-amber-300 font-semibold">{statue.associatedWing}</span>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE PIONEER LAB */}
      {activeTab === 'lab' && (
        <div
          id="statue-tabpanel-lab"
          role="tabpanel"
          aria-labelledby="statue-tab-lab"
          className="space-y-5"
        >
          {statue.interactiveDemoType === 'frequency-analysis' && <AlKindiFrequencyLab />}
          {statue.interactiveDemoType === 'turing-bombe' && <TuringBombeLab />}
          {statue.interactiveDemoType === 'information-entropy' && <ShannonEntropyLab />}
          {statue.interactiveDemoType === 'key-exchange' && <DiffieHellmanMerkleLab />}
        </div>
      )}
    </div>
  );
}
