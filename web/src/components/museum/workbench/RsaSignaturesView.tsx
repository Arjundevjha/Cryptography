'use client';

import React, { useState } from 'react';
import { KeyRound, PenTool, ShieldCheck, AlertTriangle, RefreshCw, Flame } from 'lucide-react';

const OFFLINE_ERROR_MSG = 'Could not reach encryption server — is the API running?';

export function RsaSignaturesView() {
  const [pVal, setPVal] = useState(61);
  const [qVal, setQVal] = useState(53);
  const [eVal, setEVal] = useState(17);
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [message, setMessage] = useState('MUSEUM ARTIFACT AUTHENTICITY');
  const [signature, setSignature] = useState('');
  const [digestHex, setDigestHex] = useState('');
  const [verifyResult, setVerifyResult] = useState<{ valid: boolean; digest_hex: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleKeygen = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/rsa/keygen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ p: pVal, q: qVal, e: eVal }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Keygen failed' }));
        throw new Error(err.detail || 'Keygen failed');
      }
      const data = await res.json();
      setPublicKey(data.public_key || '');
      setPrivateKey(data.private_key || '');
      setSignature('');
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
      let priv = privateKey;
      if (!priv) {
        const keyRes = await fetch('/api/rsa/keygen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ p: pVal, q: qVal, e: eVal }),
        });
        if (!keyRes.ok) throw new Error(OFFLINE_ERROR_MSG);
        const keyData = await keyRes.json();
        priv = keyData.private_key;
        setPublicKey(keyData.public_key);
        setPrivateKey(keyData.private_key);
      }

      const res = await fetch('/api/rsa/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, private_key: priv }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Signing failed' }));
        throw new Error(err.detail || 'Signing failed');
      }
      const data = await res.json();
      setSignature(data.signature || '');
      setDigestHex(data.digest_hex || '');
    } catch (err: any) {
      setErrorMsg(err instanceof TypeError || !err?.message ? OFFLINE_ERROR_MSG : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/rsa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, signature, public_key: publicKey }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Verification failed' }));
        throw new Error(err.detail || 'Verification failed');
      }
      const data = await res.json();
      setVerifyResult({ valid: Boolean(data.valid), digest_hex: data.digest_hex || '' });
    } catch (err: any) {
      setErrorMsg(err instanceof TypeError || !err?.message ? OFFLINE_ERROR_MSG : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTamperMessage = () => {
    setMessage((prev) => (prev.endsWith(' [TAMPERED]') ? prev.replace(' [TAMPERED]', '') : `${prev} [TAMPERED]`));
    setVerifyResult(null);
  };

  const handleTamperSignature = () => {
    if (!signature) return;
    const first = signature[0] === '0' ? 'f' : '0';
    setSignature(first + signature.slice(1));
    setVerifyResult(null);
  };

  return (
    <div className="space-y-3 text-xs" data-testid="rsa-signatures-view">
      {/* Keypair Generation */}
      <div className="p-3 rounded-xl bg-[#221f1c] border border-stone-800 space-y-2">
        <div className="font-display font-semibold text-amber-300 flex items-center gap-1.5">
          <KeyRound className="w-3.5 h-3.5" /> 1. RSA Keypair (Signing &amp; Verification)
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <div>
            <label htmlFor="rsa-sig-p" className="block text-[11px] text-stone-300 mb-0.5">Prime p</label>
            <input
              id="rsa-sig-p"
              type="number"
              aria-label="RSA Signature Prime p"
              data-testid="rsa-sig-p"
              value={pVal}
              onChange={(e) => setPVal(parseInt(e.target.value, 10) || 61)}
              className="w-full px-2 py-1 rounded bg-[#090b10] border border-stone-800 font-mono text-stone-200 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
            />
          </div>
          <div>
            <label htmlFor="rsa-sig-q" className="block text-[11px] text-stone-300 mb-0.5">Prime q</label>
            <input
              id="rsa-sig-q"
              type="number"
              aria-label="RSA Signature Prime q"
              data-testid="rsa-sig-q"
              value={qVal}
              onChange={(e) => setQVal(parseInt(e.target.value, 10) || 53)}
              className="w-full px-2 py-1 rounded bg-[#090b10] border border-stone-800 font-mono text-stone-200 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
            />
          </div>
          <div>
            <label htmlFor="rsa-sig-e" className="block text-[11px] text-stone-300 mb-0.5">Exponent e</label>
            <input
              id="rsa-sig-e"
              type="number"
              aria-label="RSA Signature Public Exponent e"
              data-testid="rsa-sig-e"
              value={eVal}
              onChange={(e) => setEVal(parseInt(e.target.value, 10) || 17)}
              className="w-full px-2 py-1 rounded bg-[#090b10] border border-stone-800 font-mono text-stone-200 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
            />
          </div>
        </div>
        <button
          type="button"
          data-testid="rsa-sig-keygen-btn"
          onClick={handleKeygen}
          disabled={loading}
          aria-label="Generate RSA signing keypair"
          className="w-full py-1.5 rounded-lg bg-[#090b10] hover:bg-stone-900 border border-amber-500/30 text-amber-300 font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          <span>{publicKey ? 'Regenerate Keypair' : 'Generate Keypair'}</span>
        </button>
      </div>

      {/* Message & Sign */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="rsa-sig-message" className="block font-sans font-semibold text-stone-200">
            2. Message to Sign / Verify
          </label>
          <button
            type="button"
            data-testid="rsa-sig-tamper-msg-btn"
            onClick={handleTamperMessage}
            aria-label="Tamper message to test verification failure"
            className="text-[11px] text-rose-300 hover:text-rose-200 flex items-center gap-1 underline rounded px-1 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
          >
            <Flame className="w-3 h-3" /> Tamper Message
          </button>
        </div>
        <textarea
          id="rsa-sig-message"
          rows={2}
          data-testid="rsa-sig-message"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            setVerifyResult(null);
          }}
          className="w-full px-2.5 py-1.5 rounded-lg bg-[#090b10] border border-stone-800 font-mono text-stone-100 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
        />
        <button
          type="button"
          data-testid="rsa-sig-sign-btn"
          onClick={handleSign}
          disabled={loading}
          aria-label="Sign message with RSA private key"
          className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
        >
          <PenTool className="w-3.5 h-3.5" /> Sign with Private Key
        </button>
      </div>

      {/* Signature & Verify */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="rsa-sig-hex" className="block font-sans font-semibold text-stone-200">
            3. Signature (Hex)
          </label>
          {signature && (
            <button
              type="button"
              data-testid="rsa-sig-tamper-sig-btn"
              onClick={handleTamperSignature}
              aria-label="Tamper signature hex to test verification failure"
              className="text-[11px] text-rose-300 hover:text-rose-200 flex items-center gap-1 underline rounded px-1 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
            >
              <Flame className="w-3 h-3" /> Tamper Signature
            </button>
          )}
        </div>
        <input
          id="rsa-sig-hex"
          type="text"
          data-testid="rsa-sig-hex"
          value={signature}
          onChange={(e) => {
            setSignature(e.target.value);
            setVerifyResult(null);
          }}
          placeholder="Click 'Sign with Private Key' to generate..."
          className="w-full px-2.5 py-1.5 rounded-lg bg-[#090b10] border border-stone-800 font-mono text-amber-300 placeholder:text-stone-500 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
        />
        {digestHex && (
          <div className="text-[10px] font-mono text-stone-400 truncate">
            SHA-256 Digest: {digestHex}
          </div>
        )}
        <button
          type="button"
          data-testid="rsa-sig-verify-btn"
          onClick={handleVerify}
          disabled={loading || !signature || !publicKey}
          aria-label="Verify signature with RSA public key"
          className="w-full py-2 rounded-xl bg-[#221f1c] hover:bg-[#2c2824] border border-amber-500/40 text-amber-300 font-bold flex items-center justify-center gap-1.5 disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
        >
          <ShieldCheck className="w-3.5 h-3.5" /> Verify with Public Key
        </button>
      </div>

      {errorMsg && (
        <div role="alert" aria-live="assertive" className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-200 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {verifyResult && (
        <div
          data-testid="rsa-sig-verify-result"
          aria-live="polite"
          className={`p-2.5 rounded-lg border font-sans font-semibold flex items-center justify-between ${
            verifyResult.valid
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/70 border-rose-500/50 text-rose-200'
          }`}
        >
          <span>{verifyResult.valid ? 'VALID SIGNATURE' : 'INVALID SIGNATURE'}</span>
          <span className="font-mono text-[10px] opacity-80">RSA-SHA256</span>
        </div>
      )}
    </div>
  );
}
