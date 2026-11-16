'use client';

import React, { useState, useMemo } from 'react';
import { Key } from 'lucide-react';

function modPow(base: number, exp: number, mod: number): number {
  let res = 1;
  let b = base % mod;
  let e = exp;
  while (e > 0) {
    if (e % 2 === 1) res = (res * b) % mod;
    b = (b * b) % mod;
    e = Math.floor(e / 2);
  }
  return res;
}

export function DiffieHellmanMerkleLab() {
  const dhPrime = 23;
  const dhGen = 5;
  const [alicePrivate, setAlicePrivate] = useState(6);
  const [bobPrivate, setBobPrivate] = useState(15);
  const [showMerklePuzzleInfo, setShowMerklePuzzleInfo] = useState(false);

  const dhCalculations = useMemo(() => {
    const alicePublic = modPow(dhGen, alicePrivate, dhPrime);
    const bobPublic = modPow(dhGen, bobPrivate, dhPrime);
    const aliceShared = modPow(bobPublic, alicePrivate, dhPrime);
    const bobShared = modPow(alicePublic, bobPrivate, dhPrime);
    return { alicePublic, bobPublic, aliceShared, bobShared };
  }, [dhPrime, dhGen, alicePrivate, bobPrivate]);

  return (
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
  );
}
