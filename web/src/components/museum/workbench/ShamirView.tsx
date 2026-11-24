'use client';

import React, { useState } from 'react';
import { AlertTriangle, Check, KeyRound, Layers, ShieldCheck } from 'lucide-react';

const OFFLINE_ERROR_MSG = 'Could not reach encryption server — is the API running?';

interface ShamirShare {
  x: number;
  y: string;
}

interface LagrangeBasisItem {
  x: number;
  y: string;
  lambda_0: string;
  term: string;
}

export function ShamirView() {
  const [mode, setMode] = useState<'integer' | 'text'>('integer');
  const [secretInput, setSecretInput] = useState('1234');
  const [threshold, setThreshold] = useState(3);
  const [numShares, setNumShares] = useState(5);
  const [primeInput, setPrimeInput] = useState('1613');

  const [shares, setShares] = useState<ShamirShare[]>([]);
  const [selectedX, setSelectedX] = useState<number[]>([]);
  const [activePrime, setActivePrime] = useState('');
  const [byteLength, setByteLength] = useState<number | null>(null);
  const [coefficients, setCoefficients] = useState<string[]>([]);

  const [reconstructed, setReconstructed] = useState<string | null>(null);
  const [sharesUsed, setSharesUsed] = useState<number | null>(null);
  const [lagrangeBasis, setLagrangeBasis] = useState<LagrangeBasisItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleModeChange = (nextMode: 'integer' | 'text') => {
    setMode(nextMode);
    setShares([]);
    setSelectedX([]);
    setCoefficients([]);
    setReconstructed(null);
    setLagrangeBasis([]);
    setErrorMsg(null);
    setSecretInput(nextMode === 'integer' ? '1234' : 'Museum-Key-2026');
  };

  const handleSplit = async () => {
    setLoading(true);
    setErrorMsg(null);
    setReconstructed(null);
    setLagrangeBasis([]);
    try {
      const payload: Record<string, unknown> = {
        secret: secretInput,
        mode,
        threshold,
        num_shares: numShares,
      };
      if (mode === 'integer' && primeInput.trim()) {
        payload.prime = primeInput.trim();
      }
      const res = await fetch('/api/shamir/split', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Failed to split secret' }));
        throw new Error(err.detail || 'Failed to split secret');
      }
      const data = await res.json();
      const nextShares: ShamirShare[] = data.shares || [];
      setShares(nextShares);
      setSelectedX(nextShares.slice(0, threshold).map((s) => s.x));
      setActivePrime(mode === 'integer' ? data.prime : data.prime_hex);
      setByteLength(mode === 'text' ? data.byte_length : null);
      setCoefficients(data.coefficients || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      setErrorMsg(err instanceof TypeError || !msg ? OFFLINE_ERROR_MSG : msg);
    } finally {
      setLoading(false);
    }
  };

  const toggleShare = (xVal: number) => {
    setSelectedX((prev) =>
      prev.includes(xVal) ? prev.filter((item) => item !== xVal) : [...prev, xVal]
    );
  };

  const handleReconstruct = async () => {
    const chosen = shares.filter((s) => selectedX.includes(s.x));
    if (chosen.length < 2) {
      setErrorMsg('Select at least 2 shares to run Lagrange interpolation.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const payload: Record<string, unknown> = {
        shares: chosen,
        mode,
        prime: activePrime,
      };
      if (mode === 'text' && byteLength !== null) {
        payload.byte_length = byteLength;
      }
      const res = await fetch('/api/shamir/reconstruct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Failed to reconstruct secret' }));
        throw new Error(err.detail || 'Failed to reconstruct secret');
      }
      const data = await res.json();
      setReconstructed(mode === 'integer' ? data.secret : data.secret_text);
      setSharesUsed(data.shares_used ?? chosen.length);
      setLagrangeBasis(data.lagrange_basis || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      setErrorMsg(err instanceof TypeError || !msg ? OFFLINE_ERROR_MSG : msg);
    } finally {
      setLoading(false);
    }
  };

  const belowThreshold = sharesUsed !== null && sharesUsed < threshold;

  return (
    <div className="space-y-3 text-xs" data-testid="shamir-view">
      {/* Mode selector */}
      <div className="flex rounded-lg p-1 bg-[#221f1c] border border-stone-800 gap-1">
        <button
          type="button"
          data-testid="shamir-mode-integer"
          onClick={() => handleModeChange('integer')}
          className={`flex-1 py-1.5 rounded-md font-semibold transition-colors ${
            mode === 'integer' ? 'bg-amber-500 text-stone-950' : 'text-stone-300 hover:text-stone-100'
          }`}
        >
          Integer GF(p)
        </button>
        <button
          type="button"
          data-testid="shamir-mode-text"
          onClick={() => handleModeChange('text')}
          className={`flex-1 py-1.5 rounded-md font-semibold transition-colors ${
            mode === 'text' ? 'bg-amber-500 text-stone-950' : 'text-stone-300 hover:text-stone-100'
          }`}
        >
          Text Secret
        </button>
      </div>

      {/* Parameters & Secret Input */}
      <div className="p-3 rounded-xl bg-[#221f1c] border border-stone-800 space-y-2.5">
        <div>
          <label htmlFor="shamir-secret-input" className="block text-[11px] font-semibold text-stone-200 mb-1">
            {mode === 'integer' ? 'Secret Integer S (0 ≤ S < p)' : 'Secret Text (up to 64 UTF-8 bytes)'}
          </label>
          <input
            id="shamir-secret-input"
            data-testid="shamir-secret-input"
            type="text"
            value={secretInput}
            onChange={(e) => setSecretInput(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-[#090b10] border border-stone-800 font-mono text-amber-300 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="shamir-threshold-input" className="block text-[11px] text-stone-300 mb-1">
              Threshold k
            </label>
            <input
              id="shamir-threshold-input"
              data-testid="shamir-threshold-input"
              type="number"
              min={2}
              max={10}
              value={threshold}
              onChange={(e) => setThreshold(Math.max(2, Math.min(10, parseInt(e.target.value, 10) || 2)))}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#090b10] border border-stone-800 font-mono text-stone-100"
            />
          </div>
          <div>
            <label htmlFor="shamir-shares-input" className="block text-[11px] text-stone-300 mb-1">
              Total Shares n
            </label>
            <input
              id="shamir-shares-input"
              data-testid="shamir-shares-input"
              type="number"
              min={2}
              max={10}
              value={numShares}
              onChange={(e) => setNumShares(Math.max(2, Math.min(10, parseInt(e.target.value, 10) || 2)))}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#090b10] border border-stone-800 font-mono text-stone-100"
            />
          </div>
        </div>

        {mode === 'integer' && (
          <div>
            <label htmlFor="shamir-prime-input" className="block text-[11px] text-stone-300 mb-1">
              Prime Modulus p (optional)
            </label>
            <input
              id="shamir-prime-input"
              data-testid="shamir-prime-input"
              type="text"
              value={primeInput}
              onChange={(e) => setPrimeInput(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#090b10] border border-stone-800 font-mono text-stone-100"
            />
          </div>
        )}

        <button
          type="button"
          data-testid="shamir-split-btn"
          onClick={handleSplit}
          disabled={loading}
          className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          <KeyRound className="w-3.5 h-3.5" /> Split Secret into Shares
        </button>
      </div>

      {/* Generated Polynomial & Share Selection */}
      {shares.length > 0 && (
        <div className="p-3 rounded-xl bg-[#111520] border border-stone-800 space-y-2.5">
          {coefficients.length > 0 && (
            <div className="text-[11px] font-mono text-violet-300 break-all">
              f(x) = {coefficients.map((c, idx) => (idx === 0 ? c : `${c}x^${idx}`)).join(' + ')} (mod {activePrime})
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-stone-300">
            <span>Select shares ({selectedX.length}/{threshold} needed):</span>
          </div>

          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {shares.map((share) => {
              const checked = selectedX.includes(share.x);
              return (
                <label
                  key={share.x}
                  className={`flex items-center justify-between gap-2 p-2 rounded-lg border cursor-pointer font-mono text-[11px] ${
                    checked
                      ? 'bg-violet-950/40 border-violet-500/50 text-violet-100'
                      : 'bg-[#090b10] border-stone-800 text-stone-400'
                  }`}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleShare(share.x)}
                      data-testid={`shamir-share-check-${share.x}`}
                      className="accent-amber-500"
                    />
                    <span className="text-amber-300 shrink-0">({share.x},</span>
                    <span className="truncate">{share.y})</span>
                  </span>
                  {checked && <Check className="w-3 h-3 text-emerald-400 shrink-0" />}
                </label>
              );
            })}
          </div>

          <button
            type="button"
            data-testid="shamir-reconstruct-btn"
            onClick={handleReconstruct}
            disabled={loading || selectedX.length < 2}
            className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Reconstruct f(0) ({selectedX.length} shares)
          </button>
        </div>
      )}

      {/* Reconstruction Result */}
      {reconstructed !== null && (
        <div
          data-testid="shamir-reconstruct-result"
          className={`p-3 rounded-xl border space-y-2 ${
            belowThreshold
              ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
              : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between font-semibold">
            <span>
              {belowThreshold
                ? `Insufficient Shares (${sharesUsed} < ${threshold})`
                : `Secret Reconstructed (${sharesUsed} ≥ ${threshold})`}
            </span>
          </div>
          <div className="font-mono text-sm text-stone-100 break-all">{reconstructed}</div>
          {lagrangeBasis.length > 0 && (
            <div className="pt-1 border-t border-stone-800/80 space-y-1 text-[10px] font-mono text-stone-300">
              <div className="flex items-center gap-1 text-amber-300 font-sans font-semibold">
                <Layers className="w-3 h-3" /> Lagrange Basis Terms
              </div>
              {lagrangeBasis.map((b) => (
                <div key={b.x}>
                  x={b.x}: λ₀={b.lambda_0}, y·λ₀={b.term}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {errorMsg && (
        <div
          role="alert"
          className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-200 flex items-center gap-2"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
