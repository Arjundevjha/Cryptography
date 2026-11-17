'use client';

import React, { useState } from 'react';
import { Cpu, AlertTriangle, Play, CheckCircle2, XCircle } from 'lucide-react';

const OFFLINE_ERROR_MSG = 'Could not reach encryption server — is the API running?';

interface MlKemDemoResponse {
  q: number;
  n: number;
  noise_bound: number;
  public_key: { A: number[][]; t: number[] };
  secret_key: { s: number[]; e: number[] };
  ciphertext: { u: number[]; v: number };
  encapsulation: {
    r: number[];
    e1: number[];
    e2: number;
    message_bit: number;
    shared_secret_hex: string;
  };
  decapsulation: {
    noisy_diff: number;
    centered_diff: number;
    recovered_bit: number;
    shared_secret_hex: string;
  };
  match: boolean;
}

export function PostQuantumKemView() {
  const [messageBit, setMessageBit] = useState<0 | 1>(1);
  const [noiseBound, setNoiseBound] = useState<number>(2);
  const [stage, setStage] = useState<1 | 2 | 3>(3);
  const [result, setResult] = useState<MlKemDemoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRunKem = async (targetStage: 1 | 2 | 3 = 3) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/mlkem/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_bit: messageBit,
          noise_bound: noiseBound,
          n: 4,
          q: 3329,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'ML-KEM demo failed' }));
        throw new Error(err.detail || 'ML-KEM demo failed');
      }
      const data: MlKemDemoResponse = await res.json();
      setResult(data);
      setStage(targetStage);
    } catch (err: any) {
      setErrorMsg(err instanceof TypeError || !err?.message ? OFFLINE_ERROR_MSG : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 text-xs" data-testid="post-quantum-kem-view">
      {/* Parameters */}
      <div className="p-3 rounded-xl bg-[#221f1c] border border-stone-800 space-y-2.5">
        <div className="font-display font-semibold text-amber-300 flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5" /> Lattice LWE / ML-KEM Parameters (q=3329, n=4)
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <span id="mlkem-bit-label" className="block text-[11px] text-stone-300 mb-1">
              Encapsulated Bit:
            </span>
            <div
              role="group"
              aria-labelledby="mlkem-bit-label"
              className="grid grid-cols-2 gap-1 p-0.5 rounded-lg bg-[#090b10] border border-stone-800"
            >
              {([0, 1] as const).map((bit) => (
                <button
                  key={bit}
                  type="button"
                  data-testid={`mlkem-bit-${bit}`}
                  aria-pressed={messageBit === bit}
                  aria-label={`Set message bit to ${bit}`}
                  onClick={() => setMessageBit(bit)}
                  className={`py-1 rounded font-mono font-bold transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                    messageBit === bit ? 'bg-amber-500 text-stone-950' : 'text-stone-300 hover:text-stone-100'
                  }`}
                >
                  {bit}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="mlkem-noise-bound" className="block text-[11px] text-stone-300 mb-1">
              Noise Bound (e):
            </label>
            <input
              id="mlkem-noise-bound"
              type="number"
              min={0}
              max={500}
              data-testid="mlkem-noise-bound"
              value={noiseBound}
              onChange={(e) => setNoiseBound(Math.max(0, Math.min(500, parseInt(e.target.value, 10) || 0)))}
              className="w-full px-2.5 py-1 rounded-lg bg-[#090b10] border border-stone-800 font-mono text-stone-200 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
            />
          </div>
        </div>

        <button
          type="button"
          data-testid="mlkem-run-btn"
          onClick={() => handleRunKem(3)}
          disabled={loading}
          aria-label="Run ML-KEM Keygen, Encapsulate, and Decapsulate"
          className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
        >
          <Play className="w-3.5 h-3.5 fill-stone-950" /> Run Keygen → Encapsulate → Decapsulate
        </button>
      </div>

      {errorMsg && (
        <div role="alert" aria-live="assertive" className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-200 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {result && (
        <div className="space-y-2" data-testid="mlkem-results">
          {/* Phase selector */}
          <div className="grid grid-cols-3 gap-1 bg-[#090b10] p-1 rounded-lg border border-stone-800">
            {[
              { id: 1 as const, label: '1. Keygen' },
              { id: 2 as const, label: '2. Encapsulate' },
              { id: 3 as const, label: '3. Decapsulate' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStage(tab.id)}
                aria-pressed={stage === tab.id}
                aria-label={`View ML-KEM ${tab.label}`}
                className={`py-1 rounded text-[11px] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                  stage === tab.id ? 'bg-amber-500 text-stone-950' : 'text-stone-300 hover:text-stone-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {stage === 1 && (
            <div className="p-2.5 rounded-lg bg-[#111520] border border-stone-800 space-y-1 font-mono text-[11px]">
              <div className="text-amber-300 font-sans font-semibold">Alice Keygen (t = A·s + e mod q)</div>
              <div className="text-stone-300">Public t: [{result.public_key.t.join(', ')}]</div>
              <div className="text-stone-400">Secret s: [{result.secret_key.s.join(', ')}]</div>
              <div className="text-stone-400">Noise e: [{result.secret_key.e.join(', ')}]</div>
            </div>
          )}

          {stage === 2 && (
            <div className="p-2.5 rounded-lg bg-[#111520] border border-stone-800 space-y-1 font-mono text-[11px]">
              <div className="text-amber-300 font-sans font-semibold">Bob Encapsulates (with noise e₁, e₂)</div>
              <div className="text-stone-300">Ciphertext u: [{result.ciphertext.u.join(', ')}]</div>
              <div className="text-stone-300">Ciphertext v: {result.ciphertext.v}</div>
              <div className="text-emerald-300 truncate">Bob Secret: {result.encapsulation.shared_secret_hex}</div>
            </div>
          )}

          {stage === 3 && (
            <div className="p-2.5 rounded-lg bg-[#111520] border border-stone-800 space-y-1 font-mono text-[11px]">
              <div className="text-amber-300 font-sans font-semibold">Alice Decapsulates (v − s·u mod q)</div>
              <div className="text-stone-300">
                Noisy diff: {result.decapsulation.noisy_diff} (centered: {result.decapsulation.centered_diff})
              </div>
              <div className="text-stone-200">
                Recovered bit: <span className="text-amber-300 font-bold">{result.decapsulation.recovered_bit}</span>
              </div>
              <div className="text-emerald-300 truncate">Alice Secret: {result.decapsulation.shared_secret_hex}</div>
            </div>
          )}

          <div
            data-testid="mlkem-match-badge"
            aria-live="polite"
            className={`p-2.5 rounded-lg border font-sans font-semibold flex items-center justify-between ${
              result.match
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/70 border-rose-500/50 text-rose-200'
            }`}
          >
            <span className="flex items-center gap-1.5">
              {result.match ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {result.match ? 'SHARED SECRET MATCHED' : 'DECAPSULATION ERROR (Noise Overflow)'}
            </span>
            <span className="font-mono text-[10px]">
              bit {result.encapsulation.message_bit} → {result.decapsulation.recovered_bit}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
