'use client';

import React, { useState } from 'react';
import { KeyRound, PenTool, ShieldCheck, AlertTriangle, RefreshCw, ArrowLeftRight } from 'lucide-react';

const OFFLINE_ERROR_MSG = 'Could not reach encryption server — is the API running?';

interface EccKeypair {
  curve: string;
  private_key: string;
  public_key: { x: string; y: string };
}

interface EcdhResult {
  curve: string;
  shared_point: { x: string; y: string };
  shared_secret_hex: string;
}

interface EcdsaSignResult {
  curve: string;
  algorithm: string;
  digest_hex: string;
  signature: { r: string; s: string };
}

interface EcdsaVerifyResult {
  curve: string;
  algorithm: string;
  digest_hex: string;
  valid: boolean;
}

export function EccView() {
  const [subMode, setSubMode] = useState<'ecdh' | 'ecdsa'>('ecdh');

  // ECDH state
  const [aliceKeys, setAliceKeys] = useState<EccKeypair | null>(null);
  const [bobKeys, setBobKeys] = useState<EccKeypair | null>(null);
  const [aliceShared, setAliceShared] = useState<EcdhResult | null>(null);
  const [bobShared, setBobShared] = useState<EcdhResult | null>(null);

  // ECDSA state
  const [signerKeys, setSignerKeys] = useState<EccKeypair | null>(null);
  const [message, setMessage] = useState('MUSEUM P-256 AUTHENTICITY');
  const [sigR, setSigR] = useState('');
  const [sigS, setSigS] = useState('');
  const [signDigest, setSignDigest] = useState('');
  const [verifyResult, setVerifyResult] = useState<EcdsaVerifyResult | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchKeypair = async (): Promise<EccKeypair> => {
    const res = await fetch('/api/ecc/keygen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'ECC keygen failed' }));
      throw new Error(err.detail || 'ECC keygen failed');
    }
    return res.json();
  };

  const handleRunEcdh = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [alice, bob] = await Promise.all([fetchKeypair(), fetchKeypair()]);
      setAliceKeys(alice);
      setBobKeys(bob);

      const [resA, resB] = await Promise.all([
        fetch('/api/ecc/ecdh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            private_key: alice.private_key,
            peer_public_x: bob.public_key.x,
            peer_public_y: bob.public_key.y,
          }),
        }),
        fetch('/api/ecc/ecdh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            private_key: bob.private_key,
            peer_public_x: alice.public_key.x,
            peer_public_y: alice.public_key.y,
          }),
        }),
      ]);

      if (!resA.ok || !resB.ok) {
        const err = await (resA.ok ? resB : resA).json().catch(() => ({ detail: 'ECDH exchange failed' }));
        throw new Error(err.detail || 'ECDH exchange failed');
      }

      const [sharedA, sharedB]: [EcdhResult, EcdhResult] = await Promise.all([resA.json(), resB.json()]);
      setAliceShared(sharedA);
      setBobShared(sharedB);
    } catch (err: any) {
      setErrorMsg(err instanceof TypeError || !err?.message ? OFFLINE_ERROR_MSG : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSigner = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const kp = await fetchKeypair();
      setSignerKeys(kp);
      setSigR('');
      setSigS('');
      setSignDigest('');
      setVerifyResult(null);
    } catch (err: any) {
      setErrorMsg(err instanceof TypeError || !err?.message ? OFFLINE_ERROR_MSG : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async () => {
    setLoading(true);
    setErrorMsg(null);
    setVerifyResult(null);
    try {
      const keys = signerKeys ?? (await fetchKeypair());
      if (!signerKeys) setSignerKeys(keys);

      const res = await fetch('/api/ecc/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          private_key: keys.private_key,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'ECDSA signing failed' }));
        throw new Error(err.detail || 'ECDSA signing failed');
      }
      const data: EcdsaSignResult = await res.json();
      setSigR(data.signature.r);
      setSigS(data.signature.s);
      setSignDigest(data.digest_hex);
    } catch (err: any) {
      setErrorMsg(err instanceof TypeError || !err?.message ? OFFLINE_ERROR_MSG : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!signerKeys) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/ecc/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          public_x: signerKeys.public_key.x,
          public_y: signerKeys.public_key.y,
          r: sigR,
          s: sigS,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'ECDSA verification failed' }));
        throw new Error(err.detail || 'ECDSA verification failed');
      }
      const data: EcdsaVerifyResult = await res.json();
      setVerifyResult(data);
    } catch (err: any) {
      setErrorMsg(err instanceof TypeError || !err?.message ? OFFLINE_ERROR_MSG : err.message);
    } finally {
      setLoading(false);
    }
  };

  const secretsMatch =
    Boolean(aliceShared && bobShared) &&
    aliceShared?.shared_secret_hex === bobShared?.shared_secret_hex;

  return (
    <div className="space-y-3 text-xs" data-testid="ecc-view">
      {/* Sub-mode switcher: ECDH vs ECDSA */}
      <div
        role="group"
        aria-label="ECC protocol mode"
        className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#090b10] border border-stone-800"
      >
        <button
          type="button"
          data-testid="ecc-mode-ecdh"
          aria-pressed={subMode === 'ecdh'}
          onClick={() => {
            setSubMode('ecdh');
            setErrorMsg(null);
          }}
          className={`py-1.5 px-2 rounded-lg font-sans font-semibold transition-colors flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
            subMode === 'ecdh' ? 'bg-amber-500 text-stone-950' : 'text-stone-300 hover:text-stone-100'
          }`}
        >
          <ArrowLeftRight className="w-3.5 h-3.5" /> ECDH Exchange
        </button>
        <button
          type="button"
          data-testid="ecc-mode-ecdsa"
          aria-pressed={subMode === 'ecdsa'}
          onClick={() => {
            setSubMode('ecdsa');
            setErrorMsg(null);
          }}
          className={`py-1.5 px-2 rounded-lg font-sans font-semibold transition-colors flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
            subMode === 'ecdsa' ? 'bg-amber-500 text-stone-950' : 'text-stone-300 hover:text-stone-100'
          }`}
        >
          <PenTool className="w-3.5 h-3.5" /> ECDSA Sign &amp; Verify
        </button>
      </div>

      {subMode === 'ecdh' ? (
        <div className="p-3 rounded-xl bg-[#221f1c] border border-stone-800 space-y-2.5">
          <div className="font-display font-semibold text-amber-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" /> secp256r1 (P-256) ECDH Key Agreement
            </span>
          </div>
          <p className="text-[11px] text-stone-300 leading-relaxed">
            Alice and Bob each generate a 256-bit scalar keypair on NIST P-256 and derive the same shared curve point{' '}
            <span className="font-mono text-amber-200">S = a·B = b·A</span>.
          </p>
          <button
            type="button"
            data-testid="ecc-ecdh-run"
            onClick={handleRunEcdh}
            disabled={loading}
            className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:outline-none"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Computing Curve Points...' : 'Generate Keypairs & Run ECDH'}
          </button>

          {aliceKeys && bobKeys && (
            <div className="grid grid-cols-1 gap-2 pt-1 font-mono text-[10px]">
              <div className="p-2 rounded-lg bg-[#090b10] border border-stone-800 space-y-1">
                <div className="text-sky-300 font-semibold">Alice Public Point (A = a·G)</div>
                <div className="text-stone-300 break-all">x: {aliceKeys.public_key.x}</div>
                <div className="text-stone-300 break-all">y: {aliceKeys.public_key.y}</div>
              </div>
              <div className="p-2 rounded-lg bg-[#090b10] border border-stone-800 space-y-1">
                <div className="text-emerald-300 font-semibold">Bob Public Point (B = b·G)</div>
                <div className="text-stone-300 break-all">x: {bobKeys.public_key.x}</div>
                <div className="text-stone-300 break-all">y: {bobKeys.public_key.y}</div>
              </div>
            </div>
          )}

          {aliceShared && bobShared && (
            <div
              data-testid="ecc-ecdh-result"
              className={`p-2.5 rounded-lg border font-mono text-[11px] space-y-1 ${
                secretsMatch
                  ? 'bg-emerald-950/30 border-emerald-700/60 text-emerald-200'
                  : 'bg-red-950/30 border-red-700/60 text-red-200'
              }`}
            >
              <div className="font-sans font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                {secretsMatch ? 'Shared Secrets Match (a·B == b·A)' : 'Shared Secret Mismatch'}
              </div>
              <div className="text-[10px] break-all text-stone-200">
                Shared Secret: {aliceShared.shared_secret_hex}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-[#221f1c] border border-stone-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-display font-semibold text-amber-300 flex items-center gap-1.5">
              <PenTool className="w-3.5 h-3.5" /> ECDSA P-256 Sign &amp; Verify
            </span>
            <button
              type="button"
              data-testid="ecc-ecdsa-keygen"
              onClick={handleGenerateSigner}
              disabled={loading}
              className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-medium flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
            >
              <KeyRound className="w-3 h-3" /> New Keypair
            </button>
          </div>

          {signerKeys && (
            <div className="p-2 rounded-lg bg-[#090b10] border border-stone-800 font-mono text-[10px] text-stone-300 space-y-0.5">
              <div className="text-amber-300">Public Key Q = d·G (secp256r1)</div>
              <div className="truncate">Qx: {signerKeys.public_key.x}</div>
              <div className="truncate">Qy: {signerKeys.public_key.y}</div>
            </div>
          )}

          <div>
            <label htmlFor="ecc-sign-message" className="block text-[11px] text-stone-300 mb-1">
              Message to Sign / Verify:
            </label>
            <textarea
              id="ecc-sign-message"
              data-testid="ecc-sign-message"
              maxLength={2000}
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 rounded-lg bg-[#090b10] border border-stone-800 font-mono text-stone-100 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              data-testid="ecc-sign-btn"
              onClick={handleSign}
              disabled={loading || !message}
              className="py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:outline-none"
            >
              <PenTool className="w-3.5 h-3.5" /> Sign (ECDSA)
            </button>
            <button
              type="button"
              data-testid="ecc-verify-btn"
              onClick={handleVerify}
              disabled={loading || !signerKeys || !sigR || !sigS}
              className="py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Verify Signature
            </button>
          </div>

          {sigR && sigS && (
            <div
              data-testid="ecc-signature-output"
              className="p-2.5 rounded-lg bg-[#090b10] border border-stone-800 font-mono text-[10px] space-y-1 text-stone-200"
            >
              <div className="text-amber-300">SHA-256 Digest: {signDigest}</div>
              <div className="break-all">r: {sigR}</div>
              <div className="break-all">s: {sigS}</div>
            </div>
          )}

          {verifyResult && (
            <div
              data-testid="ecc-verify-result"
              className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center gap-2 ${
                verifyResult.valid
                  ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
                  : 'bg-red-950/40 border-red-700/60 text-red-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>
                {verifyResult.valid
                  ? 'Signature VALID (secp256r1 / SHA-256)'
                  : 'Signature INVALID — message or signature tampered'}
              </span>
            </div>
          )}
        </div>
      )}

      {errorMsg && (
        <div
          role="alert"
          className="p-2.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 flex items-start gap-2"
        >
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
