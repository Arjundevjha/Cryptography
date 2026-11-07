'use client';

import { useEffect } from 'react';
import { CipherExhibit } from '../museumData';
import { X, BookOpen, ShieldAlert, History, ZoomOut } from 'lucide-react';

interface ArtifactMetadataDrawerProps {
  exhibit: CipherExhibit;
  onClose: () => void;
}

export function ArtifactMetadataDrawer({ exhibit, onClose }: ArtifactMetadataDrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Artifact details for ${exhibit.name}`}
      className="museum-scroller fixed top-0 right-0 h-full w-80 md:w-96 bg-[#0c0e14]/95 backdrop-blur-2xl border-l border-amber-500/30 p-6 z-40 text-stone-100 overflow-y-auto shadow-2xl"
    >
      {/* Drawer Header — Title first, wing metadata below */}
      <div className="flex items-start justify-between pb-4 mb-6 border-b border-amber-500/20">
        <div className="space-y-1">
          <h2 className="font-display text-xl font-semibold text-stone-100">{exhibit.name}</h2>
          <p className="text-xs font-sans text-amber-300/90">{exhibit.wing} · {exhibit.timeline}</p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close artifact details"
          className="p-2 rounded-lg bg-[#111520] border border-stone-800 text-stone-300 hover:text-stone-100 hover:bg-stone-800 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Return from Macro View button */}
      <button
        onClick={onClose}
        className="w-full mb-6 py-2.5 px-3 rounded-xl bg-amber-500/15 border border-amber-500/35 text-amber-300 text-xs font-sans font-semibold flex items-center justify-center gap-2 hover:bg-amber-500/25 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none transition-colors"
      >
        <ZoomOut className="w-4 h-4" /> Exit Macro Close-up View
      </button>

      {/* Overview */}
      <div className="mb-6 space-y-2">
        <h3 className="font-display text-sm font-semibold text-amber-300 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-400 shrink-0" /> Curatorial Overview
        </h3>
        <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">{exhibit.description}</p>
      </div>

      {/* Historical Context */}
      <div className="mb-6 space-y-2">
        <h3 className="font-display text-sm font-semibold text-amber-300 flex items-center gap-2">
          <History className="w-4 h-4 text-amber-400 shrink-0" /> Historical Origin &amp; Context
        </h3>
        <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">{exhibit.historicalContext}</p>
        <div className="mt-2 inline-block px-2.5 py-1 rounded bg-[#111520] border border-stone-800 text-xs font-sans text-amber-300">
          Era: {exhibit.timeline}
        </div>
      </div>

      {/* Cryptanalytic Profile / Vulnerabilities */}
      <div className="mb-6 space-y-2 p-4 rounded-xl bg-rose-950/30 border border-rose-500/30">
        <h3 className="font-display text-sm font-semibold text-rose-300 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" /> Cryptanalytic Profile
        </h3>
        <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">{exhibit.vulnerabilities}</p>
      </div>
    </div>
  );
}
