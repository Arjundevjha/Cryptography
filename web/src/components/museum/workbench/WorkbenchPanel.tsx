'use client';

import { useState, useEffect } from 'react';
import { CipherExhibit } from '../museumData';
import { Lock, Unlock, Play, RefreshCw, AlertTriangle } from 'lucide-react';

interface WorkbenchPanelProps {
  exhibit: CipherExhibit;
}

export function WorkbenchPanel({ exhibit }: WorkbenchPanelProps) {
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [inputText, setInputText] = useState('HELLO MUSEUM WORLD');
  const [outputText, setOutputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cipher specific parameter states
  const [shift, setShift] = useState<number>(exhibit.defaultParams.shift ?? 3);
  const [aKey, setAKey] = useState<number>(exhibit.defaultParams.a_key ?? 5);
  const [bKey, setBKey] = useState<number>(exhibit.defaultParams.b_key ?? 8);
  const [keyPhrase, setKeyPhrase] = useState<string>(exhibit.defaultParams.key ?? 'LEMON');
  const [width, setWidth] = useState<number>(exhibit.defaultParams.width ?? 4);
  const [pVal, setPVal] = useState<number>(61);
  const [qVal, setQVal] = useState<number>(53);
  const [eVal, setEVal] = useState<number>(17);
  const [rsaPublicKey, setRsaPublicKey] = useState<string>('');
  const [rsaPrivateKey, setRsaPrivateKey] = useState<string>('');
  const [aesKey, setAesKey] = useState<string>('1234567890123456');
  const [aesNonce, setAesNonce] = useState<string>('');
  const [enigmaRotors, setEnigmaRotors] = useState<string[]>(['I', 'II', 'III']);
  const [enigmaPositions, setEnigmaPositions] = useState<string[]>(['A', 'A', 'A']);
  const [enigmaRings, setEnigmaRings] = useState<string[]>(['A', 'A', 'A']);
  const [enigmaPlugboard, setEnigmaPlugboard] = useState<string>('AB CD');

  useEffect(() => {
    setInputText('HELLO MUSEUM WORLD');
    setOutputText('');
    setErrorMsg(null);
  }, [exhibit.id]);

  const handleRSAKeygen = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/rsa/keygen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ p: pVal, q: qVal, e: eVal }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ detail: 'Keygen error' }));
        throw new Error(errData.detail || 'Failed to generate RSA keys');
      }
      const data = await res.json();
      setRsaPublicKey(data.public_key);
      setRsaPrivateKey(data.private_key);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not reach encryption server — is the API running?');
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    setLoading(true);
    setErrorMsg(null);

    let endpoint = mode === 'encrypt' ? exhibit.endpoint.encrypt : exhibit.endpoint.decrypt;
    let payload: any = {};

    try {
      if (exhibit.id === 'caesar') {
        payload = mode === 'encrypt'
          ? { plaintext: inputText, shift }
          : { ciphertext: inputText, shift };
      } else if (exhibit.id === 'affine') {
        payload = mode === 'encrypt'
          ? { plaintext: inputText, a_key: aKey, b_key: bKey }
          : { ciphertext: inputText, a_key: aKey, b_key: bKey };
      } else if (exhibit.id === 'vigenere' || exhibit.id === 'playfair') {
        payload = mode === 'encrypt'
          ? { plaintext: inputText, key: keyPhrase }
          : { ciphertext: inputText, key: keyPhrase };
      } else if (exhibit.id === 'polybius') {
        payload = mode === 'encrypt'
          ? { plaintext: inputText, key: keyPhrase.length === 25 ? keyPhrase : undefined }
          : { ciphertext: inputText, key: keyPhrase.length === 25 ? keyPhrase : undefined };
      } else if (exhibit.id === 'scytale') {
        payload = mode === 'encrypt'
          ? { plaintext: inputText, width }
          : { ciphertext: inputText, width };
      } else if (exhibit.id === 'enigma') {
        const plugSwaps = enigmaPlugboard.trim() ? enigmaPlugboard.trim().split(/\s+/) : [];
        payload = {
          plaintext: inputText,
          rotors: enigmaRotors,
          positions: enigmaPositions,
          rings: enigmaRings,
          plugboard: plugSwaps,
        };
      } else if (exhibit.id === 'rsa') {
        if (mode === 'encrypt') {
          if (!rsaPublicKey) {
            await handleRSAKeygen();
          }
          payload = { plaintext: inputText, public_key: rsaPublicKey };
        } else {
          payload = { ciphertext: inputText, private_key: rsaPrivateKey };
        }
      } else if (exhibit.id === 'aes') {
        if (mode === 'encrypt') {
          payload = { plaintext: inputText, key: aesKey, key_format: 'text', plaintext_format: 'text' };
        } else {
          payload = { ciphertext: inputText, key: aesKey, nonce: aesNonce, key_format: 'text' };
        }
      } else if (exhibit.id === 'sha256') {
        payload = { plaintext: inputText };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ detail: 'API Error' }));
        throw new Error(errData.detail || 'Execution failed');
      }

      const data = await res.json();
      if (mode === 'encrypt') {
        setOutputText(data.ciphertext || data.hash || '');
        if (data.nonce) setAesNonce(data.nonce);
      } else {
        setOutputText(data.plaintext || '');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not reach encryption server — is the API running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-testid={`exhibit-${exhibit.id}`}
      className="w-80 md:w-96 p-5 rounded-2xl bg-stone-950/85 backdrop-blur-xl border border-amber-500/30 shadow-2xl text-stone-100 font-sans"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-amber-500/20">
        <div>
          <h3 className="text-sm font-bold tracking-wider text-amber-400 font-mono uppercase">{exhibit.name} WORKBENCH</h3>
          <p className="text-xs text-stone-400">Connected to FastAPI Python Engine</p>
        </div>

        {/* Encrypt / Decrypt Toggle */}
        <div className="flex rounded-lg p-1 bg-stone-900 border border-stone-800" data-testid={`mode-select-${exhibit.id}`}>
          <button
            data-testid={`encrypt-btn-${exhibit.id}`}
            onClick={() => setMode('encrypt')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
              mode === 'encrypt' ? 'bg-amber-500 text-stone-950 shadow active' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Lock className="w-3 h-3" /> Encrypt
          </button>
          <button
            data-testid={`decrypt-btn-${exhibit.id}`}
            onClick={() => setMode('decrypt')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
              mode === 'decrypt' ? 'bg-amber-500 text-stone-950 shadow active' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Unlock className="w-3 h-3" /> Decrypt
          </button>
        </div>
      </div>

      {/* Input Field */}
      <div className="mb-4">
        <label className="block text-xs font-mono text-stone-300 mb-1">
          {mode === 'encrypt' ? 'PLAINTEXT INPUT' : 'CIPHERTEXT INPUT'}
        </label>
        <textarea
          rows={2}
          data-testid={`input-text-${exhibit.id}`}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-800 text-stone-100 text-xs font-mono focus:outline-none focus:border-amber-500 transition-all"
        />
      </div>

      {/* Dynamic Cipher Parameters */}
      <div className="mb-4 p-3 rounded-lg bg-stone-900/60 border border-stone-800/80 space-y-2">
        <div className="text-[10px] font-mono text-amber-400 tracking-wider">CIPHER PARAMETERS</div>

        {exhibit.id === 'caesar' && (
          <div>
            <label className="block text-[11px] text-stone-400">Shift Value: {shift}</label>
            <input
              type="text"
              data-testid="param-shift-caesar"
              value={shift}
              onChange={(e) => setShift(parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1 rounded bg-stone-950 border border-stone-800 text-xs font-mono text-stone-200"
            />
          </div>
        )}

        {exhibit.id === 'affine' && (
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div>
              <label className="block text-[11px] text-stone-400">Key a:</label>
              <input
                type="number"
                data-testid="param-a-affine"
                value={aKey}
                onChange={(e) => setAKey(parseInt(e.target.value) || 1)}
                className="w-full px-2 py-1 rounded bg-stone-950 border border-stone-800"
              />
            </div>
            <div>
              <label className="block text-[11px] text-stone-400">Key b:</label>
              <input
                type="number"
                data-testid="param-b-affine"
                value={bKey}
                onChange={(e) => setBKey(parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1 rounded bg-stone-950 border border-stone-800"
              />
            </div>
          </div>
        )}

        {(exhibit.id === 'vigenere' || exhibit.id === 'playfair' || exhibit.id === 'polybius') && (
          <div>
            <label className="block text-[11px] text-stone-400">Key Phrase:</label>
            <input
              type="text"
              data-testid={`param-key-${exhibit.id}`}
              value={keyPhrase}
              onChange={(e) => setKeyPhrase(e.target.value)}
              className="w-full px-2 py-1 rounded bg-stone-950 border border-stone-800 text-xs font-mono text-stone-200"
            />
          </div>
        )}

        {exhibit.id === 'scytale' && (
          <div>
            <label className="block text-[11px] text-stone-400">Cylinder Diameter Width: {width}</label>
            <input
              type="number"
              data-testid="param-width-scytale"
              value={width}
              onChange={(e) => setWidth(parseInt(e.target.value) || 2)}
              className="w-full px-2 py-1 rounded bg-stone-950 border border-stone-800 text-xs font-mono text-stone-200"
            />
          </div>
        )}

        {exhibit.id === 'enigma' && (
          <div className="space-y-1.5 text-xs font-mono">
            <div>Rotors: <span data-testid="param-rotors-enigma">I, II, III</span></div>
            <div>Positions: <span data-testid="param-positions-enigma">A, A, A</span></div>
            <div>Plugboard: <span data-testid="param-plugboard-enigma">{enigmaPlugboard}</span></div>
          </div>
        )}

        {exhibit.id === 'rsa' && (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-1 text-xs font-mono">
              <div>p: <input type="number" data-testid="param-p-rsa" value={pVal} onChange={(e)=>setPVal(parseInt(e.target.value))} className="w-full bg-stone-950 px-1 border border-stone-800" /></div>
              <div>q: <input type="number" data-testid="param-q-rsa" value={qVal} onChange={(e)=>setQVal(parseInt(e.target.value))} className="w-full bg-stone-950 px-1 border border-stone-800" /></div>
              <div>e: <input type="number" data-testid="param-e-rsa" value={eVal} onChange={(e)=>setEVal(parseInt(e.target.value))} className="w-full bg-stone-950 px-1 border border-stone-800" /></div>
            </div>
            <button
              onClick={handleRSAKeygen}
              className="w-full py-1 text-xs rounded bg-stone-800 hover:bg-stone-700 text-amber-300 font-mono flex items-center justify-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Generate Keys
            </button>
          </div>
        )}

        {exhibit.id === 'aes' && (
          <div>
            <label className="block text-[11px] text-stone-400">16-Byte AES Key:</label>
            <input
              type="text"
              data-testid="param-key-aes"
              value={aesKey}
              onChange={(e) => setAesKey(e.target.value)}
              className="w-full px-2 py-1 rounded bg-stone-950 border border-stone-800 text-xs font-mono text-stone-200"
            />
          </div>
        )}
      </div>

      {/* Action Execution Button */}
      <button
        data-testid={`execute-btn-${exhibit.id}`}
        onClick={handleExecute}
        disabled={loading}
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
      >
        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-stone-950" />}
        Execute {mode}
      </button>

      {/* Standardized Error Banner */}
      {errorMsg && (
        <div className="mt-3 p-3 rounded-lg bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-mono flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Output Container */}
      <div className="mt-4">
        <label className="block text-xs font-mono text-stone-300 mb-1">
          {mode === 'encrypt' ? 'CIPHERTEXT RESULT' : 'DECRYPTED PLAINTEXT'}
        </label>
        <div
          data-testid={`output-text-${exhibit.id}`}
          className="w-full min-h-[50px] p-3 rounded-lg bg-stone-900 border border-stone-800 text-amber-300 font-mono text-xs break-all select-all"
        >
          {outputText || <span className="text-stone-600 italic">Result will appear here...</span>}
        </div>
      </div>
    </div>
  );
}
