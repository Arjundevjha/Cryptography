'use client';

import { CipherExhibit } from '../museumData';
import { X, BookOpen, ShieldAlert, History, ZoomOut } from 'lucide-react';

interface ArtifactMetadataDrawerProps {
  exhibit: CipherExhibit;
  onClose: () => void;
}

export function ArtifactMetadataDrawer({ exhibit, onClose }: ArtifactMetadataDrawerProps) {
  return (
    <div className="fixed top-0 right-0 h-full w-80 md:w-96 bg-stone-950/90 backdrop-blur-2xl border-l border-amber-500/30 p-6 z-40 text-stone-100 overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300">
      {/* Drawer Header */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-800">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase">{exhibit.wing}</span>
          <h2 className="text-xl font-bold text-stone-100">{exhibit.name}</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Return from Macro View button */}
      <button
        onClick={onClose}
        className="w-full mb-6 py-2 px-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-semibold flex items-center justify-center gap-2 hover:bg-amber-500/20 transition-all"
      >
        <ZoomOut className="w-4 h-4" /> Exit Macro Close-up View
      </button>

      {/* Overview */}
      <div className="mb-6 space-y-2">
        <h3 className="text-xs font-mono text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-amber-500" /> Curatorial Overview
        </h3>
        <p className="text-xs text-stone-300 leading-relaxed font-sans">{exhibit.description}</p>
      </div>

      {/* Historical Context */}
      <div className="mb-6 space-y-2">
        <h3 className="text-xs font-mono text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
          <History className="w-4 h-4 text-amber-500" /> Historical Origin & Context
        </h3>
        <p className="text-xs text-stone-300 leading-relaxed font-sans">{exhibit.historicalContext}</p>
        <div className="mt-2 inline-block px-2.5 py-1 rounded bg-stone-900 border border-stone-800 text-[11px] font-mono text-amber-300">
          Timeline: {exhibit.timeline}
        </div>
      </div>

      {/* Cryptanalytic Profile / Vulnerabilities */}
      <div className="mb-6 space-y-2 p-4 rounded-xl bg-red-950/30 border border-red-500/30">
        <h3 className="text-xs font-mono text-red-400 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-red-400" /> Cryptanalytic Profile
        </h3>
        <p className="text-xs text-stone-300 leading-relaxed font-sans">{exhibit.vulnerabilities}</p>
      </div>
    </div>
  );
}
