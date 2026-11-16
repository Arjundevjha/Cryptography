'use client';

import React, { useMemo } from 'react';
import { BarChart3, Sparkles, Check } from 'lucide-react';
import {
  computeLetterFrequencies,
  computeIndexOfCoincidence,
  crackCaesarCandidates,
  crackAffineCandidates,
  crackVigenereCandidate,
  suggestSubstitutionKey,
} from './utils/cryptanalysis';

interface FrequencyAnalysisViewProps {
  exhibitId: string;
  inputText: string;
  onApplyShift?: (shift: number) => void;
  onApplyAffine?: (a: number, b: number) => void;
  onApplyKey?: (key: string) => void;
  onLoadSample?: (sample: string) => void;
}

const SAMPLE_CIPHERTEXTS: Record<string, string> = {
  caesar: 'KHOOR PXVHXP ZRUOG WKLV LV D VHFUHW PHVVDJH',
  affine: 'RCLLA MUPWUM WAPLV THIX IX A XWCPWT MWCXAOW',
  vigenere: 'SIXPS QIGIYQ KSFPO KLLW WW E WSQFWX AIWWELW',
  substitution: 'QEB NRFZH YOLTK CLU GRJMP LSBO QEB IXWV ALD QEB NRFZH YOLTK',
};

export function FrequencyAnalysisView({
  exhibitId,
  inputText,
  onApplyShift,
  onApplyAffine,
  onApplyKey,
  onLoadSample,
}: FrequencyAnalysisViewProps) {
  const { frequencies, totalLetters } = useMemo(
    () => computeLetterFrequencies(inputText),
    [inputText]
  );

  const ioc = useMemo(() => computeIndexOfCoincidence(inputText), [inputText]);

  const topLetters = useMemo(
    () => [...frequencies].sort((a, b) => b.count - a.count).slice(0, 8),
    [frequencies]
  );

  const caesarTop = useMemo(
    () => (exhibitId === 'caesar' ? crackCaesarCandidates(inputText, 3) : []),
    [exhibitId, inputText]
  );

  const affineTop = useMemo(
    () => (exhibitId === 'affine' ? crackAffineCandidates(inputText, 3) : []),
    [exhibitId, inputText]
  );

  const vigenereBest = useMemo(
    () => (exhibitId === 'vigenere' ? crackVigenereCandidate(inputText, 6) : null),
    [exhibitId, inputText]
  );

  const substitutionSuggestion = useMemo(
    () => (exhibitId === 'substitution' && totalLetters > 0 ? suggestSubstitutionKey(inputText) : ''),
    [exhibitId, inputText, totalLetters]
  );

  const sampleText = SAMPLE_CIPHERTEXTS[exhibitId] || SAMPLE_CIPHERTEXTS.caesar;

  return (
    <div className="space-y-3" data-testid={`cryptanalysis-view-${exhibitId}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-display font-semibold text-amber-300 flex items-center gap-1.5">
          <BarChart3 className="w-3.5 h-3.5" /> Interactive Cryptanalysis
        </span>
        {onLoadSample && (
          <button
            type="button"
            onClick={() => onLoadSample(sampleText)}
            className="text-[11px] font-sans text-amber-300 hover:text-amber-200 underline rounded px-1 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
          >
            Load Sample Ciphertext
          </button>
        )}
      </div>

      {/* Index of Coincidence & Sample Size */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 rounded-lg bg-[#090b10] border border-stone-800">
          <span className="text-[11px] text-stone-400 block">Index of Coincidence</span>
          <span className="font-mono font-bold text-amber-300">{ioc.toFixed(4)}</span>
          <span className="text-[10px] text-stone-400 block mt-0.5">
            {ioc >= 0.055 ? 'Monoalphabetic (~0.067)' : totalLetters < 2 ? 'Need ≥2 letters' : 'Polyalphabetic / Flat'}
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-[#090b10] border border-stone-800">
          <span className="text-[11px] text-stone-400 block">Analyzed Letters</span>
          <span className="font-mono font-bold text-stone-100">{totalLetters}</span>
          <span className="text-[10px] text-stone-400 block mt-0.5">A–Z distribution</span>
        </div>
      </div>

      {/* Live Letter Frequency Bar Chart (Top 8 observed vs English expected) */}
      <div className="p-3 rounded-xl bg-[#090b10] border border-stone-800 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-stone-300">
          <span className="font-semibold">Top Letter Frequencies</span>
          <span className="text-stone-400">Amber = Observed · Slate = English</span>
        </div>
        {totalLetters === 0 ? (
          <p className="text-xs text-stone-400 italic py-2">Enter ciphertext in the Workbench tab to plot frequencies.</p>
        ) : (
          <div className="grid grid-cols-8 gap-1.5 pt-1">
            {topLetters.map((item) => (
              <div key={item.letter} className="flex flex-col items-center">
                <div className="w-full h-14 bg-stone-900 rounded flex items-end justify-center gap-0.5 p-0.5 overflow-hidden">
                  <div
                    className="w-1.5 bg-amber-500 rounded-t transition-all duration-300"
                    style={{ height: `${Math.min(item.percentage * 4.5, 100)}%` }}
                    title={`Observed ${item.letter}: ${item.percentage.toFixed(1)}%`}
                  />
                  <div
                    className="w-1 bg-stone-500/70 rounded-t"
                    style={{ height: `${Math.min(item.englishExpected * 4.5, 100)}%` }}
                    title={`English ${item.letter}: ${item.englishExpected.toFixed(1)}%`}
                  />
                </div>
                <span className="text-[11px] font-mono font-bold text-amber-300 mt-1">{item.letter}</span>
                <span className="text-[9px] font-mono text-stone-400">{item.percentage.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Automated Chi-Squared Key Recovery */}
      {totalLetters > 0 && (exhibitId === 'caesar' || exhibitId === 'affine' || exhibitId === 'vigenere' || exhibitId === 'substitution') && (
        <div className="p-3 rounded-xl bg-[#111520] border border-amber-500/25 space-y-2">
          <div className="text-xs font-display font-semibold text-amber-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Chi-Squared Key Recovery
          </div>

          {exhibitId === 'caesar' && caesarTop.map((cand, idx) => (
            <div key={cand.shift} className="p-2 rounded-lg bg-[#090b10] border border-stone-800 flex items-center justify-between gap-2 text-xs">
              <div className="min-w-0">
                <div className="font-mono text-amber-300 font-semibold">
                  #{idx + 1} Shift = {cand.shift} <span className="text-stone-400 text-[10px]">(χ² {cand.chiSquared.toFixed(1)})</span>
                </div>
                <div className="font-mono text-[11px] text-stone-300 truncate">{cand.preview}</div>
              </div>
              {onApplyShift && (
                <button
                  type="button"
                  onClick={() => onApplyShift(cand.shift)}
                  className="shrink-0 px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-sans font-semibold flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Apply
                </button>
              )}
            </div>
          ))}

          {exhibitId === 'affine' && affineTop.map((cand, idx) => (
            <div key={`${cand.a}-${cand.b}`} className="p-2 rounded-lg bg-[#090b10] border border-stone-800 flex items-center justify-between gap-2 text-xs">
              <div className="min-w-0">
                <div className="font-mono text-amber-300 font-semibold">
                  #{idx + 1} a={cand.a}, b={cand.b} <span className="text-stone-400 text-[10px]">(χ² {cand.chiSquared.toFixed(1)})</span>
                </div>
                <div className="font-mono text-[11px] text-stone-300 truncate">{cand.preview}</div>
              </div>
              {onApplyAffine && (
                <button
                  type="button"
                  onClick={() => onApplyAffine(cand.a, cand.b)}
                  className="shrink-0 px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-sans font-semibold flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Apply
                </button>
              )}
            </div>
          ))}

          {exhibitId === 'vigenere' && vigenereBest && (
            <div className="p-2 rounded-lg bg-[#090b10] border border-stone-800 flex items-center justify-between gap-2 text-xs">
              <div className="min-w-0">
                <div className="font-mono text-amber-300 font-semibold">
                  Key: &ldquo;{vigenereBest.key}&rdquo; (len {vigenereBest.keyLength})
                </div>
                <div className="font-mono text-[11px] text-stone-300 truncate">{vigenereBest.preview}</div>
              </div>
              {onApplyKey && (
                <button
                  type="button"
                  onClick={() => onApplyKey(vigenereBest.key)}
                  className="shrink-0 px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-sans font-semibold flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Apply
                </button>
              )}
            </div>
          )}

          {exhibitId === 'substitution' && substitutionSuggestion && (
            <div className="p-2 rounded-lg bg-[#090b10] border border-stone-800 space-y-1.5 text-xs">
              <div className="text-[11px] text-stone-300">Frequency-aligned 26-letter key suggestion:</div>
              <div className="font-mono text-[11px] text-amber-300 break-all">{substitutionSuggestion}</div>
              {onApplyKey && (
                <button
                  type="button"
                  onClick={() => onApplyKey(substitutionSuggestion)}
                  className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-sans font-semibold flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Apply Suggested Key
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
