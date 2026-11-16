'use client';

import React, { useState, useMemo } from 'react';
import { Radio, AlertOctagon, Cpu, CheckCircle2 } from 'lucide-react';

const BOMBE_CIPHERTEXT = 'QEWTPZKLYNQMXBJCDFUIOHAGSV';
const BOMBE_CRIB = 'WETTERVORHERSAGE';
const BOMBE_ROTOR_SETTINGS = [
  'A-A-A',
  'A-G-M',
  'A-P-V',
  'B-C-R',
  'B-K-F',
  'B-T-Z',
  'C-D-L',
  'C-M-Q',
  'D-E-W',
  'D-N-H',
  'E-F-S',
];

export function TuringBombeLab() {
  const [cribOffset, setCribOffset] = useState<number>(0);

  const bombeAlignment = useMemo(() => {
    const windowSlice = BOMBE_CIPHERTEXT.slice(cribOffset, cribOffset + BOMBE_CRIB.length);
    const crashes: number[] = [];
    for (let i = 0; i < BOMBE_CRIB.length; i++) {
      if (windowSlice[i] === BOMBE_CRIB[i]) {
        crashes.push(i);
      }
    }
    // Offset 4 ('B-K-F') has zero letter crashes AND passes Welchman's Diagonal Board loop check
    const isValidStop = crashes.length === 0 && cribOffset === 4;
    const diagonalContradiction = crashes.length === 0 && cribOffset !== 4;
    return {
      windowSlice,
      crashes,
      isValidStop,
      diagonalContradiction,
      rotorStellung: BOMBE_ROTOR_SETTINGS[cribOffset] || 'A-A-A',
    };
  }, [cribOffset]);

  return (
    <div className="space-y-4">
      <p className="p-3.5 rounded-xl bg-[#111520] border border-amber-500/25 text-xs text-stone-200 font-sans leading-relaxed">
        Enigma&apos;s reflector could <strong>never encrypt a letter to itself</strong>. At Hut 8, Turing slid known German weather phrases (<em>cribs</em>) against intercepted radio dispatches—instantly rejecting alignments where any letter matched itself, then testing surviving stops on the Bombe&apos;s electromechanical rotor banks.
      </p>

      {/* Intercept & Crib Alignment Strip */}
      <div className="p-4 rounded-xl bg-[#111520] border border-stone-800 space-y-3">
        <div className="flex items-center justify-between text-xs font-sans">
          <span className="font-semibold text-amber-300 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5" /> Naval Intercept Crib Alignment
          </span>
          <span className="font-mono text-stone-300">
            Stellung: <strong className="text-amber-300">{bombeAlignment.rotorStellung}</strong>
          </span>
        </div>

        {/* Character-by-character comparison cells */}
        <div className="p-3 rounded-lg bg-[#090b10] border border-stone-800 overflow-x-auto">
          <div className="grid grid-cols-[repeat(16,minmax(0,1fr))] gap-1 min-w-[380px] text-center font-mono text-xs">
            {BOMBE_CRIB.split('').map((cribChar, idx) => {
              const cipherChar = bombeAlignment.windowSlice[idx] || '?';
              const isCrash = cipherChar === cribChar;
              return (
                <div
                  key={idx}
                  className={`flex flex-col items-center py-1.5 rounded border ${
                    isCrash
                      ? 'bg-rose-950/70 border-rose-500/70 text-rose-200'
                      : bombeAlignment.isValidStop
                      ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
                      : 'bg-stone-900/70 border-stone-800 text-stone-200'
                  }`}
                >
                  <span className="text-[11px] font-bold">{cipherChar}</span>
                  <span className="text-[9px] text-stone-400 my-0.5">↕</span>
                  <span className="text-[11px] text-amber-300 font-bold">{cribChar}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Crib Offset Slider & Auto-Find Stop Button */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <label htmlFor="turing-crib-offset" className="text-xs font-sans font-semibold text-stone-200">
              Slide Crib Offset Position: <span className="font-mono text-amber-300">+{cribOffset}</span>
            </label>
            <button
              onClick={() => setCribOffset(4)}
              aria-label="Sweep Bombe drums to valid rotor stop"
              className="text-xs font-sans text-amber-300 hover:text-amber-200 underline rounded px-1.5 py-0.5 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none transition-colors"
            >
              Auto-Sweep Bombe Stop
            </button>
          </div>
          <input
            id="turing-crib-offset"
            type="range"
            min="0"
            max="10"
            aria-label="Slide Crib Offset Position"
            value={cribOffset}
            onChange={(e) => setCribOffset(Number(e.target.value))}
            className="w-full accent-amber-500 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none rounded"
          />
        </div>
      </div>

      {/* Bombe Electrical Diagnostic Result */}
      {bombeAlignment.crashes.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-950/35 border border-rose-500/40 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-sans font-semibold text-rose-300">
            <AlertOctagon className="w-4 h-4 shrink-0" />
            <span>Impossible Alignment — Self-Encryption Crash Detected</span>
          </div>
          <p className="text-xs text-stone-300 font-sans leading-relaxed">
            {bombeAlignment.crashes.length} position(s) map a letter directly to itself (e.g.{' '}
            <span className="font-mono text-rose-200">
              {BOMBE_CRIB[bombeAlignment.crashes[0]]} → {BOMBE_CRIB[bombeAlignment.crashes[0]]}
            </span>
            ). Enigma&apos;s reflector makes this physically impossible—alignment rejected before running the Bombe.
          </p>
        </div>
      )}

      {bombeAlignment.diagonalContradiction && (
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/35 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-sans font-semibold text-amber-300">
            <Cpu className="w-4 h-4 shrink-0" />
            <span>Zero Self-Crashes — Rejected by Welchman&apos;s Diagonal Board</span>
          </div>
          <p className="text-xs text-stone-300 font-sans leading-relaxed">
            No letter maps to itself here, so the Bombe tests rotor setting{' '}
            <span className="font-mono text-amber-300">{bombeAlignment.rotorStellung}</span>. However, electrical current cascades across all 26 Steckerbrett wires, proving a logical contradiction. Keep sliding!
          </p>
        </div>
      )}

      {bombeAlignment.isValidStop && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/45 space-y-2">
          <div className="flex items-center gap-2 text-xs font-sans font-semibold text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Bombe Drum Stop Registered — Daily Enigma Key Broken</span>
          </div>
          <p className="text-xs text-stone-200 font-sans leading-relaxed">
            Consistent electrical circuit found at rotor setting <span className="font-mono text-emerald-300">B-K-F</span> with zero contradictions. Decoded ULTRA dispatch:
          </p>
          <div className="p-2.5 rounded-lg bg-[#090b10] border border-emerald-500/30 font-mono text-xs text-emerald-200">
            0600 HRS: WETTERVORHERSAGE NORDATLANTIK KONVOI SIGHTED AT GRID AK47
          </div>
        </div>
      )}
    </div>
  );
}
