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
  const [enigmaReflector, setEnigmaReflector] = useState<string>('B');
  const [enigmaPlugboard, setEnigmaPlugboard] = useState<string>('AB CD');
  const [lorenzPositions, setLorenzPositions] = useState<number[]>(Array(12).fill(0));

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
          reflector: enigmaReflector,
          plugboard: plugSwaps,
        };
      } else if (exhibit.id === 'lorenz') {
        payload = mode === 'encrypt'
          ? { plaintext: inputText, positions: lorenzPositions }
          : { ciphertext: inputText, positions: lorenzPositions };
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
          <div className="space-y-2.5 text-xs font-mono">
            {/* Rotor Selectors */}
            <div>
              <label className="block text-[11px] text-stone-400 mb-1">Rotors (Select I - VIII):</label>
              <div className="grid grid-cols-3 gap-1">
                {[0, 1, 2].map((idx) => (
                  <select
                    key={`rotor-${idx}`}
                    value={enigmaRotors[idx] || 'I'}
                    onChange={(e) => {
                      const updated = [...enigmaRotors];
                      updated[idx] = e.target.value;
                      setEnigmaRotors(updated);
                    }}
                    className="px-1.5 py-1 rounded bg-stone-950 border border-stone-800 text-amber-300 font-mono text-xs focus:outline-none focus:border-amber-500"
                  >
                    {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'].map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                ))}
              </div>
              <input
                type="text"
                data-testid="param-rotors-enigma"
                value={enigmaRotors.join('-')}
                onChange={(e) => {
                  const parts = e.target.value.split(/[-,\s]+/).map((s) => s.trim().toUpperCase());
                  if (parts.length === 3) setEnigmaRotors(parts);
                }}
                className="sr-only"
              />
            </div>

            {/* Reflector Selection */}
            <div>
              <label className="block text-[11px] text-stone-400 mb-1">Reflector:</label>
              <select
                data-testid="param-reflector-enigma"
                value={enigmaReflector}
                onChange={(e) => setEnigmaReflector(e.target.value)}
                className="w-full px-2 py-1 rounded bg-stone-950 border border-stone-800 text-amber-300 font-mono text-xs focus:outline-none focus:border-amber-500"
              >
                <option value="A">Reflector A (EJMZALYX...)</option>
                <option value="B">Reflector B (YRUHQSLD... Standard)</option>
                <option value="C">Reflector C (FVPJIAOY...)</option>
                <option value="B_THIN">Reflector B Thin (ENKQAUYW...)</option>
                <option value="C_THIN">Reflector C Thin (RDOBJNTK...)</option>
              </select>
            </div>

            {/* Positions & Rings */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-stone-400 mb-0.5">Positions:</label>
                <input
                  type="text"
                  data-testid="param-positions-enigma"
                  value={enigmaPositions.join('')}
                  onChange={(e) => {
                    const raw = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
                    const p1 = raw[0] || 'A';
                    const p2 = raw[1] || 'A';
                    const p3 = raw[2] || 'A';
                    setEnigmaPositions([p1, p2, p3]);
                  }}
                  maxLength={3}
                  className="w-full px-2 py-1 rounded bg-stone-950 border border-stone-800 text-stone-200 uppercase text-xs font-mono tracking-widest text-center"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-400 mb-0.5">Rings:</label>
                <input
                  type="text"
                  data-testid="param-rings-enigma"
                  value={enigmaRings.join('')}
                  onChange={(e) => {
                    const raw = e.target.value.toUpperCase().replace(/[^A-Z1-9]/g, '');
                    const r1 = raw[0] || 'A';
                    const r2 = raw[1] || 'A';
                    const r3 = raw[2] || 'A';
                    setEnigmaRings([r1, r2, r3]);
                  }}
                  maxLength={3}
                  className="w-full px-2 py-1 rounded bg-stone-950 border border-stone-800 text-stone-200 uppercase text-xs font-mono tracking-widest text-center"
                />
              </div>
            </div>

            {/* Plugboard Swaps */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] text-stone-400">Plugboard (Steckerbrett Swaps):</label>
                <span className="text-[10px] text-amber-400 font-mono">
                  {enigmaPlugboard.trim() ? enigmaPlugboard.trim().split(/\s+/).length : 0} Swaps Active
                </span>
              </div>
              <input
                type="text"
                data-testid="param-plugboard-enigma"
                value={enigmaPlugboard}
                onChange={(e) => setEnigmaPlugboard(e.target.value.toUpperCase())}
                placeholder="e.g. AB CD EF"
                className="w-full px-2 py-1 rounded bg-stone-950 border border-stone-800 text-stone-200 text-xs font-mono uppercase"
              />
            </div>
          </div>
        )}

        {exhibit.id === 'lorenz' && (
          <div className="space-y-3 text-xs font-mono">
            {/* Hidden Input for E2E testing string representation of positions */}
            <input
              type="text"
              data-testid="param-positions-lorenz"
              value={lorenzPositions.join(',')}
              readOnly
              className="sr-only"
            />

            {/* Chi Wheels (1..5) */}
            <div>
              <label className="block text-[11px] text-amber-400 font-bold mb-1">
                Chi Wheels (χ₁-χ₅ Positions):
              </label>
              <div className="grid grid-cols-5 gap-1">
                {[0, 1, 2, 3, 4].map((idx) => (
                  <input
                    key={`chi-${idx}`}
                    type="number"
                    min={0}
                    value={lorenzPositions[idx]}
                    onChange={(e) => {
                      const updated = [...lorenzPositions];
                      updated[idx] = parseInt(e.target.value) || 0;
                      setLorenzPositions(updated);
                    }}
                    className="w-full px-1 py-1 rounded bg-stone-950 border border-stone-800 text-center text-amber-300 font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                ))}
              </div>
            </div>

            {/* Motor Wheels (1..2) */}
            <div>
              <label className="block text-[11px] text-amber-400 font-bold mb-1">
                Motor Wheels (μ₁-μ₂ Positions):
              </label>
              <div className="grid grid-cols-2 gap-1">
                {[5, 6].map((idx) => (
                  <input
                    key={`motor-${idx}`}
                    type="number"
                    min={0}
                    value={lorenzPositions[idx]}
                    onChange={(e) => {
                      const updated = [...lorenzPositions];
                      updated[idx] = parseInt(e.target.value) || 0;
                      setLorenzPositions(updated);
                    }}
                    className="w-full px-1 py-1 rounded bg-stone-950 border border-stone-800 text-center text-amber-300 font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                ))}
              </div>
            </div>

            {/* Psi Wheels (1..5) */}
            <div>
              <label className="block text-[11px] text-amber-400 font-bold mb-1">
                Psi Wheels (ψ₁-ψ₅ Positions):
              </label>
              <div className="grid grid-cols-5 gap-1">
                {[7, 8, 9, 10, 11].map((idx) => (
                  <input
                    key={`psi-${idx}`}
                    type="number"
                    min={0}
                    value={lorenzPositions[idx]}
                    onChange={(e) => {
                      const updated = [...lorenzPositions];
                      updated[idx] = parseInt(e.target.value) || 0;
                      setLorenzPositions(updated);
                    }}
                    className="w-full px-1 py-1 rounded bg-stone-950 border border-stone-800 text-center text-amber-300 font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                ))}
              </div>
            </div>

            <button
              onClick={() => setLorenzPositions(Array(12).fill(0))}
              className="w-full py-1 rounded bg-stone-900 hover:bg-stone-800 text-stone-400 text-[10px] font-mono flex items-center justify-center gap-1 border border-stone-800"
            >
              <RefreshCw className="w-3 h-3" /> Reset Positions to 0
            </button>
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
