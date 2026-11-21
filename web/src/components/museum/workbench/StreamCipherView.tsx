'use client';

import React, { useState } from 'react';
import { Lock, Unlock, Shield, AlertTriangle, Sparkles } from 'lucide-react';

const OFFLINE_ERROR_MSG = 'Could not reach encryption server — is the API running?';

type StreamCipherAlgorithm = 'chacha20' | 'otp';

export function StreamCipherView() {
  const [algorithm, setAlgorithm] = useState<StreamCipherAlgorithm>('chacha20');
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [inputText, setInputText] = useState('SHANNON PERFECT SECRECY');
  const [key, setKey] = useState('');
  const [keyFormat, setKeyFormat] = useState<'hex' | 'text'>('hex');
  const [nonce, setNonce] = useState('');
  const [counter, setCounter] = useState(1);

  const [outputText, setOutputText] = useState('');
  const [resolvedKeyHex, setResolvedKeyHex] = useState('');
  const [resolvedNonceHex, setResolvedNonceHex] = useState('');
  const [keystreamPreview, setKeystreamPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRun = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      let endpoint = '';
      let payload: Record<string, unknown> = {};

      if (algorithm === 'otp') {
        if (mode === 'encrypt') {
          endpoint = '/api/otp/encrypt';
          payload = {
            plaintext: inputText,
            key_format: keyFormat,
            ...(key.trim() ? { key: key.trim() } : {}),
          };
        } else {
          endpoint = '/api/otp/decrypt';
          payload = {
            ciphertext_hex: inputText.trim(),
            key: key.trim(),
            key_format: keyFormat,
          };
        }
      } else {
        if (mode === 'encrypt') {
          endpoint = '/api/chacha20/encrypt';
          payload = {
            plaintext: inputText,
            key_format: keyFormat,
            counter,
            ...(key.trim() ? { key: key.trim() } : {}),
            ...(nonce.trim() ? { nonce: nonce.trim() } : {}),
          };
        } else {
          endpoint = '/api/chacha20/decrypt';
          payload = {
            ciphertext_hex: inputText.trim(),
            key: key.trim(),
            nonce: nonce.trim(),
            counter,
            key_format: keyFormat,
          };
        }
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Stream cipher operation failed' }));
        throw new Error(err.detail || 'Stream cipher operation failed');
      }

      const data = await res.json();
      if (mode === 'encrypt') {
        setOutputText(data.ciphertext_hex || '');
        if (data.key_hex) {
          setResolvedKeyHex(data.key_hex);
          if (!key.trim()) setKey(data.key_hex);
        }
        if (data.nonce_hex) {
          setResolvedNonceHex(data.nonce_hex);
          if (!nonce.trim()) setNonce(data.nonce_hex);
        }
        setKeystreamPreview(data.keystream_preview_hex || '');
      } else {
        setOutputText(data.plaintext ?? '');
        setKeystreamPreview('');
      }
    } catch (err: any) {
      setErrorMsg(err instanceof TypeError || !err?.message ? OFFLINE_ERROR_MSG : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 text-xs" data-testid="stream-cipher-view">
      {/* Algorithm Switcher: ChaCha20 vs One-Time Pad */}
      <div
        role="group"
        aria-label="Stream cipher algorithm"
        className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#090b10] border border-stone-800"
      >
        <button
          type="button"
          data-testid="stream-algo-chacha20"
          aria-pressed={algorithm === 'chacha20'}
          onClick={() => {
            setAlgorithm('chacha20');
            setOutputText('');
            setErrorMsg(null);
          }}
          className={`py-1.5 px-2 rounded-lg font-sans font-semibold transition-colors flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
            algorithm === 'chacha20' ? 'bg-amber-500 text-stone-950' : 'text-stone-300 hover:text-stone-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> ChaCha20 (RFC 8439)
        </button>
        <button
          type="button"
          data-testid="stream-algo-otp"
          aria-pressed={algorithm === 'otp'}
          onClick={() => {
            setAlgorithm('otp');
            setOutputText('');
            setErrorMsg(null);
          }}
          className={`py-1.5 px-2 rounded-lg font-sans font-semibold transition-colors flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
            algorithm === 'otp' ? 'bg-amber-500 text-stone-950' : 'text-stone-300 hover:text-stone-100'
          }`}
        >
          <Shield className="w-3.5 h-3.5" /> One-Time Pad (OTP)
        </button>
      </div>

      {/* Encrypt / Decrypt Mode Toggle */}
      <div
        role="group"
        aria-label="Stream cipher mode"
        className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#221f1c] border border-stone-800"
      >
        <button
          type="button"
          data-testid="stream-mode-encrypt"
          aria-pressed={mode === 'encrypt'}
          onClick={() => {
            setMode('encrypt');
            setErrorMsg(null);
          }}
          className={`py-1.5 rounded-lg font-sans font-semibold flex items-center justify-center gap-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
            mode === 'encrypt' ? 'bg-amber-500 text-stone-950' : 'text-stone-300 hover:text-stone-100'
          }`}
        >
          <Lock className="w-3.5 h-3.5" /> Encrypt
        </button>
        <button
          type="button"
          data-testid="stream-mode-decrypt"
          aria-pressed={mode === 'decrypt'}
          onClick={() => {
            setMode('decrypt');
            setErrorMsg(null);
          }}
          className={`py-1.5 rounded-lg font-sans font-semibold flex items-center justify-center gap-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
            mode === 'decrypt' ? 'bg-amber-500 text-stone-950' : 'text-stone-300 hover:text-stone-100'
          }`}
        >
          <Unlock className="w-3.5 h-3.5" /> Decrypt
        </button>
      </div>

      {/* Input Text */}
      <div>
        <label htmlFor="stream-input-text" className="block text-[11px] font-semibold text-stone-200 mb-1">
          {mode === 'encrypt' ? 'Plaintext Input' : 'Ciphertext Hex Input'}
        </label>
        <textarea
          id="stream-input-text"
          data-testid="stream-input-text"
          rows={2}
          maxLength={500}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="w-full p-2.5 rounded-xl bg-[#090b10] border border-stone-800 font-mono text-stone-100 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
        />
      </div>

      {/* Key & Format */}
      <div className="p-3 rounded-xl bg-[#221f1c] border border-stone-800 space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="stream-key-input" className="text-[11px] text-stone-300 font-semibold">
            Key ({algorithm === 'chacha20' ? '256-bit / 64 hex' : '≥ plaintext length'})
          </label>
          <div role="group" aria-label="Key format" className="flex gap-1">
            {(['hex', 'text'] as const).map((fmt) => (
              <button
                key={fmt}
                type="button"
                data-testid={`stream-key-fmt-${fmt}`}
                aria-pressed={keyFormat === fmt}
                onClick={() => setKeyFormat(fmt)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                  keyFormat === fmt ? 'bg-amber-500 text-stone-950 font-bold' : 'bg-stone-800 text-stone-300'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>
        <input
          id="stream-key-input"
          data-testid="stream-key-input"
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder={mode === 'encrypt' ? 'Leave blank to auto-generate random key' : 'Enter key used for encryption'}
          className="w-full px-2.5 py-1.5 rounded-lg bg-[#090b10] border border-stone-800 font-mono text-[11px] text-stone-200 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
        />

        {algorithm === 'chacha20' && (
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="col-span-2">
              <label htmlFor="stream-nonce-input" className="block text-[11px] text-stone-300 mb-1">
                96-bit Nonce (24 hex):
              </label>
              <input
                id="stream-nonce-input"
                data-testid="stream-nonce-input"
                type="text"
                value={nonce}
                onChange={(e) => setNonce(e.target.value)}
                placeholder={mode === 'encrypt' ? 'Auto-generated if blank' : '24-char hex nonce'}
                className="w-full px-2.5 py-1 rounded-lg bg-[#090b10] border border-stone-800 font-mono text-[11px] text-stone-200 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
              />
            </div>
            <div>
              <label htmlFor="stream-counter-input" className="block text-[11px] text-stone-300 mb-1">
                Counter:
              </label>
              <input
                id="stream-counter-input"
                data-testid="stream-counter-input"
                type="number"
                min={0}
                max={4294967295}
                value={counter}
                onChange={(e) => setCounter(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full px-2.5 py-1 rounded-lg bg-[#090b10] border border-stone-800 font-mono text-[11px] text-stone-200 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        data-testid="stream-execute-btn"
        onClick={handleRun}
        disabled={loading || !inputText}
        className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-sans font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:outline-none"
      >
        {loading ? 'Processing Stream...' : mode === 'encrypt' ? 'Encrypt Stream' : 'Decrypt Stream'}
      </button>

      {outputText && (
        <div
          data-testid="stream-output-box"
          className="p-3 rounded-xl bg-[#090b10] border border-stone-800 space-y-1.5 font-mono text-[11px]"
        >
          <div className="text-amber-300 font-sans font-semibold">
            {mode === 'encrypt' ? 'Ciphertext (Hex)' : 'Recovered Plaintext'}
          </div>
          <div data-testid="stream-output-text" className="text-stone-100 break-all">
            {outputText}
          </div>
          {resolvedKeyHex && (
            <div className="text-[10px] text-stone-400 break-all">Key Hex: {resolvedKeyHex}</div>
          )}
          {resolvedNonceHex && algorithm === 'chacha20' && (
            <div className="text-[10px] text-stone-400 break-all">Nonce Hex: {resolvedNonceHex}</div>
          )}
          {keystreamPreview && algorithm === 'chacha20' && (
            <div className="text-[10px] text-teal-300 break-all">
              Keystream Preview: {keystreamPreview}
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
