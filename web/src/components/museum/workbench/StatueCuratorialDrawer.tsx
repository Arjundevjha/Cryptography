'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { CryptographicStatue } from '../museumData';
import {
  X,
  BookOpen,
  FlaskConical,
  Award,
  Scroll,
  Key,
  BarChart3,
  Binary,
  Cpu,
  RotateCcw,
  CheckCircle2,
  AlertOctagon,
  Radio,
} from 'lucide-react';

interface StatueCuratorialDrawerProps {
  statue: CryptographicStatue;
  onClose: () => void;
  onSelectWing?: (wingId: string) => void;
}

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

export function StatueCuratorialDrawer({ statue, onClose }: StatueCuratorialDrawerProps) {
  const [activeTab, setActiveTab] = useState<'curation' | 'lab'>('curation');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // ==========================================
  // AL-KINDI INTERACTIVE FREQUENCY ANALYSIS STATE
  // ==========================================
  const defaultKindiText = 'KHOOR ZRUOG WKLV LV D VHFUHW PHVVDJH HQFUBSWHG ZLWK FDHVDU VKLIW';
  const [kindiCiphertext, setKindiCiphertext] = useState(defaultKindiText);
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
    return { letterCounts: counts, totalLetters: total, topCipherLetters: sorted };
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

  // ==========================================
  // ALAN TURING BLETCHLEY PARK BOMBE CRIB LAB STATE
  // ==========================================
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

  // ==========================================
  // CLAUDE SHANNON INFORMATION THEORY STATE
  // ==========================================
  const defaultShannonMsg = 'SECRET MESSAGE';
  const [shannonMessage, setShannonMessage] = useState(defaultShannonMsg);
  const [otpSeed, setOtpSeed] = useState(42);

  const shannonStats = useMemo(() => {
    const clean = shannonMessage.toUpperCase().replace(/[^A-Z]/g, '');
    if (clean.length === 0) return { plaintextEntropy: 0, ciphertextEntropy: 0, otpKey: '', ciphertext: '' };

    const counts: Record<string, number> = {};
    for (const ch of clean) {
      counts[ch] = (counts[ch] || 0) + 1;
    }
    let pEntropy = 0;
    for (const count of Object.values(counts)) {
      const p = count / clean.length;
      if (p > 0) pEntropy -= p * Math.log2(p);
    }

    let s = otpSeed;
    const keyChars: string[] = [];
    const cipherChars: string[] = [];
    for (let i = 0; i < clean.length; i++) {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      const kVal = s % 26;
      keyChars.push(String.fromCharCode(65 + kVal));
      const mVal = clean.charCodeAt(i) - 65;
      const cVal = (mVal ^ kVal) % 26;
      cipherChars.push(String.fromCharCode(65 + cVal));
    }

    const cCounts: Record<string, number> = {};
    for (const ch of cipherChars) {
      cCounts[ch] = (cCounts[ch] || 0) + 1;
    }
    let cEntropy = 0;
    for (const count of Object.values(cCounts)) {
      const p = count / cipherChars.length;
      if (p > 0) cEntropy -= p * Math.log2(p);
    }

    return {
      plaintextEntropy: Number(pEntropy.toFixed(3)),
      ciphertextEntropy: Number(cEntropy.toFixed(3)),
      otpKey: keyChars.join(''),
      ciphertext: cipherChars.join(''),
    };
  }, [shannonMessage, otpSeed]);

  // ==========================================
  // DIFFIE-HELLMAN KEY EXCHANGE STATE
  // ==========================================
  const dhPrime = 23;
  const dhGen = 5;
  const [alicePrivate, setAlicePrivate] = useState(6);
  const [bobPrivate, setBobPrivate] = useState(15);
  const [showMerklePuzzleInfo, setShowMerklePuzzleInfo] = useState(false);

  const modPow = (base: number, exp: number, mod: number) => {
    let res = 1;
    base = base % mod;
    let e = exp;
    while (e > 0) {
      if (e % 2 === 1) res = (res * base) % mod;
      base = (base * base) % mod;
      e = Math.floor(e / 2);
    }
    return res;
  };

  const dhCalculations = useMemo(() => {
    const alicePublic = modPow(dhGen, alicePrivate, dhPrime);
    const bobPublic = modPow(dhGen, bobPrivate, dhPrime);
    const aliceShared = modPow(bobPublic, alicePrivate, dhPrime);
    const bobShared = modPow(alicePublic, bobPrivate, dhPrime);
    return { alicePublic, bobPublic, aliceShared, bobShared };
  }, [dhPrime, dhGen, alicePrivate, bobPrivate]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Statue details for ${statue.name}`}
      className="museum-scroller fixed top-0 right-0 h-full w-full sm:w-[480px] md:w-[560px] bg-[#161412]/96 backdrop-blur-2xl border-l border-amber-500/30 p-6 z-50 text-stone-100 overflow-y-auto shadow-2xl"
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
        className="flex rounded-xl bg-[#221f1c] p-1 mb-6 border border-stone-800"
      >
        <button
          role="tab"
          aria-selected={activeTab === 'curation'}
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
          role="tab"
          aria-selected={activeTab === 'lab'}
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
        <div className="space-y-6">
          {/* Framed Archival Citation Plaque (1px full border, zero side-stripe slop) */}
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
        <div className="space-y-5">
          {/* 1. AL-KINDI: FREQUENCY ANALYSIS SIMULATOR */}
          {statue.interactiveDemoType === 'frequency-analysis' && (
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
          )}

          {/* 2. ALAN TURING: BLETCHLEY PARK BOMBE CRIB ALIGNMENT LAB */}
          {statue.interactiveDemoType === 'turing-bombe' && (
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
          )}

          {/* 3. CLAUDE SHANNON: ENTROPY & ONE-TIME PAD LAB */}
          {statue.interactiveDemoType === 'information-entropy' && (
            <div className="space-y-4">
              <p className="p-3.5 rounded-xl bg-[#111520] border border-amber-500/25 text-xs text-stone-200 font-sans leading-relaxed">
                Shannon proved that a One-Time Pad achieves <strong>Perfect Secrecy</strong> ($H(M|C) = H(M)$) by maximizing ciphertext entropy so that every plaintext remains equally probable to an eavesdropper.
              </p>

              <div>
                <label htmlFor="shannon-message-input" className="text-xs font-sans font-semibold text-stone-300 block mb-1.5">
                  Plaintext Input Message
                </label>
                <input
                  id="shannon-message-input"
                  type="text"
                  value={shannonMessage}
                  onChange={(e) => setShannonMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#111520] border border-stone-800 text-stone-100 font-mono text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition-colors"
                  placeholder="Enter message..."
                />
              </div>

              {/* Entropy Comparison Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#111520] border border-stone-800">
                  <div className="text-xs font-sans font-semibold text-stone-300">Plaintext Entropy H(M)</div>
                  <div className="text-xl font-bold font-mono text-amber-300 mt-1">
                    {shannonStats.plaintextEntropy}{' '}
                    <span className="text-[11px] text-stone-300 font-normal">bits/char</span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1 font-sans">Contains natural language redundancy</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#111520] border border-emerald-500/30">
                  <div className="text-xs font-sans font-semibold text-emerald-300">OTP Ciphertext H(C)</div>
                  <div className="text-xl font-bold font-mono text-emerald-300 mt-1">
                    {shannonStats.ciphertextEntropy}{' '}
                    <span className="text-[11px] text-stone-300 font-normal">bits/char</span>
                  </div>
                  <p className="text-[11px] text-stone-300 mt-1 font-sans">Uniform distribution (statistically opaque)</p>
                </div>
              </div>

              {/* One-Time Pad XOR Stream Visualizer */}
              <div className="p-3.5 rounded-xl bg-[#111520] border border-stone-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-sans font-semibold flex items-center gap-1.5 text-amber-300">
                    <Binary className="w-3.5 h-3.5" /> One-Time Pad Stream
                  </span>
                  <button
                    onClick={() => setOtpSeed((prev) => prev + 1)}
                    aria-label="Re-roll One-Time Pad keystream seed"
                    className="flex items-center gap-1 text-xs font-sans text-amber-300 hover:text-amber-200 rounded px-1.5 py-0.5 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" /> Re-roll Keystream
                  </button>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between p-2 rounded bg-[#090b10]">
                    <span className="font-sans text-stone-400">Plaintext (M):</span>
                    <span className="font-mono text-stone-200 font-bold tracking-wider">{shannonMessage.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-[#090b10]">
                    <span className="font-sans text-stone-400">Random Key (K):</span>
                    <span className="font-mono text-amber-300 font-bold tracking-wider">{shannonStats.otpKey}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-emerald-950/35 border border-emerald-500/30">
                    <span className="font-sans text-emerald-300 font-semibold">XOR Ciphertext:</span>
                    <span className="font-mono text-emerald-200 font-bold tracking-wider">{shannonStats.ciphertext}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. DIFFIE-HELLMAN & MERKLE KEY EXCHANGE LAB */}
          {statue.interactiveDemoType === 'key-exchange' && (
            <div className="space-y-4">
              <p className="p-3.5 rounded-xl bg-[#111520] border border-amber-500/25 text-xs text-stone-200 font-sans leading-relaxed">
                Diffie &amp; Hellman (building on Ralph Merkle&apos;s puzzles) solved the centuries-old <strong>key distribution problem</strong>: two strangers compute an identical shared secret across a public channel.
              </p>

              {/* Toggle Merkle Puzzles note */}
              <div
                role="tablist"
                aria-label="Key exchange concept explanation"
                className="flex rounded-lg bg-[#111520] p-1 border border-stone-800 text-xs font-sans"
              >
                <button
                  role="tab"
                  aria-selected={!showMerklePuzzleInfo}
                  onClick={() => setShowMerklePuzzleInfo(false)}
                  className={`flex-1 py-1.5 rounded text-center transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                    !showMerklePuzzleInfo ? 'bg-amber-500 text-stone-950 font-semibold' : 'text-stone-300 hover:text-stone-100'
                  }`}
                >
                  Diffie-Hellman Math
                </button>
                <button
                  role="tab"
                  aria-selected={showMerklePuzzleInfo}
                  onClick={() => setShowMerklePuzzleInfo(true)}
                  className={`flex-1 py-1.5 rounded text-center transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                    showMerklePuzzleInfo ? 'bg-amber-500 text-stone-950 font-semibold' : 'text-stone-300 hover:text-stone-100'
                  }`}
                >
                  Ralph Merkle&apos;s Puzzles
                </button>
              </div>

              {!showMerklePuzzleInfo ? (
                <>
                  {/* Public Parameters */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-[#111520] border border-stone-800">
                      <span className="font-sans text-stone-300 text-[11px] block">Public Prime (p):</span>
                      <span className="font-mono text-amber-300 font-bold text-sm">{dhPrime}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#111520] border border-stone-800">
                      <span className="font-sans text-stone-300 text-[11px] block">Public Generator (g):</span>
                      <span className="font-mono text-amber-300 font-bold text-sm">{dhGen}</span>
                    </div>
                  </div>

                  {/* Alice and Bob Private Key Inputs */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-[#111520] border border-stone-800 space-y-1.5">
                      <label htmlFor="dh-alice-private" className="text-[11px] font-sans text-amber-300 font-semibold block">
                        Alice Private (a): <span className="font-mono">{alicePrivate}</span>
                      </label>
                      <input
                        id="dh-alice-private"
                        type="range"
                        min="2"
                        max="20"
                        aria-label="Alice private key exponent"
                        value={alicePrivate}
                        onChange={(e) => setAlicePrivate(Number(e.target.value))}
                        className="w-full accent-amber-500 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none rounded"
                      />
                      <div className="text-[11px] font-mono text-stone-300 mt-1">
                        A = g^a mod p = <span className="text-stone-100 font-bold">{dhCalculations.alicePublic}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#111520] border border-stone-800 space-y-1.5">
                      <label htmlFor="dh-bob-private" className="text-[11px] font-sans text-emerald-300 font-semibold block">
                        Bob Private (b): <span className="font-mono">{bobPrivate}</span>
                      </label>
                      <input
                        id="dh-bob-private"
                        type="range"
                        min="2"
                        max="20"
                        aria-label="Bob private key exponent"
                        value={bobPrivate}
                        onChange={(e) => setBobPrivate(Number(e.target.value))}
                        className="w-full accent-emerald-500 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none rounded"
                      />
                      <div className="text-[11px] font-mono text-stone-300 mt-1">
                        B = g^b mod p = <span className="text-stone-100 font-bold">{dhCalculations.bobPublic}</span>
                      </div>
                    </div>
                  </div>

                  {/* Shared Secret Result */}
                  <div className="p-4 rounded-xl bg-[#111520] border border-amber-500/35 text-center space-y-1">
                    <span className="text-xs font-sans text-amber-300 font-semibold">
                      Agreed Shared Secret Key (S)
                    </span>
                    <div className="text-3xl font-bold font-mono text-amber-300">
                      {dhCalculations.aliceShared}
                    </div>
                    <p className="text-xs text-stone-300 font-sans">
                      Alice computed <span className="font-mono">B^a mod p = {dhCalculations.aliceShared}</span>. Bob computed{' '}
                      <span className="font-mono">A^b mod p = {dhCalculations.bobShared}</span>.
                    </p>
                  </div>
                </>
              ) : (
                <div className="p-4 rounded-xl bg-[#111520] border border-amber-500/30 space-y-3 text-xs font-sans text-stone-200 leading-relaxed">
                  <h4 className="font-display text-sm text-amber-300 font-semibold flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-amber-400" /> Ralph Merkle&apos;s Independent Puzzles (1974)
                  </h4>
                  <p>
                    While an undergraduate at UC Berkeley in 1974, <strong>Ralph Merkle</strong> independently conceptualized public-key exchange through &ldquo;Merkle&apos;s Puzzles&rdquo;.
                  </p>
                  <p>
                    Alice broadcasts $N$ moderate computational puzzles. Bob picks one random puzzle, solves it, and returns its identifier—forcing an eavesdropper to brute-force half the entire set.
                  </p>
                  <div className="p-3 rounded-lg bg-[#090b10] border border-stone-800 text-xs font-mono text-amber-200">
                    Legitimate Parties Work: O(N)<br />
                    Eavesdropper Work: O(N²) quadratic computational asymmetry
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
