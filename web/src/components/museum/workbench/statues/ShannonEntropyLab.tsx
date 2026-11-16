'use client';

import React, { useState, useMemo } from 'react';
import { Binary, RotateCcw } from 'lucide-react';

const DEFAULT_SHANNON_MSG = 'SECRET MESSAGE';

export function ShannonEntropyLab() {
  const [shannonMessage, setShannonMessage] = useState(DEFAULT_SHANNON_MSG);
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

  return (
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
  );
}
