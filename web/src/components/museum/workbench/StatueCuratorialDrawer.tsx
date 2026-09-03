'use client';

import React, { useState, useMemo } from 'react';
import { CryptographicStatue } from '../museumData';
import {
  X,
  BookOpen,
  Sparkles,
  Award,
  Scroll,
  Key,
  BarChart3,
  Binary,
  Cpu,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

interface StatueCuratorialDrawerProps {
  statue: CryptographicStatue;
  onClose: () => void;
  onSelectWing?: (wingId: string) => void;
}

export function StatueCuratorialDrawer({ statue, onClose }: StatueCuratorialDrawerProps) {
  const [activeTab, setActiveTab] = useState<'curation' | 'lab'>('curation');

  // ==========================================
  // AL-KINDI INTERACTIVE FREQUENCY ANALYSIS STATE
  // ==========================================
  const defaultKindiText = 'KHOOR ZRUOG WKLV LV D VHFUHW PHVVDJH HQFUBSWHG ZLWK FDHVDU VKLIW';
  const [kindiCiphertext, setKindiCiphertext] = useState(defaultKindiText);
  const [kindiShiftGuess, setKindiShiftGuess] = useState(3);

  // Calculated frequencies of input
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
  // CLAUDE SHANNON INFORMATION THEORY STATE
  // ==========================================
  const defaultShannonMsg = 'SECRET MESSAGE';
  const [shannonMessage, setShannonMessage] = useState(defaultShannonMsg);
  const [otpSeed, setOtpSeed] = useState(42);

  const shannonStats = useMemo(() => {
    const clean = shannonMessage.toUpperCase().replace(/[^A-Z]/g, '');
    if (clean.length === 0) return { plaintextEntropy: 0, ciphertextEntropy: 0, otpKey: '', ciphertext: '' };

    // 1. Plaintext Entropy H(M)
    const counts: Record<string, number> = {};
    for (const ch of clean) {
      counts[ch] = (counts[ch] || 0) + 1;
    }
    let pEntropy = 0;
    for (const count of Object.values(counts)) {
      const p = count / clean.length;
      if (p > 0) pEntropy -= p * Math.log2(p);
    }

    // 2. Deterministic pseudo-random OTP key generator based on seed
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

    // 3. Ciphertext Entropy H(C)
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
      aria-label={`Statue details for ${statue.name}`}
      className="fixed top-0 right-0 h-full w-full sm:w-[480px] md:w-[560px] bg-stone-950/95 backdrop-blur-2xl border-l border-amber-500/40 p-6 z-50 text-stone-100 overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between pb-4 mb-4 border-b border-stone-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono text-amber-300 font-bold uppercase tracking-wider">
              {statue.title}
            </span>
            <span className="text-xs font-mono text-stone-400">{statue.lifespan}</span>
          </div>
          <h2 className="text-2xl font-black text-stone-100 tracking-tight">{statue.name}</h2>
          <p className="text-xs text-amber-400/90 font-mono italic">{statue.landmarkPaper}</p>
        </div>

        <button
          onClick={onClose}
          aria-label="Close statue details"
          className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-100 hover:bg-stone-800 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex rounded-xl bg-stone-900/90 p-1 mb-6 border border-stone-800">
        <button
          onClick={() => setActiveTab('curation')}
          className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'curation'
              ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <BookOpen className="w-4 h-4" /> HISTORICAL CURATION
        </button>
        <button
          onClick={() => setActiveTab('lab')}
          className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'lab'
              ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Sparkles className="w-4 h-4" /> INTERACTIVE PIONEER LAB
        </button>
      </div>

      {/* TAB 1: CURATORIAL OVERVIEW & USER CITATION */}
      {activeTab === 'curation' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Highlighted Historical Citation (Prompt Requirement) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 to-stone-900 border border-amber-500/40 shadow-inner space-y-2">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Scroll className="w-4 h-4 text-amber-400" /> Curatorial Landmark Citation
            </div>
            <p className="text-xs sm:text-sm text-stone-200 font-serif leading-relaxed italic border-l-2 border-amber-500 pl-3">
              &ldquo;{statue.description}&rdquo;
            </p>
          </div>

          {/* Historical Significance */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono text-amber-400 uppercase tracking-wider flex items-center gap-1.5 font-bold">
              <Award className="w-4 h-4 text-amber-500" /> Historical Epoch & Impact
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed font-sans">{statue.historicalSignificance}</p>
          </div>

          {/* Core Mathematical Breakthrough */}
          <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-2">
            <h3 className="text-xs font-mono text-amber-400 uppercase tracking-wider flex items-center gap-1.5 font-bold">
              <Cpu className="w-4 h-4 text-amber-500" /> Core Breakthrough
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed font-sans">{statue.coreBreakthrough}</p>
          </div>

          {/* Key Contributions */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono text-amber-400 uppercase tracking-wider flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4 text-amber-500" /> Key Cryptographic Contributions
            </h3>
            <ul className="space-y-2">
              {statue.keyContributions.map((contrib, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-stone-300 font-sans">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span>{contrib}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Wing Portal Link */}
          <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-xs font-mono">
            <span className="text-stone-400">Associated Wing:</span>
            <span className="text-amber-400 font-bold">{statue.associatedWing}</span>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE PIONEER LAB */}
      {activeTab === 'lab' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* 1. AL-KINDI: FREQUENCY ANALYSIS SIMULATOR */}
          {statue.interactiveDemoType === 'frequency-analysis' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 font-sans leading-relaxed">
                Al-Kindi proved that monoalphabetic substitution can be broken by counting letter frequencies. Test his method below by inspecting letter distributions and testing shift values!
              </div>

              <div>
                <label className="text-[11px] font-mono text-stone-400 uppercase font-bold block mb-1">
                  Ciphertext Sample
                </label>
                <textarea
                  value={kindiCiphertext}
                  onChange={(e) => setKindiCiphertext(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 font-mono text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  placeholder="Enter ciphertext to analyze..."
                />
              </div>

              {/* Frequency Bars of Top Letters */}
              <div className="space-y-2 p-3 rounded-xl bg-stone-900 border border-stone-800">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5" /> Letter Frequency Histogram
                  </span>
                  <span className="text-stone-400">{totalLetters} characters</span>
                </div>

                <div className="grid grid-cols-6 gap-2 pt-2">
                  {topCipherLetters.slice(0, 6).map(([char, count]) => {
                    const pct = totalLetters > 0 ? (count / totalLetters) * 100 : 0;
                    return (
                      <div key={char} className="flex flex-col items-center bg-stone-950 p-2 rounded-lg border border-stone-800">
                        <span className="text-sm font-black text-amber-400 font-mono">{char}</span>
                        <div className="w-full bg-stone-800 h-12 rounded flex items-end my-1 overflow-hidden">
                          <div
                            className="w-full bg-amber-500 rounded-b transition-all duration-300"
                            style={{ height: `${Math.min(pct * 3.5, 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-stone-300">{pct.toFixed(0)}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Decipher Shift Tester */}
              <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold text-stone-300">
                    Test Caesar Shift Key: <span className="text-amber-400">{kindiShiftGuess}</span>
                  </label>
                  <button
                    onClick={() => setKindiShiftGuess(3)}
                    className="text-[10px] font-mono text-amber-400 hover:text-amber-300 underline"
                  >
                    Set Shift = 3 (Caesar)
                  </button>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={kindiShiftGuess}
                  onChange={(e) => setKindiShiftGuess(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />

                <div className="p-2.5 rounded-lg bg-stone-950 border border-stone-800">
                  <span className="text-[10px] font-mono text-amber-500 block mb-0.5">STATISTICAL DECRYPT PREVIEW:</span>
                  <p className="text-xs font-mono text-stone-200 break-words">{kindiDecryptedPreview}</p>
                </div>
              </div>
            </div>
          )}

          {/* 2. CLAUDE SHANNON: ENTROPY & ONE-TIME PAD LAB */}
          {statue.interactiveDemoType === 'information-entropy' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-xs text-sky-200 font-sans leading-relaxed">
                Shannon proved that a One-Time Pad achieves <strong>Perfect Secrecy</strong> ($H(M|C) = H(M)$) by maximizing ciphertext entropy so that every plaintext is equally probable to an attacker.
              </div>

              <div>
                <label className="text-[11px] font-mono text-stone-400 uppercase font-bold block mb-1">
                  Plaintext Input Message
                </label>
                <input
                  type="text"
                  value={shannonMessage}
                  onChange={(e) => setShannonMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 font-mono text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
                  placeholder="Enter message..."
                />
              </div>

              {/* Entropy Comparison Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-stone-900 border border-stone-800">
                  <div className="text-[10px] font-mono text-stone-400 uppercase">Plaintext Entropy H(M)</div>
                  <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                    {shannonStats.plaintextEntropy}{' '}
                    <span className="text-[10px] text-stone-400 font-normal">bits/char</span>
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1">Contains predictable language redundancy</p>
                </div>

                <div className="p-3 rounded-xl bg-stone-900 border border-sky-500/30">
                  <div className="text-[10px] font-mono text-sky-400 uppercase">OTP Ciphertext H(C)</div>
                  <div className="text-xl font-bold font-mono text-sky-400 mt-1">
                    {shannonStats.ciphertextEntropy}{' '}
                    <span className="text-[10px] text-stone-400 font-normal">bits/char</span>
                  </div>
                  <p className="text-[10px] text-sky-300/80 mt-1">Uniform maximum entropy (pure noise)</p>
                </div>
              </div>

              {/* One-Time Pad XOR Stream Visualizer */}
              <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-stone-300">
                  <span className="flex items-center gap-1.5 text-sky-400">
                    <Binary className="w-3.5 h-3.5" /> One-Time Pad Stream
                  </span>
                  <button
                    onClick={() => setOtpSeed((prev) => prev + 1)}
                    className="flex items-center gap-1 text-[10px] text-sky-400 hover:text-sky-300"
                  >
                    <RotateCcw className="w-3 h-3" /> Re-roll Keystream
                  </button>
                </div>

                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between p-2 rounded bg-stone-950">
                    <span className="text-stone-500">PLAINTEXT (M):</span>
                    <span className="text-stone-200 font-bold tracking-wider">{shannonMessage.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-stone-950">
                    <span className="text-stone-500">RANDOM KEY (K):</span>
                    <span className="text-amber-400 font-bold tracking-wider">{shannonStats.otpKey}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-sky-950/40 border border-sky-500/30">
                    <span className="text-sky-400 font-bold">XOR CIPHERTEXT:</span>
                    <span className="text-sky-300 font-bold tracking-wider">{shannonStats.ciphertext}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. DIFFIE-HELLMAN & MERKLE KEY EXCHANGE LAB */}
          {statue.interactiveDemoType === 'key-exchange' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs text-purple-200 font-sans leading-relaxed">
                Diffie & Hellman (with Ralph Merkle) solved the ancient <strong>key distribution problem</strong>. Two parties calculate a shared secret over an eavesdropped channel without ever meeting!
              </div>

              {/* Toggle Merkle Puzzles note */}
              <div className="flex rounded-lg bg-stone-900 p-1 border border-stone-800 text-xs font-mono">
                <button
                  onClick={() => setShowMerklePuzzleInfo(false)}
                  className={`flex-1 py-1.5 rounded text-center transition-all ${
                    !showMerklePuzzleInfo ? 'bg-purple-600 text-white font-bold' : 'text-stone-400'
                  }`}
                >
                  Diffie-Hellman Math
                </button>
                <button
                  onClick={() => setShowMerklePuzzleInfo(true)}
                  className={`flex-1 py-1.5 rounded text-center transition-all ${
                    showMerklePuzzleInfo ? 'bg-purple-600 text-white font-bold' : 'text-stone-400'
                  }`}
                >
                  Ralph Merkle&apos;s Puzzles
                </button>
              </div>

              {!showMerklePuzzleInfo ? (
                <>
                  {/* Public Parameters */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                      <span className="text-stone-400 text-[10px] block">PUBLIC PRIME (p):</span>
                      <span className="text-amber-400 font-bold text-sm">{dhPrime}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                      <span className="text-stone-400 text-[10px] block">PUBLIC GENERATOR (g):</span>
                      <span className="text-amber-400 font-bold text-sm">{dhGen}</span>
                    </div>
                  </div>

                  {/* Alice and Bob Private Key Inputs */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                      <label className="text-[10px] font-mono text-purple-300 font-bold block">
                        ALICE PRIVATE (a): {alicePrivate}
                      </label>
                      <input
                        type="range"
                        min="2"
                        max="20"
                        value={alicePrivate}
                        onChange={(e) => setAlicePrivate(Number(e.target.value))}
                        className="w-full accent-purple-500"
                      />
                      <div className="text-[10px] font-mono text-stone-400 mt-1">
                        Public A = g^a mod p = <span className="text-stone-100 font-bold">{dhCalculations.alicePublic}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                      <label className="text-[10px] font-mono text-cyan-300 font-bold block">
                        BOB PRIVATE (b): {bobPrivate}
                      </label>
                      <input
                        type="range"
                        min="2"
                        max="20"
                        value={bobPrivate}
                        onChange={(e) => setBobPrivate(Number(e.target.value))}
                        className="w-full accent-cyan-500"
                      />
                      <div className="text-[10px] font-mono text-stone-400 mt-1">
                        Public B = g^b mod p = <span className="text-stone-100 font-bold">{dhCalculations.bobPublic}</span>
                      </div>
                    </div>
                  </div>

                  {/* Shared Secret Result */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 to-stone-900 border border-purple-500/40 text-center space-y-1">
                    <span className="text-[10px] font-mono text-purple-300 uppercase font-bold tracking-wider">
                      AGREED SHARED SECRET KEY (S)
                    </span>
                    <div className="text-3xl font-black font-mono text-purple-400">
                      {dhCalculations.aliceShared}
                    </div>
                    <p className="text-[10px] text-stone-400 font-sans">
                      Alice computed B^a mod p = {dhCalculations.aliceShared}. Bob computed A^b mod p = {dhCalculations.bobShared}. Both identical!
                    </p>
                  </div>
                </>
              ) : (
                <div className="p-4 rounded-xl bg-stone-900 border border-purple-500/30 space-y-3 text-xs font-sans text-stone-300 leading-relaxed">
                  <h4 className="font-mono text-purple-400 font-bold flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-purple-400" /> Ralph Merkle&apos;s Independent Puzzles (1974)
                  </h4>
                  <p>
                    While an undergraduate at UC Berkeley in 1974, <strong>Ralph Merkle</strong> independently conceptualized public-key cryptography through &quot;Merkle&apos;s Puzzles&quot;.
                  </p>
                  <p>
                    Alice broadcasts $N$ moderate computational puzzles (e.g. 10,000 puzzles, each requiring 2 minutes of brute force). Bob picks one random puzzle, solves it, and returns the puzzle ID.
                  </p>
                  <div className="p-2.5 rounded-lg bg-stone-950 border border-stone-800 text-[11px] font-mono text-purple-300">
                    Legitimate Parties Work: O(N)<br />
                    Eavesdropper Work: O(N²) quadratic computational asymmetry!
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
