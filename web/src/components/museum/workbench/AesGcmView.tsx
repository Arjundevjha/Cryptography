'use client';

import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, ShieldCheck } from 'lucide-react';

const OFFLINE_ERROR_MSG = 'Could not reach encryption server — is the API running?';

export function AesGcmView() {
  const [plaintext, setPlaintext] = useState('Authenticated Museum Payload');
  const [key, setKey] = useState('0123456789abcdef0123456789abcdef');
  const [aad, setAad] = useState('header=museum-v1');
  const [verifyAad, setVerifyAad] = useState('header=museum-v1');

  const [ciphertextHex, setCiphertextHex] = useState('');
  const [nonceHex, setNonceHex] = useState('');
  const [tagHex, setTagHex] = useState('');
  const [verifyResult, setVerifyResult] = useState<{ valid: boolean; plaintext?: string | null; error?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleEncrypt = async () => {
    setLoading(true);
    setErrorMsg(null);
    setVerifyResult(null);
    try {
      const res = await fetch('/api/aes-gcm/encrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plaintext, key, aad }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'AES-GCM encrypt failed' }));
        throw new Error(err.detail || 'AES-GCM encrypt failed');
      }
      const data = await res.json();
      setCiphertextHex(data.ciphertext_hex);
      setNonceHex(data.nonce_hex);
      setTagHex(data.tag_hex);
      setVerifyAad(aad);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      setErrorMsg(err instanceof TypeError || !msg ? OFFLINE_ERROR_MSG : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDecrypt = async () => {
    if (!ciphertextHex) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/aes-gcm/decrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ciphertext_hex: ciphertextHex,
          key,
          nonce_hex: nonceHex,
          tag_hex: tagHex,
          aad: verifyAad,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'AES-GCM decrypt failed' }));
        throw new Error(err.detail || 'AES-GCM decrypt failed');
      }
      setVerifyResult(await res.json());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      setErrorMsg(err instanceof TypeError || !msg ? OFFLINE_ERROR_MSG : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 text-xs" data-testid="aes-gcm-view">
      <div className="p-3 rounded-xl bg-[#221f1c] border border-stone-800 space-y-2">
        <div>
          <label htmlFor="gcm-pt" className="block text-[11px] text-stone-200 mb-1">Plaintext</label>
          <input
            id="gcm-pt"
            data-testid="aes-gcm-plaintext"
            type="text"
            value={plaintext}
            onChange={(e) => setPlaintext(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-[#090b10] border border-stone-800 font-mono text-amber-300"
          />
        </div>
        <div>
          <label htmlFor="gcm-key" className="block text-[11px] text-stone-300 mb-1">256-bit Key (32 chars)</label>
          <input
            id="gcm-key"
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-[#090b10] border border-stone-800 font-mono text-stone-100"
          />
        </div>
        <div>
          <label htmlFor="gcm-aad" className="block text-[11px] text-stone-300 mb-1">Associated Data (AAD)</label>
          <input
            id="gcm-aad"
            type="text"
            value={aad}
            onChange={(e) => setAad(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-[#090b10] border border-stone-800 font-mono text-cyan-300"
          />
        </div>
        <button
          type="button"
          data-testid="aes-gcm-encrypt-btn"
          onClick={handleEncrypt}
          disabled={loading}
          className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold"
        >
          Encrypt &amp; Generate GHASH Tag
        </button>
      </div>

      {ciphertextHex && (
        <div className="p-3 rounded-xl bg-[#111520] border border-stone-800 space-y-2">
          <div className="font-mono text-[10px] text-stone-300 break-all">
            <div>Ciphertext: <span className="text-amber-300">{ciphertextHex}</span></div>
            <div>Tag: <span className="text-cyan-300">{tagHex}</span></div>
          </div>
          <div>
            <label htmlFor="gcm-verify-aad" className="block text-[11px] text-stone-300 mb-1">
              Verify with AAD (edit to test tamper detection):
            </label>
            <input
              id="gcm-verify-aad"
              data-testid="aes-gcm-verify-aad"
              type="text"
              value={verifyAad}
              onChange={(e) => setVerifyAad(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#090b10] border border-stone-800 font-mono text-stone-100"
            />
          </div>
          <button
            type="button"
            data-testid="aes-gcm-decrypt-btn"
            onClick={handleDecrypt}
            disabled={loading}
            className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
          >
            Verify Tag &amp; Decrypt
          </button>
        </div>
      )}

      {verifyResult && (
        <div
          data-testid="aes-gcm-result"
          className={`p-3 rounded-xl border space-y-1 ${
            verifyResult.valid
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-1.5 font-semibold">
            {verifyResult.valid ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
            {verifyResult.valid ? 'Tag Verified' : 'Tag Verification Failed'}
          </div>
          <div className="font-mono text-xs break-all">
            {verifyResult.valid ? verifyResult.plaintext : verifyResult.error}
          </div>
        </div>
      )}

      {errorMsg && (
        <div role="alert" className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-200 flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
