'use client';

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import {
  buildPlayfairTrace,
  buildEnigmaTrace,
  buildAesStateMatrix,
  safeModPow,
} from './utils/stepTrace';

interface StepInspectorViewProps {
  exhibitId: string;
  inputText: string;
  keyPhrase: string;
  shift: number;
  enigmaRotors: string[];
  enigmaPositions: string[];
  enigmaReflector: string;
  enigmaPlugboard: string;
  dhPrime: number;
  dhGen: number;
  dhAlice: number;
  dhBob: number;
}

export function StepInspectorView({
  exhibitId,
  inputText,
  keyPhrase,
  shift,
  enigmaRotors,
  enigmaPositions,
  enigmaReflector,
  enigmaPlugboard,
  dhPrime,
  dhGen,
  dhAlice,
  dhBob,
}: StepInspectorViewProps) {
  const [stepIdx, setStepIdx] = useState(0);

  const playfairTrace = useMemo(
    () => (exhibitId === 'playfair' ? buildPlayfairTrace(inputText, keyPhrase) : null),
    [exhibitId, inputText, keyPhrase]
  );

  const enigmaTrace = useMemo(
    () =>
      exhibitId === 'enigma'
        ? buildEnigmaTrace(inputText, enigmaPositions, enigmaRotors, enigmaReflector, enigmaPlugboard)
        : [],
    [exhibitId, inputText, enigmaPositions, enigmaRotors, enigmaReflector, enigmaPlugboard]
  );

  const aesMatrix = useMemo(
    () => (exhibitId === 'aes' ? buildAesStateMatrix(inputText) : []),
    [exhibitId, inputText]
  );

  const dhMath = useMemo(() => {
    const publicA = safeModPow(dhGen, dhAlice, dhPrime);
    const publicB = safeModPow(dhGen, dhBob, dhPrime);
    const sharedAlice = safeModPow(publicB, dhAlice, dhPrime);
    const sharedBob = safeModPow(publicA, dhBob, dhPrime);
    return { publicA, publicB, sharedAlice, sharedBob };
  }, [dhPrime, dhGen, dhAlice, dhBob]);

  if (exhibitId === 'playfair' && playfairTrace) {
    const total = playfairTrace.steps.length;
    const safeIdx = total > 0 ? Math.min(stepIdx, total - 1) : 0;
    const active = playfairTrace.steps[safeIdx];

    return (
      <div className="space-y-3" data-testid="step-inspector-playfair">
        <div className="flex items-center justify-between text-xs">
          <span className="font-display font-semibold text-amber-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" /> Playfair 5×5 Grid Inspector
          </span>
          {total > 0 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Previous Playfair step"
                onClick={() => setStepIdx(Math.max(0, safeIdx - 1))}
                disabled={safeIdx === 0}
                className="p-1 rounded bg-[#090b10] border border-stone-800 text-stone-300 disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] text-stone-300 px-1">
                {safeIdx + 1}/{total}
              </span>
              <button
                type="button"
                aria-label="Next Playfair step"
                onClick={() => setStepIdx(Math.min(total - 1, safeIdx + 1))}
                disabled={safeIdx >= total - 1}
                className="p-1 rounded bg-[#090b10] border border-stone-800 text-stone-300 disabled:opacity-40"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* 5x5 Playfair Key Square */}
        <div className="grid grid-cols-5 gap-1 p-2.5 rounded-xl bg-[#090b10] border border-stone-800">
          {playfairTrace.grid.map((row, r) =>
            row.map((cell, c) => {
              const isIn =
                active &&
                ((active.pos1.row === r && active.pos1.col === c) ||
                  (active.pos2.row === r && active.pos2.col === c));
              const isOut =
                active &&
                ((active.outPos1.row === r && active.outPos1.col === c) ||
                  (active.outPos2.row === r && active.outPos2.col === c));

              return (
                <div
                  key={`${r}-${c}`}
                  className={`py-1.5 text-center rounded font-mono text-xs font-bold border ${
                    isIn
                      ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                      : isOut
                      ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200'
                      : 'bg-stone-900/60 border-stone-800 text-stone-300'
                  }`}
                >
                  {cell}
                </div>
              );
            })
          )}
        </div>

        {active && (
          <div className="p-2.5 rounded-lg bg-[#111520] border border-stone-800 text-xs font-mono space-y-1">
            <div className="text-stone-200">
              Digraph <span className="text-amber-300 font-bold">{active.pair.join('')}</span> →{' '}
              <span className="text-emerald-300 font-bold">{active.outPair.join('')}</span>
            </div>
            <div className="text-[11px] text-stone-400 font-sans">Rule applied: {active.rule}</div>
          </div>
        )}
      </div>
    );
  }

  if (exhibitId === 'enigma') {
    const total = enigmaTrace.length;
    const safeIdx = total > 0 ? Math.min(stepIdx, total - 1) : 0;
    const active = enigmaTrace[safeIdx];

    return (
      <div className="space-y-3" data-testid="step-inspector-enigma">
        <div className="flex items-center justify-between text-xs">
          <span className="font-display font-semibold text-amber-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" /> Enigma Rotor &amp; Plugboard Trace
          </span>
          {total > 0 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Previous Enigma step"
                onClick={() => setStepIdx(Math.max(0, safeIdx - 1))}
                disabled={safeIdx === 0}
                className="p-1 rounded bg-[#090b10] border border-stone-800 text-stone-300 disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] text-stone-300 px-1">
                {safeIdx + 1}/{total}
              </span>
              <button
                type="button"
                aria-label="Next Enigma step"
                onClick={() => setStepIdx(Math.min(total - 1, safeIdx + 1))}
                disabled={safeIdx >= total - 1}
                className="p-1 rounded bg-[#090b10] border border-stone-800 text-stone-300 disabled:opacity-40"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {active ? (
          <div className="p-3 rounded-xl bg-[#090b10] border border-stone-800 space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-stone-400 font-sans">Keystroke:</span>
              <span className="text-amber-300 font-bold">{active.inputChar}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400 font-sans">Steckerbrett (Plugboard):</span>
              <span className="text-stone-200">{active.plugboardOut}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400 font-sans">Stepped Rotors ({enigmaRotors.join('-')}):</span>
              <span className="text-emerald-300 font-bold">{active.rotorPositions.join(' - ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400 font-sans">Reflector (UKW):</span>
              <span className="text-amber-200">{active.reflector}</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-stone-400 italic">Enter A–Z characters to trace rotor stepping.</p>
        )}
      </div>
    );
  }

  if (exhibitId === 'diffie-hellman') {
    return (
      <div className="space-y-3" data-testid="step-inspector-diffie-hellman">
        <div className="text-xs font-display font-semibold text-amber-300 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" /> Modular Exponentiation Steps
        </div>
        <div className="p-3 rounded-xl bg-[#090b10] border border-stone-800 space-y-2 text-xs font-mono">
          <div className="text-stone-300">
            1. Public: p = <span className="text-amber-300">{dhPrime}</span>, g = <span className="text-amber-300">{dhGen}</span>
          </div>
          <div className="text-stone-300">
            2. Alice: A = {dhGen}^{dhAlice} mod {dhPrime} = <span className="text-amber-300 font-bold">{dhMath.publicA}</span>
          </div>
          <div className="text-stone-300">
            3. Bob: B = {dhGen}^{dhBob} mod {dhPrime} = <span className="text-emerald-300 font-bold">{dhMath.publicB}</span>
          </div>
          <div className="pt-1 border-t border-stone-800 text-emerald-300 font-bold">
            4. Shared: S = {dhMath.publicB}^{dhAlice} mod {dhPrime} = {dhMath.sharedAlice} (≡ {dhMath.publicA}^{dhBob} mod {dhPrime} = {dhMath.sharedBob})
          </div>
        </div>
      </div>
    );
  }

  if (exhibitId === 'aes') {
    return (
      <div className="space-y-3" data-testid="step-inspector-aes">
        <div className="text-xs font-display font-semibold text-amber-300 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" /> AES 4×4 Rijndael State Matrix (Hex)
        </div>
        <div className="grid grid-cols-4 gap-1.5 p-3 rounded-xl bg-[#090b10] border border-stone-800 font-mono text-xs text-center">
          {aesMatrix.map((row, r) =>
            row.map((byte, c) => (
              <div key={`${r}-${c}`} className="py-1.5 rounded bg-stone-900 border border-stone-800 text-amber-300">
                0x{byte}
              </div>
            ))
          )}
        </div>
        <p className="text-[11px] text-stone-400 font-sans">
          10 rounds (AES-128): SubBytes → ShiftRows → MixColumns → AddRoundKey.
        </p>
      </div>
    );
  }

  if (exhibitId === 'rsa-signatures') {
    return (
      <div className="space-y-3" data-testid="step-inspector-rsa-signatures">
        <div className="text-xs font-display font-semibold text-amber-300 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" /> RSA-SHA256 Sign &amp; Verify Protocol
        </div>
        <div className="p-3 rounded-xl bg-[#090b10] border border-stone-800 space-y-2 text-xs font-mono">
          <div className="text-stone-300">1. Hash: <span className="text-amber-300">h = SHA-256(m) mod n</span></div>
          <div className="text-stone-300">2. Sign: <span className="text-amber-300">s = hᵈ mod n</span> (private key d)</div>
          <div className="text-stone-300">3. Verify: <span className="text-emerald-300">h&apos; = sᵉ mod n ≟ h</span> (public key e)</div>
        </div>
      </div>
    );
  }

  if (exhibitId === 'zkp-schnorr') {
    return (
      <div className="space-y-3" data-testid="step-inspector-zkp-schnorr">
        <div className="text-xs font-display font-semibold text-amber-300 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" /> Schnorr Sigma-Protocol Steps
        </div>
        <div className="p-3 rounded-xl bg-[#090b10] border border-stone-800 space-y-2 text-xs font-mono">
          <div className="text-stone-300">1. Commit: <span className="text-amber-300">t = gʳ mod p</span> (random r)</div>
          <div className="text-stone-300">2. Challenge: <span className="text-amber-300">c ∈ [0, q−1]</span> (Verifier)</div>
          <div className="text-stone-300">3. Respond: <span className="text-amber-300">s = (r + c·x) mod q</span></div>
          <div className="text-emerald-300">4. Verify: gˢ ≡ t · yᶜ (mod p)</div>
        </div>
      </div>
    );
  }

  if (exhibitId === 'post-quantum-kem') {
    return (
      <div className="space-y-3" data-testid="step-inspector-post-quantum-kem">
        <div className="text-xs font-display font-semibold text-amber-300 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" /> Lattice LWE / ML-KEM Encapsulation Steps
        </div>
        <div className="p-3 rounded-xl bg-[#090b10] border border-stone-800 space-y-2 text-xs font-mono">
          <div className="text-stone-300">1. Keygen: <span className="text-amber-300">t = A·s + e mod q</span></div>
          <div className="text-stone-300">2. Encapsulate: <span className="text-amber-300">u = Aᵀr + e₁, v = tᵀr + e₂ + ⌊q/2⌋·m</span></div>
          <div className="text-emerald-300">3. Decapsulate: v − sᵀu ≈ ⌊q/2⌋·m (rounded to 0 or 1)</div>
        </div>
      </div>
    );
  }

  if (exhibitId === 'ecc') {
    return (
      <div className="space-y-3" data-testid="step-inspector-ecc">
        <div className="text-xs font-display font-semibold text-amber-300 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" /> Elliptic Curve (P-256) ECDH &amp; ECDSA Steps
        </div>
        <div className="p-3 rounded-xl bg-[#090b10] border border-stone-800 space-y-2 text-xs font-mono">
          <div className="text-stone-300">1. Curve: <span className="text-amber-300">y² ≡ x³ + ax + b (mod p)</span></div>
          <div className="text-stone-300">2. ECDH: <span className="text-amber-300">A = a·G, B = b·G ⇒ S = a·B = b·A</span></div>
          <div className="text-stone-300">3. ECDSA Sign: <span className="text-amber-300">r = (k·G).x, s = k⁻¹(z + r·d) mod n</span></div>
          <div className="text-emerald-300">4. ECDSA Verify: (u₁·G + u₂·Q).x ≡ r (mod n)</div>
        </div>
      </div>
    );
  }

  if (exhibitId === 'otp-chacha20') {
    return (
      <div className="space-y-3" data-testid="step-inspector-otp-chacha20">
        <div className="text-xs font-display font-semibold text-amber-300 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" /> One-Time Pad &amp; ChaCha20 Stream Steps
        </div>
        <div className="p-3 rounded-xl bg-[#090b10] border border-stone-800 space-y-2 text-xs font-mono">
          <div className="text-stone-300">1. OTP: <span className="text-amber-300">C = P ⊕ K</span> (|K| ≥ |P|, true random, single-use)</div>
          <div className="text-stone-300">2. ChaCha20 State: <span className="text-amber-300">4×4 matrix (const, 256-bit key, counter, 96-bit nonce)</span></div>
          <div className="text-stone-300">3. ARX Rounds: <span className="text-amber-300">20 rounds of Add-Rotate-XOR quarter-rounds</span></div>
          <div className="text-emerald-300">4. Stream XOR: C = P ⊕ Keystream(Key, Nonce, Counter)</div>
        </div>
      </div>
    );
  }

  if (exhibitId === 'shamir-secret-sharing') {
    return (
      <div className="space-y-3" data-testid="step-inspector-shamir-secret-sharing">
        <div className="text-xs font-display font-semibold text-amber-300 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" /> Shamir&apos;s Secret Sharing Steps
        </div>
        <div className="p-3 rounded-xl bg-[#090b10] border border-stone-800 space-y-2 text-xs font-mono">
          <div className="text-stone-300">1. Polynomial: <span className="text-amber-300">f(x) = S + a₁x + … + aₖ₋₁xᵏ⁻¹ mod p</span></div>
          <div className="text-stone-300">2. Share Split: <span className="text-amber-300">Evaluate (i, f(i)) for i = 1 … n</span></div>
          <div className="text-stone-300">3. Lagrange Basis: <span className="text-amber-300">λᵢ(0) = Π (-xⱼ)·(xᵢ - xⱼ)⁻¹ mod p</span></div>
          <div className="text-emerald-300">4. Reconstruct: S = f(0) = Σ yᵢ·λᵢ(0) mod p</div>
        </div>
      </div>
    );
  }

  // Generic character-level inspector for Caesar & other exhibits
  const previewChars = (inputText || 'HELLO').slice(0, 8).split('');
  return (
    <div className="space-y-3" data-testid={`step-inspector-${exhibitId}`}>
      <div className="text-xs font-display font-semibold text-amber-300 flex items-center gap-1.5">
        <Layers className="w-3.5 h-3.5" /> Character Transformation Preview
      </div>
      <div className="grid grid-cols-4 gap-1.5 p-3 rounded-xl bg-[#090b10] border border-stone-800 font-mono text-xs text-center">
        {previewChars.map((ch, idx) => {
          const code = ch.toUpperCase().charCodeAt(0);
          const isAlpha = code >= 65 && code <= 90;
          const idxAlpha = isAlpha ? code - 65 : null;
          const shifted =
            exhibitId === 'caesar' && idxAlpha !== null
              ? String.fromCharCode(((idxAlpha + ((shift % 26) + 26)) % 26) + 65)
              : null;
          return (
            <div key={idx} className="p-1.5 rounded bg-stone-900 border border-stone-800">
              <div className="text-stone-300 font-bold">{ch === ' ' ? '␣' : ch}</div>
              <div className="text-[10px] text-amber-300">
                {shifted ? `→ ${shifted}` : isAlpha ? `idx ${idxAlpha}` : 'sym'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
