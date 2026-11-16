'use client';

import React, { useState, useMemo } from 'react';
import { BarChart3 } from 'lucide-react';

const DEFAULT_KINDI_TEXT = 'KHOOR ZRUOG WKLV LV D VHFUHW PHVVDJH HQFUBSWHG ZLWK FDHVDU VKLIW';

export function AlKindiFrequencyLab() {
  const [kindiCiphertext, setKindiCiphertext] = useState(DEFAULT_KINDI_TEXT);
  const [kindiShiftGuess, setKindiShiftGuess] = useState(3);

  const { totalLetters, topCipherLetters } = useMemo(() => {
    const counts: Record<string, number> = {};
    let total = 0;
    const clean = kindiCiphertext.toUpperCase().replace(/[^A-Z]/g, '');
    for (const ch of clean) {
      counts[ch] = (counts[ch] || 0) + 1;
      total++;
    }
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return { totalLetters: total, topCipherLetters: sorted };
  }, [kindiCiphertext]);

  const kindiDecryptedPreview = useMemo(() => {
    return kindiCiphertext
      .toUpperCase()
      .split('')
      .map((ch) => {
        if (ch >= 'A' && ch <= 'Z') {
          const code = ch.charCodeAt(0) - 65;
          const shifted = (code - kindiShiftGuess + 26) % 26;
          return String.fromCharCode(shifted + 65);
        }
        return ch;
      })
      .join('');
  }, [kindiCiphertext, kindiShiftGuess]);

  return (
    <div className="space-y-4">
      <p className="p-3.5 rounded-xl bg-[#111520] border border-amber-500/25 text-xs text-stone-200 font-sans leading-relaxed">
        Al-Kindi proved that monoalphabetic substitution preserves underlying language letter distributions. Inspect the dominant character peaks below and test shift offsets.
      </p>

      <div>
        <label htmlFor="kindi-ciphertext-input" className="text-xs font-sans font-semibold text-stone-300 block mb-1.5">
          Ciphertext Sample
        </label>
        <textarea
          id="kindi-ciphertext-input"
          value={kindiCiphertext}
          onChange={(e) => setKindiCiphertext(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 rounded-xl bg-[#111520] border border-stone-800 text-stone-100 font-mono text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition-colors"
          placeholder="Enter ciphertext to analyze..."
        />
      </div>

      {/* Frequency Bars of Top Letters */}
      <div className="space-y-2.5 p-3.5 rounded-xl bg-[#111520] border border-stone-800">
        <div className="flex items-center justify-between text-xs">
          <span className="font-sans font-semibold text-amber-300 flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" /> Letter Frequency Histogram
          </span>
          <span className="font-mono text-stone-300">{totalLetters} characters</span>
        </div>

        <div className="grid grid-cols-6 gap-2 pt-1">
          {topCipherLetters.slice(0, 6).map(([char, count]) => {
            const pct = totalLetters > 0 ? (count / totalLetters) * 100 : 0;
            return (
              <div key={char} className="flex flex-col items-center bg-[#090b10] p-2 rounded-lg border border-stone-800">
                <span className="text-sm font-bold text-amber-300 font-mono">{char}</span>
                <div className="w-full bg-stone-800 h-12 rounded flex items-end my-1 overflow-hidden">
                  <div
                    className="w-full bg-amber-500 rounded-b transition-all duration-300"
                    style={{ height: `${Math.min(pct * 3.5, 100)}%` }}
                  />
                </div>
                <span className="text-[11px] font-mono text-stone-300">{pct.toFixed(0)}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Decipher Shift Tester */}
      <div className="p-3.5 rounded-xl bg-[#111520] border border-stone-800 space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="kindi-shift-input" className="text-xs font-sans font-semibold text-stone-200">
            Test Caesar Shift Key: <span className="font-mono text-amber-300">{kindiShiftGuess}</span>
          </label>
          <button
            onClick={() => setKindiShiftGuess(3)}
            aria-label="Set Caesar shift key to default value of 3"
            className="text-xs font-sans text-amber-300 hover:text-amber-200 underline rounded px-1 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none transition-colors"
          >
            Set Shift = 3 (Caesar)
          </button>
        </div>
        <input
          id="kindi-shift-input"
          type="range"
          min="0"
          max="25"
          aria-label="Test Caesar shift key"
          value={kindiShiftGuess}
          onChange={(e) => setKindiShiftGuess(Number(e.target.value))}
          className="w-full accent-amber-500 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none rounded"
        />

        <div className="p-3 rounded-lg bg-[#090b10] border border-stone-800">
          <span className="text-[11px] font-sans font-semibold text-amber-300 block mb-1">
            Statistical Decrypt Preview:
          </span>
          <p className="text-xs font-mono text-stone-200 break-words">{kindiDecryptedPreview}</p>
        </div>
      </div>
    </div>
  );
}
