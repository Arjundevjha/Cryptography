'use client';

import React, { useState } from 'react';
import { Cpu, Play, RefreshCw, AlertTriangle, Radio } from 'lucide-react';
import { postCryptanalysis } from './labApi';

interface EnigmaMatch {
  positions: [string, string, string];
  position_str: string;
  offset: number;
  plaintext: string;
}

interface EnigmaBombeResponse {
  matches: EnigmaMatch[];
  positions_tested: number;
  crib_offsets_valid: number[];
  elapsed_ms: number;
}

interface LorenzCribResult {
  offset: number;
  crib: string;
  recovered_fragment: string;
  alphabetic_ratio: number;
}

interface LorenzDepthResponse {
  length: number;
  xor_text: string;
  xor_bits: string[];
  crib_results: LorenzCribResult[];
}

interface HistoricalAttackLabProps {
  exhibitId: 'enigma' | 'lorenz';
}

export function HistoricalAttackLab({ exhibitId }: HistoricalAttackLabProps) {
  // Enigma Bombe state
  const [enigmaCiphertext, setEnigmaCiphertext] = useState('BDZGOOWCXLTBG');
  const [enigmaCrib, setEnigmaCrib] = useState('WETTER');
  const [fixedLeftRotor, setFixedLeftRotor] = useState('A');
  const [reflector, setReflector] = useState('B');
  const [plugboard, setPlugboard] = useState('AB CD');
  const [enigmaRes, setEnigmaRes] = useState<EnigmaBombeResponse | null>(null);

  // Lorenz Depth-Attack state
  const [lorenzC1, setLorenzC1] = useState('JFXWQZPK');
  const [lorenzC2, setLorenzC2] = useState('MNBVCXZL');
  const [lorenzCrib, setLorenzCrib] = useState('WETTER');
  const [lorenzRes, setLorenzRes] = useState<LorenzDepthResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLoadSample = () => {
    setErrorMsg(null);
    if (exhibitId === 'enigma') {
      setEnigmaCiphertext('BDZGOOWCXLTBG');
      setEnigmaCrib('WETTER');
      setFixedLeftRotor('A');
      setReflector('B');
      setPlugboard('AB CD');
    } else {
      setLorenzC1('JFXWQZPK');
      setLorenzC2('MNBVCXZL');
      setLorenzCrib('WETTER');
    }
  };

  const handleRun = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      if (exhibitId === 'enigma') {
        const plugSwaps = plugboard.trim() ? plugboard.trim().split(/\s+/) : [];
        const data = await postCryptanalysis<EnigmaBombeResponse>(
          '/api/cryptanalysis/enigma-bombe',
          {
            ciphertext: enigmaCiphertext,
            crib: enigmaCrib,
            rotors: ['I', 'II', 'III'],
            reflector,
            plugboard: plugSwaps,
            fixed_left_rotor: fixedLeftRotor || 'A',
          }
        );
        setEnigmaRes(data);
      } else {
        const data = await postCryptanalysis<LorenzDepthResponse>(
          '/api/cryptanalysis/lorenz-depth',
          {
            ciphertext1: lorenzC1,
            ciphertext2: lorenzC2,
            crib: lorenzCrib,
          }
        );
        setLorenzRes(data);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Attack failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 text-xs" data-testid={`attack-lab-${exhibitId}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-display font-semibold text-amber-300 flex items-center gap-1.5">
          {exhibitId === 'enigma' ? (
            <>
              <Cpu className="w-3.5 h-3.5" /> Turing-Welchman Bombe Mini-Lab
            </>
          ) : (
            <>
              <Radio className="w-3.5 h-3.5" /> Lorenz SZ40/42 Depth Attack
            </>
          )}
        </span>
        <button
          type="button"
          onClick={handleLoadSample}
          className="text-[11px] text-amber-300 hover:text-amber-200 underline rounded px-1 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
        >
          Load Sample
        </button>
      </div>

      {exhibitId === 'enigma' ? (
        <div className="space-y-2.5">
          <div>
            <label
              htmlFor="enigma-bombe-ct"
              className="block text-[11px] font-semibold text-stone-300 mb-1"
            >
              Intercepted Ciphertext
            </label>
            <input
              id="enigma-bombe-ct"
              data-testid="enigma-bombe-ct"
              type="text"
              value={enigmaCiphertext}
              onChange={(e) => setEnigmaCiphertext(e.target.value.toUpperCase())}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#1a1714] border border-stone-800 text-stone-100 font-mono text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label
                htmlFor="enigma-bombe-crib"
                className="block text-[11px] text-stone-300 mb-1"
              >
                Known Crib
              </label>
              <input
                id="enigma-bombe-crib"
                data-testid="enigma-bombe-crib"
                type="text"
                value={enigmaCrib}
                onChange={(e) => setEnigmaCrib(e.target.value.toUpperCase())}
                className="w-full px-2 py-1.5 rounded bg-[#1a1714] border border-stone-800 text-amber-300 font-mono text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              />
            </div>
            <div>
              <label
                htmlFor="enigma-bombe-left"
                className="block text-[11px] text-stone-300 mb-1"
              >
                Left Rotor (Fixed)
              </label>
              <input
                id="enigma-bombe-left"
                type="text"
                maxLength={1}
                value={fixedLeftRotor}
                onChange={(e) => setFixedLeftRotor(e.target.value.toUpperCase())}
                className="w-full px-2 py-1.5 rounded bg-[#1a1714] border border-stone-800 text-stone-100 font-mono text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label
                htmlFor="enigma-bombe-reflector"
                className="block text-[11px] text-stone-300 mb-1"
              >
                Reflector
              </label>
              <select
                id="enigma-bombe-reflector"
                value={reflector}
                onChange={(e) => setReflector(e.target.value)}
                className="w-full px-2 py-1.5 rounded bg-[#1a1714] border border-stone-800 text-stone-100 font-mono text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                <option value="B">UKW-B</option>
                <option value="C">UKW-C</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="enigma-bombe-plugboard"
                className="block text-[11px] text-stone-300 mb-1"
              >
                Plugboard Pairs
              </label>
              <input
                id="enigma-bombe-plugboard"
                type="text"
                value={plugboard}
                onChange={(e) => setPlugboard(e.target.value.toUpperCase())}
                className="w-full px-2 py-1.5 rounded bg-[#1a1714] border border-stone-800 text-stone-100 font-mono text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          <div>
            <label
              htmlFor="lorenz-c1"
              className="block text-[11px] font-semibold text-stone-300 mb-1"
            >
              Ciphertext 1 (Same Keystream Depth)
            </label>
            <input
              id="lorenz-c1"
              data-testid="lorenz-c1"
              type="text"
              value={lorenzC1}
              onChange={(e) => setLorenzC1(e.target.value.toUpperCase())}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#1a1714] border border-stone-800 text-stone-100 font-mono text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            />
          </div>
          <div>
            <label
              htmlFor="lorenz-c2"
              className="block text-[11px] font-semibold text-stone-300 mb-1"
            >
              Ciphertext 2 (Same Keystream Depth)
            </label>
            <input
              id="lorenz-c2"
              data-testid="lorenz-c2"
              type="text"
              value={lorenzC2}
              onChange={(e) => setLorenzC2(e.target.value.toUpperCase())}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#1a1714] border border-stone-800 text-stone-100 font-mono text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            />
          </div>
          <div>
            <label
              htmlFor="lorenz-crib"
              className="block text-[11px] font-semibold text-stone-300 mb-1"
            >
              Crib-Drag Guess
            </label>
            <input
              id="lorenz-crib"
              data-testid="lorenz-crib"
              type="text"
              value={lorenzCrib}
              onChange={(e) => setLorenzCrib(e.target.value.toUpperCase())}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#1a1714] border border-stone-800 text-amber-300 font-mono text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            />
          </div>
        </div>
      )}

      <button
        type="button"
        data-testid={`run-attack-${exhibitId}`}
        onClick={handleRun}
        disabled={loading}
        aria-busy={loading}
        className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
      >
        {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-stone-950" />}
        <span>{exhibitId === 'enigma' ? 'Run Bombe Rotor Sweep' : 'XOR & Crib-Drag Depth'}</span>
      </button>

      {errorMsg && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {exhibitId === 'enigma' && enigmaRes && (
        <div className="space-y-2" data-testid="enigma-bombe-results">
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded-lg bg-[#090b10] border border-stone-800">
              <span className="text-stone-400 block">Positions Tested</span>
              <span className="font-mono font-bold text-amber-300">
                {enigmaRes.positions_tested}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-[#090b10] border border-stone-800">
              <span className="text-stone-400 block">Elapsed</span>
              <span className="font-mono font-bold text-stone-100">
                {enigmaRes.elapsed_ms.toFixed(1)} ms
              </span>
            </div>
          </div>

          {enigmaRes.matches.length === 0 ? (
            <p className="p-2.5 rounded-lg bg-[#090b10] border border-stone-800 text-stone-400 italic">
              No rotor positions matched crib &ldquo;{enigmaCrib}&rdquo;.
            </p>
          ) : (
            <div className="max-h-48 overflow-y-auto rounded-lg border border-stone-800 bg-[#090b10] divide-y divide-stone-800/70">
              {enigmaRes.matches.map((m, idx) => (
                <div key={`${m.position_str}-${m.offset}-${idx}`} className="p-2.5 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono font-bold text-emerald-300">
                      Rotors: {m.position_str}
                    </span>
                    <span className="font-mono text-stone-400">offset {m.offset}</span>
                  </div>
                  <p className="font-mono text-xs text-stone-100 break-all">{m.plaintext}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {exhibitId === 'lorenz' && lorenzRes && (
        <div className="space-y-2" data-testid="lorenz-depth-results">
          <div className="p-2.5 rounded-lg bg-[#090b10] border border-stone-800 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-stone-400">C1 ⊕ C2 = P1 ⊕ P2</span>
              <span className="font-mono text-amber-300">{lorenzRes.length} chars</span>
            </div>
            <p className="font-mono text-xs text-stone-100 break-all">{lorenzRes.xor_text}</p>
            {lorenzRes.xor_bits.length > 0 && (
              <p className="font-mono text-[10px] text-stone-400 break-all">
                Baudot bits: {lorenzRes.xor_bits.slice(0, 6).join(' ')}
                {lorenzRes.xor_bits.length > 6 ? ' …' : ''}
              </p>
            )}
          </div>

          <div className="max-h-44 overflow-y-auto rounded-lg border border-stone-800 bg-[#090b10] divide-y divide-stone-800/70">
            {lorenzRes.crib_results.map((cr, idx) => (
              <div
                key={`${cr.offset}-${idx}`}
                className="px-2.5 py-1.5 flex items-center justify-between gap-2 text-[11px]"
              >
                <span className="font-mono text-stone-400 shrink-0">@{cr.offset}</span>
                <span className="font-mono text-emerald-300 truncate flex-1">
                  {cr.recovered_fragment}
                </span>
                <span className="font-mono text-amber-300 shrink-0">
                  {Math.round(cr.alphabetic_ratio * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
