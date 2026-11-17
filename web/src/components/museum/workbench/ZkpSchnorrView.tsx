'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, ShieldCheck, AlertTriangle, Play, Dice5 } from 'lucide-react';

const OFFLINE_ERROR_MSG = 'Could not reach encryption server — is the API running?';

export function ZkpSchnorrView() {
  const [p] = useState(467);
  const [q] = useState(233);
  const [g] = useState(4);
  const [secretX, setSecretX] = useState(42);
  const [hideSecret, setHideSecret] = useState(true);

  const [yVal, setYVal] = useState<number | null>(null);
  const [rVal, setRVal] = useState<number | null>(null);
  const [tVal, setTVal] = useState<number | null>(null);
  const [challengeC, setChallengeC] = useState<number>(1);
  const [sVal, setSVal] = useState<number | null>(null);
  const [verifyInfo, setVerifyInfo] = useState<{ lhs: number; rhs: number; valid: boolean } | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const callZkpStep = async (payload: Record<string, unknown>) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/zkp/prove-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'ZKP step failed' }));
        throw new Error(err.detail || 'ZKP step failed');
      }
      return await res.json();
    } catch (err: any) {
      setErrorMsg(err instanceof TypeError || !err?.message ? OFFLINE_ERROR_MSG : err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async () => {
    setSVal(null);
    setVerifyInfo(null);
    const data = await callZkpStep({ step: 'commit', p, q, g, secret_x: secretX });
    if (data) {
      setYVal(data.y);
      setRVal(data.r);
      setTVal(data.t);
    }
  };

  const handleRespond = async () => {
    if (tVal === null || rVal === null) return;
    setVerifyInfo(null);
    const data = await callZkpStep({
      step: 'respond',
      p,
      q,
      g,
      secret_x: secretX,
      y: yVal,
      r: rVal,
      t: tVal,
      c: challengeC,
    });
    if (data) {
      setSVal(data.s);
    }
  };

  const handleVerify = async () => {
    if (tVal === null || sVal === null || yVal === null) return;
    const data = await callZkpStep({
      step: 'verify',
      p,
      q,
      g,
      y: yVal,
      t: tVal,
      c: challengeC,
      s: sVal,
    });
    if (data) {
      setVerifyInfo({ lhs: data.lhs, rhs: data.rhs, valid: Boolean(data.valid) });
    }
  };

  const handleFullRound = async () => {
    const data = await callZkpStep({
      step: 'full',
      p,
      q,
      g,
      secret_x: secretX,
      c: challengeC,
    });
    if (data) {
      setYVal(data.y);
      setRVal(data.r);
      setTVal(data.t);
      setChallengeC(data.c);
      setSVal(data.s);
      setVerifyInfo({ lhs: data.lhs, rhs: data.rhs, valid: Boolean(data.valid) });
    }
  };

  return (
    <div className="space-y-3 text-xs" data-testid="zkp-schnorr-view">
      {/* Prover Secret Setup */}
      <div className="p-3 rounded-xl bg-[#221f1c] border border-stone-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-display font-semibold text-amber-300">
            Prover Secret (p={p}, q={q}, g={g})
          </span>
          <button
            type="button"
            onClick={() => setHideSecret(!hideSecret)}
            aria-label={hideSecret ? 'Reveal Prover secret x' : 'Hide Prover secret x'}
            className="text-[11px] text-stone-300 hover:text-amber-300 flex items-center gap-1 rounded px-1 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
          >
            {hideSecret ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            {hideSecret ? 'Show x' : 'Hide x'}
          </button>
        </div>
        <div>
          <label htmlFor="zkp-secret-x" className="block text-[11px] text-stone-300 mb-1">
            Secret Witness x (never sent to Verifier):
          </label>
          <input
            id="zkp-secret-x"
            type={hideSecret ? 'password' : 'number'}
            min={1}
            max={q - 1}
            data-testid="zkp-secret-x"
            value={secretX}
            onChange={(e) => setSecretX(Math.max(1, Math.min(q - 1, parseInt(e.target.value, 10) || 1)))}
            className="w-full px-2.5 py-1.5 rounded-lg bg-[#090b10] border border-stone-800 font-mono text-amber-300 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
          />
        </div>
      </div>

      {/* Interactive 3-Move Protocol */}
      <div className="space-y-2">
        {/* Step 1: Commit */}
        <div className="p-2.5 rounded-lg bg-[#111520] border border-stone-800 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-stone-200">1. Prover Commits (t = gʳ mod p)</span>
            <button
              type="button"
              data-testid="zkp-commit-btn"
              onClick={handleCommit}
              disabled={loading}
              aria-label="Prover generate commitment t"
              className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-[11px] disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
            >
              Commit
            </button>
          </div>
          {tVal !== null && (
            <div className="font-mono text-[11px] text-amber-300 flex gap-3" data-testid="zkp-commit-output">
              <span>y = {yVal}</span>
              <span>t = {tVal}</span>
            </div>
          )}
        </div>

        {/* Step 2: Verifier Challenge */}
        <div className="p-2.5 rounded-lg bg-[#111520] border border-stone-800 space-y-1.5">
          <label htmlFor="zkp-challenge-c" className="block font-semibold text-stone-200">
            2. Verifier Challenge (c)
          </label>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              data-testid="zkp-challenge-0"
              onClick={() => setChallengeC(0)}
              aria-label="Set challenge c to 0"
              className={`px-2.5 py-1 rounded border text-[11px] font-mono focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                challengeC === 0 ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold' : 'bg-[#090b10] border-stone-800 text-stone-300'
              }`}
            >
              c=0
            </button>
            <button
              type="button"
              data-testid="zkp-challenge-1"
              onClick={() => setChallengeC(1)}
              aria-label="Set challenge c to 1"
              className={`px-2.5 py-1 rounded border text-[11px] font-mono focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                challengeC === 1 ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold' : 'bg-[#090b10] border-stone-800 text-stone-300'
              }`}
            >
              c=1
            </button>
            <button
              type="button"
              data-testid="zkp-challenge-random"
              onClick={() => setChallengeC(Math.floor(Math.random() * q))}
              aria-label="Pick random challenge c"
              className="px-2 py-1 rounded bg-[#090b10] border border-stone-800 text-emerald-300 hover:text-emerald-200 text-[11px] flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
            >
              <Dice5 className="w-3 h-3" /> Random
            </button>
            <input
              id="zkp-challenge-c"
              type="number"
              min={0}
              max={q - 1}
              data-testid="zkp-challenge-input"
              value={challengeC}
              onChange={(e) => setChallengeC(Math.max(0, Math.min(q - 1, parseInt(e.target.value, 10) || 0)))}
              className="w-16 px-2 py-1 rounded bg-[#090b10] border border-stone-800 font-mono text-stone-200 text-center focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
            />
          </div>
        </div>

        {/* Step 3: Prover Responds */}
        <div className="p-2.5 rounded-lg bg-[#111520] border border-stone-800 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-stone-200">3. Prover Responds (s = r + c·x mod q)</span>
            <button
              type="button"
              data-testid="zkp-respond-btn"
              onClick={handleRespond}
              disabled={loading || tVal === null}
              aria-label="Prover compute response s"
              className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-[11px] disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
            >
              Respond
            </button>
          </div>
          {sVal !== null && (
            <div className="font-mono text-[11px] text-emerald-300" data-testid="zkp-respond-output">
              s = {sVal}
            </div>
          )}
        </div>

        {/* Step 4: Verifier Checks */}
        <div className="flex gap-2">
          <button
            type="button"
            data-testid="zkp-verify-btn"
            onClick={handleVerify}
            disabled={loading || sVal === null}
            aria-label="Verifier check Schnorr proof"
            className="flex-1 py-2 rounded-xl bg-[#221f1c] hover:bg-[#2c2824] border border-amber-500/40 text-amber-300 font-bold flex items-center justify-center gap-1.5 disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Verify Proof
          </button>
          <button
            type="button"
            data-testid="zkp-full-btn"
            onClick={handleFullRound}
            disabled={loading}
            aria-label="Run full Schnorr ZKP round"
            className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold flex items-center justify-center gap-1 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
          >
            <Play className="w-3.5 h-3.5 fill-stone-950" /> Full Round
          </button>
        </div>
      </div>

      {errorMsg && (
        <div role="alert" aria-live="assertive" className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-200 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {verifyInfo && (
        <div
          data-testid="zkp-verify-result"
          aria-live="polite"
          className={`p-2.5 rounded-lg border space-y-1 ${
            verifyInfo.valid
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/70 border-rose-500/50 text-rose-200'
          }`}
        >
          <div className="font-sans font-bold">
            {verifyInfo.valid ? 'PROOF ACCEPTED — Verifier learned nothing about x' : 'PROOF REJECTED'}
          </div>
          <div className="font-mono text-[11px] opacity-90">
            gˢ mod p = {verifyInfo.lhs} | t·yᶜ mod p = {verifyInfo.rhs}
          </div>
        </div>
      )}
    </div>
  );
}
