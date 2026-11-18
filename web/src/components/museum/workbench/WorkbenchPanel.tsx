'use client';

import { useState, useEffect, useRef } from 'react';
import { CipherExhibit } from '../museumData';
import {
  Lock,
  Unlock,
  Play,
  RefreshCw,
  AlertTriangle,
  Copy,
  Check,
  ArrowUpDown,
  BarChart3,
  Layers,
  Award,
  Wrench,
  Swords,
} from 'lucide-react';
import { CipherParameterControls } from './CipherParameterControls';
import { FrequencyAnalysisView } from './FrequencyAnalysisView';
import { StepInspectorView } from './StepInspectorView';
import { PassportChallengeView } from './PassportChallengeView';
import { AesBlockMode } from './AesModeVisualizer';
import { RsaSignaturesView } from './RsaSignaturesView';
import { ZkpSchnorrView } from './ZkpSchnorrView';
import { PostQuantumKemView } from './PostQuantumKemView';
import { AttackLabView } from './labs/AttackLabView';
import { hasAttackLab } from './labs/labApi';

interface WorkbenchPanelProps {
  exhibit: CipherExhibit;
}

type WorkbenchTab = 'workbench' | 'cryptanalysis' | 'inspector' | 'attack-lab' | 'challenge';

const OFFLINE_ERROR_MSG = 'Could not reach encryption server — is the API running?';

export function WorkbenchPanel({ exhibit }: WorkbenchPanelProps) {
  const [activeTab, setActiveTab] = useState<WorkbenchTab>('workbench');
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [inputText, setInputText] = useState('HELLO MUSEUM WORLD');
  const [outputText, setOutputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Cipher specific parameter states
  const [shift, setShift] = useState<number>(exhibit.defaultParams.shift ?? 3);
  const [aKey, setAKey] = useState<number>(exhibit.defaultParams.a_key ?? 5);
  const [bKey, setBKey] = useState<number>(exhibit.defaultParams.b_key ?? 8);
  const [keyPhrase, setKeyPhrase] = useState<string>(exhibit.defaultParams.key ?? 'LEMON');
  const [substitutionKey, setSubstitutionKey] = useState<string>(
    exhibit.defaultParams.substitutionKey ?? 'QWERTYUIOPASDFGHJKLZXCVBNM'
  );
  const [width, setWidth] = useState<number>(exhibit.defaultParams.width ?? 4);
  const [pVal, setPVal] = useState<number>(61);
  const [qVal, setQVal] = useState<number>(53);
  const [eVal, setEVal] = useState<number>(17);
  const [rsaPublicKey, setRsaPublicKey] = useState<string>('');
  const [rsaPrivateKey, setRsaPrivateKey] = useState<string>('');
  const [aesKey, setAesKey] = useState<string>('1234567890123456');
  const [aesNonce, setAesNonce] = useState<string>('');
  const [aesBlockMode, setAesBlockMode] = useState<AesBlockMode>('ctr');
  const [aesIv, setAesIv] = useState<string>('');
  const [cbcResult, setCbcResult] = useState<{
    iv_hex: string;
    padded_blocks_hex: string[];
    ciphertext_blocks_hex: string[];
  } | null>(null);
  const tabRefs = useRef<Partial<Record<WorkbenchTab, HTMLButtonElement | null>>>({});
  const [enigmaRotors, setEnigmaRotors] = useState<string[]>(['I', 'II', 'III']);
  const [enigmaPositions, setEnigmaPositions] = useState<string[]>(['A', 'A', 'A']);
  const [enigmaRings, setEnigmaRings] = useState<string[]>(['A', 'A', 'A']);
  const [enigmaReflector, setEnigmaReflector] = useState<string>('B');
  const [enigmaPlugboard, setEnigmaPlugboard] = useState<string>('AB CD');
  const [lorenzPositions, setLorenzPositions] = useState<number[]>(Array(12).fill(0));

  // New exhibit states: hmac-hash & diffie-hellman
  const [hashAlgorithm, setHashAlgorithm] = useState<'sha256' | 'sha3_256' | 'blake2s' | 'md5'>('sha256');
  const [hmacAction, setHmacAction] = useState<'hash' | 'sign' | 'verify'>('hash');
  const [hmacKey, setHmacKey] = useState<string>('MUSEUM_SECRET_KEY');
  const [hmacSignature, setHmacSignature] = useState<string>('');
  const [dhPrime, setDhPrime] = useState<number>(exhibit.defaultParams.p ?? 23);
  const [dhGen, setDhGen] = useState<number>(exhibit.defaultParams.g ?? 5);
  const [dhAlice, setDhAlice] = useState<number>(exhibit.defaultParams.a ?? 6);
  const [dhBob, setDhBob] = useState<number>(exhibit.defaultParams.b ?? 15);
  const [dhResult, setDhResult] = useState<{ A: number; B: number; shared_secret: number } | null>(null);

  useEffect(() => {
    setInputText('HELLO MUSEUM WORLD');
    setOutputText('');
    setErrorMsg(null);
    setCopied(false);
    setActiveTab('workbench');
    setDhResult(null);
    setCbcResult(null);
    setAesBlockMode('ctr');
    setAesIv('');
  }, [exhibit.id]);

  const handleCopy = async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API fails
    }
  };

  const handleSwap = () => {
    if (!outputText) return;
    setInputText(outputText);
    setOutputText('');
    setMode(mode === 'encrypt' ? 'decrypt' : 'encrypt');
  };

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
      setErrorMsg(err.message || OFFLINE_ERROR_MSG);
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    setLoading(true);
    setErrorMsg(null);

    let endpoint = mode === 'encrypt' ? exhibit.endpoint.encrypt : exhibit.endpoint.decrypt;
    let payload: Record<string, any> = {};

    try {
      if (exhibit.id === 'caesar') {
        payload = mode === 'encrypt' ? { plaintext: inputText, shift } : { ciphertext: inputText, shift };
      } else if (exhibit.id === 'affine') {
        payload = mode === 'encrypt'
          ? { plaintext: inputText, a_key: aKey, b_key: bKey }
          : { ciphertext: inputText, a_key: aKey, b_key: bKey };
      } else if (exhibit.id === 'vigenere' || exhibit.id === 'playfair') {
        payload = mode === 'encrypt'
          ? { plaintext: inputText, key: keyPhrase }
          : { ciphertext: inputText, key: keyPhrase };
      } else if (exhibit.id === 'substitution') {
        endpoint = mode === 'encrypt' ? '/api/substitution/encrypt' : '/api/substitution/decrypt';
        payload = mode === 'encrypt'
          ? { plaintext: inputText, key: substitutionKey }
          : { ciphertext: inputText, key: substitutionKey };
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
          let pubKey = rsaPublicKey;
          if (!pubKey) {
            const keyRes = await fetch('/api/rsa/keygen', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ p: pVal, q: qVal, e: eVal }),
            });
            if (!keyRes.ok) throw new Error(OFFLINE_ERROR_MSG);
            const keyData = await keyRes.json();
            pubKey = keyData.public_key;
            setRsaPublicKey(keyData.public_key);
            setRsaPrivateKey(keyData.private_key);
          }
          payload = { plaintext: inputText, public_key: pubKey };
        } else {
          payload = { ciphertext: inputText, private_key: rsaPrivateKey };
        }
      } else if (exhibit.id === 'aes') {
        if (aesBlockMode === 'cbc') {
          endpoint = mode === 'encrypt' ? '/api/aes/cbc/encrypt' : '/api/aes/cbc/decrypt';
          payload =
            mode === 'encrypt'
              ? {
                  plaintext: inputText,
                  key: aesKey,
                  key_format: 'text',
                  ...(aesIv.trim() ? { iv: aesIv.trim() } : {}),
                }
              : {
                  ciphertext: inputText,
                  key: aesKey,
                  iv: aesIv.trim(),
                  key_format: 'text',
                };
        } else if (mode === 'encrypt') {
          payload = { plaintext: inputText, key: aesKey, key_format: 'text', plaintext_format: 'text' };
        } else {
          payload = { ciphertext: inputText, key: aesKey, nonce: aesNonce, key_format: 'text' };
        }
      } else if (exhibit.id === 'sha256') {
        payload = { plaintext: inputText };
      } else if (exhibit.id === 'hmac-hash') {
        if (hmacAction === 'hash') {
          endpoint = '/api/hash/digest';
          payload = { plaintext: inputText, algorithm: hashAlgorithm };
        } else if (hmacAction === 'sign') {
          endpoint = '/api/hmac/sign';
          payload = { message: inputText, key: hmacKey, algorithm: 'sha256' };
        } else {
          endpoint = '/api/hmac/verify';
          payload = { message: inputText, key: hmacKey, signature: hmacSignature, algorithm: 'sha256' };
        }
      } else if (exhibit.id === 'diffie-hellman') {
        endpoint = '/api/diffie-hellman/exchange';
        payload = { p: dhPrime, g: dhGen, a: dhAlice, b: dhBob };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ detail: 'Execution failed' }));
        throw new Error(errData.detail || 'Execution failed');
      }

      const data = await res.json();
      if (exhibit.id === 'diffie-hellman') {
        setDhResult(data);
        setOutputText(`A=${data.A}, B=${data.B}, Shared Secret=${data.shared_secret}`);
      } else if (exhibit.id === 'hmac-hash') {
        if (hmacAction === 'hash') {
          setOutputText(data.hash || '');
        } else if (hmacAction === 'sign') {
          setHmacSignature(data.signature || '');
          setOutputText(data.signature || '');
        } else {
          setOutputText(data.valid ? 'VALID SIGNATURE' : 'INVALID SIGNATURE');
        }
      } else if (mode === 'encrypt') {
        setOutputText(data.ciphertext || data.hash || '');
        if (data.nonce) setAesNonce(data.nonce);
        if (data.mode === 'cbc') {
          if (data.iv_hex) setAesIv(data.iv_hex);
          setCbcResult({
            iv_hex: data.iv_hex || '',
            padded_blocks_hex: data.padded_blocks_hex || [],
            ciphertext_blocks_hex: data.ciphertext_blocks_hex || [],
          });
        }
      } else {
        setOutputText(data.plaintext || '');
      }
    } catch (err: any) {
      if (err instanceof TypeError || !err?.message) {
        setErrorMsg(OFFLINE_ERROR_MSG);
      } else {
        setErrorMsg(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const isClassical = exhibit.category === 'Classical';
  const showAttackLab = hasAttackLab(exhibit.id);
  const isProtocolExhibit =
    exhibit.id === 'rsa-signatures' ||
    exhibit.id === 'zkp-schnorr' ||
    exhibit.id === 'post-quantum-kem';

  const visibleTabs: WorkbenchTab[] = [
    'workbench',
    ...(isClassical ? (['cryptanalysis'] as WorkbenchTab[]) : []),
    'inspector',
    ...(showAttackLab ? (['attack-lab'] as WorkbenchTab[]) : []),
    'challenge',
  ];

  const handleTabListKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const idx = visibleTabs.indexOf(activeTab);
    if (idx === -1) return;
    let nextIdx: number | null = null;
    if (e.key === 'ArrowRight') nextIdx = (idx + 1) % visibleTabs.length;
    else if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + visibleTabs.length) % visibleTabs.length;
    else if (e.key === 'Home') nextIdx = 0;
    else if (e.key === 'End') nextIdx = visibleTabs.length - 1;

    if (nextIdx !== null) {
      e.preventDefault();
      const nextTab = visibleTabs[nextIdx];
      setActiveTab(nextTab);
      tabRefs.current[nextTab]?.focus();
    }
  };

  return (
    <div
      data-testid={`exhibit-${exhibit.id}`}
      className="museum-scroller max-h-[calc(100vh-140px)] overflow-y-auto w-[calc(100vw-2.5rem)] sm:w-80 md:w-96 p-5 rounded-2xl bg-[#161412]/95 backdrop-blur-2xl border border-amber-500/30 shadow-2xl text-stone-100 font-sans"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-amber-500/20">
        <div>
          <h3 className="font-display text-sm font-semibold tracking-wide text-amber-300">{exhibit.name}</h3>
          <p className="text-[11px] text-stone-400 font-sans">Interactive Cipher Workbench</p>
        </div>

        {/* Encrypt / Decrypt Toggle */}
        {!isProtocolExhibit && (
          <div
            className="select-none flex rounded-lg p-1 bg-[#221f1c] border border-stone-800 shrink-0"
            data-testid={`mode-select-${exhibit.id}`}
          >
            <button
              data-testid={`encrypt-btn-${exhibit.id}`}
              onClick={() => setMode('encrypt')}
              aria-pressed={mode === 'encrypt'}
              className={`px-2.5 py-1 rounded-md text-xs font-sans font-semibold flex items-center gap-1 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                mode === 'encrypt' ? 'bg-amber-500 text-stone-950 shadow-sm active' : 'text-stone-300 hover:text-stone-100'
              }`}
            >
              <Lock className="w-3 h-3" /> Encrypt
            </button>
            <button
              data-testid={`decrypt-btn-${exhibit.id}`}
              onClick={() => setMode('decrypt')}
              aria-pressed={mode === 'decrypt'}
              className={`px-2.5 py-1 rounded-md text-xs font-sans font-semibold flex items-center gap-1 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                mode === 'decrypt' ? 'bg-amber-500 text-stone-950 shadow-sm active' : 'text-stone-300 hover:text-stone-100'
              }`}
            >
              <Unlock className="w-3 h-3" /> Decrypt
            </button>
          </div>
        )}
      </div>

      {/* Sub-navigation Tabs */}
      <div
        role="tablist"
        aria-label="Workbench tools"
        onKeyDown={handleTabListKeyDown}
        className="flex flex-wrap gap-1 p-1 mb-4 rounded-xl bg-[#221f1c] border border-stone-800 text-[11px] font-sans"
      >
        <button
          ref={(el) => { tabRefs.current.workbench = el; }}
          id={`wb-tab-workbench-${exhibit.id}`}
          role="tab"
          aria-selected={activeTab === 'workbench'}
          aria-controls={`wb-tabpanel-workbench-${exhibit.id}`}
          tabIndex={activeTab === 'workbench' ? 0 : -1}
          onClick={() => setActiveTab('workbench')}
          className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
            activeTab === 'workbench' ? 'bg-amber-500 text-stone-950' : 'text-stone-300 hover:text-stone-100'
          }`}
        >
          <Wrench className="w-3 h-3" /> Cipher
        </button>
        {isClassical && (
          <button
            ref={(el) => { tabRefs.current.cryptanalysis = el; }}
            id={`wb-tab-cryptanalysis-${exhibit.id}`}
            role="tab"
            aria-selected={activeTab === 'cryptanalysis'}
            aria-controls={`wb-tabpanel-cryptanalysis-${exhibit.id}`}
            tabIndex={activeTab === 'cryptanalysis' ? 0 : -1}
            onClick={() => setActiveTab('cryptanalysis')}
            className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
              activeTab === 'cryptanalysis' ? 'bg-amber-500 text-stone-950' : 'text-stone-300 hover:text-stone-100'
            }`}
          >
            <BarChart3 className="w-3 h-3" /> Crack
          </button>
        )}
        <button
          ref={(el) => { tabRefs.current.inspector = el; }}
          id={`wb-tab-inspector-${exhibit.id}`}
          role="tab"
          aria-selected={activeTab === 'inspector'}
          aria-controls={`wb-tabpanel-inspector-${exhibit.id}`}
          tabIndex={activeTab === 'inspector' ? 0 : -1}
          onClick={() => setActiveTab('inspector')}
          className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
            activeTab === 'inspector' ? 'bg-amber-500 text-stone-950' : 'text-stone-300 hover:text-stone-100'
          }`}
        >
          <Layers className="w-3 h-3" /> Steps
        </button>
        {showAttackLab && (
          <button
            ref={(el) => { tabRefs.current['attack-lab'] = el; }}
            id={`wb-tab-attack-lab-${exhibit.id}`}
            role="tab"
            aria-selected={activeTab === 'attack-lab'}
            aria-controls={`wb-tabpanel-attack-lab-${exhibit.id}`}
            tabIndex={activeTab === 'attack-lab' ? 0 : -1}
            onClick={() => setActiveTab('attack-lab')}
            className={`flex-1 py-1.5 px-1.5 whitespace-nowrap rounded-lg font-semibold flex items-center justify-center gap-1 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
              activeTab === 'attack-lab' ? 'bg-amber-500 text-stone-950' : 'text-stone-300 hover:text-stone-100'
            }`}
          >
            <Swords className="w-3 h-3" /> Attack Lab
          </button>
        )}
        <button
          ref={(el) => { tabRefs.current.challenge = el; }}
          id={`wb-tab-challenge-${exhibit.id}`}
          role="tab"
          aria-selected={activeTab === 'challenge'}
          aria-controls={`wb-tabpanel-challenge-${exhibit.id}`}
          tabIndex={activeTab === 'challenge' ? 0 : -1}
          onClick={() => setActiveTab('challenge')}
          className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
            activeTab === 'challenge' ? 'bg-amber-500 text-stone-950' : 'text-stone-300 hover:text-stone-100'
          }`}
        >
          <Award className="w-3 h-3" /> Stamp
        </button>
      </div>

      {activeTab === 'workbench' && (
        <div
          id={`wb-tabpanel-workbench-${exhibit.id}`}
          role="tabpanel"
          aria-labelledby={`wb-tab-workbench-${exhibit.id}`}
        >
          {exhibit.id === 'rsa-signatures' ? (
            <RsaSignaturesView />
          ) : exhibit.id === 'zkp-schnorr' ? (
            <ZkpSchnorrView />
          ) : exhibit.id === 'post-quantum-kem' ? (
            <PostQuantumKemView />
          ) : (
            <>
          {/* Input Field */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor={`input-text-${exhibit.id}`} className="block text-xs font-sans font-semibold text-stone-200">
                {mode === 'encrypt' ? 'Plaintext Input' : 'Ciphertext Input'}
              </label>
              <div className="flex items-center gap-2 text-[11px] text-stone-300">
                <span className="font-mono">{inputText.length} chars</span>
                {inputText.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setInputText('')}
                    aria-label="Clear input text"
                    className="font-sans text-amber-300 hover:text-amber-200 underline focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none rounded px-1"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            <textarea
              id={`input-text-${exhibit.id}`}
              rows={2}
              data-testid={`input-text-${exhibit.id}`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  e.preventDefault();
                  if (!loading) handleExecute();
                }
              }}
              className="w-full px-3 py-2 rounded-lg bg-[#1a1714] border border-stone-800 text-stone-100 text-xs font-mono focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition-colors"
            />
          </div>

          <CipherParameterControls
            exhibitId={exhibit.id}
            mode={mode}
            loading={loading}
            shift={shift}
            setShift={setShift}
            aKey={aKey}
            setAKey={setAKey}
            bKey={bKey}
            setBKey={setBKey}
            keyPhrase={keyPhrase}
            setKeyPhrase={setKeyPhrase}
            substitutionKey={substitutionKey}
            setSubstitutionKey={setSubstitutionKey}
            width={width}
            setWidth={setWidth}
            pVal={pVal}
            setPVal={setPVal}
            qVal={qVal}
            setQVal={setQVal}
            eVal={eVal}
            setEVal={setEVal}
            onRSAKeygen={handleRSAKeygen}
            aesKey={aesKey}
            setAesKey={setAesKey}
            aesBlockMode={aesBlockMode}
            setAesBlockMode={(m) => {
              setAesBlockMode(m);
              setCbcResult(null);
            }}
            aesIv={aesIv}
            setAesIv={setAesIv}
            inputText={inputText}
            onLoadIdenticalBlocks={() => setInputText('MUSEUM_BLOCK_001MUSEUM_BLOCK_001')}
            cbcResult={cbcResult}
            enigmaRotors={enigmaRotors}
            setEnigmaRotors={setEnigmaRotors}
            enigmaPositions={enigmaPositions}
            setEnigmaPositions={setEnigmaPositions}
            enigmaRings={enigmaRings}
            setEnigmaRings={setEnigmaRings}
            enigmaReflector={enigmaReflector}
            setEnigmaReflector={setEnigmaReflector}
            enigmaPlugboard={enigmaPlugboard}
            setEnigmaPlugboard={setEnigmaPlugboard}
            lorenzPositions={lorenzPositions}
            setLorenzPositions={setLorenzPositions}
            hashAlgorithm={hashAlgorithm}
            setHashAlgorithm={setHashAlgorithm}
            hmacAction={hmacAction}
            setHmacAction={setHmacAction}
            hmacKey={hmacKey}
            setHmacKey={setHmacKey}
            hmacSignature={hmacSignature}
            setHmacSignature={setHmacSignature}
            dhPrime={dhPrime}
            setDhPrime={setDhPrime}
            dhGen={dhGen}
            setDhGen={setDhGen}
            dhAlice={dhAlice}
            setDhAlice={setDhAlice}
            dhBob={dhBob}
            setDhBob={setDhBob}
            dhResult={dhResult}
          />

          <button
            data-testid={`execute-btn-${exhibit.id}`}
            onClick={handleExecute}
            disabled={loading}
            aria-busy={loading}
            title={`Execute ${mode} (Ctrl+Enter)`}
            aria-label={`Execute ${mode} (Press Ctrl+Enter or Cmd+Enter to execute)`}
            className="select-none w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-sans font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-stone-950" />}
            <span>Execute {mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}</span>
            <span className="text-[10px] font-mono opacity-70 font-normal ml-0.5 tracking-normal">[Ctrl+↵]</span>
          </button>

          {errorMsg && (
            <div
              role="alert"
              aria-live="assertive"
              className="mt-3 p-3 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs font-sans flex items-start gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <label id={`output-label-${exhibit.id}`} className="block text-xs font-sans font-semibold text-stone-200">
                {mode === 'encrypt' ? 'Ciphertext Result' : 'Decrypted Plaintext'}
              </label>
              {outputText && (
                <div className="select-none flex items-center gap-1.5">
                  <button
                    onClick={handleSwap}
                    title="Swap output text into input and toggle mode"
                    aria-label="Swap output text into input and toggle mode"
                    className="flex items-center gap-1 text-xs font-sans text-amber-300 hover:text-amber-200 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none rounded px-2 py-0.5 bg-[#111520] border border-stone-800 transition-colors"
                  >
                    <ArrowUpDown className="w-3 h-3" />
                    <span>Swap</span>
                  </button>
                  <button
                    onClick={handleCopy}
                    title={
                      copied
                        ? 'Copied to clipboard!'
                        : mode === 'encrypt'
                        ? 'Copy ciphertext result to clipboard'
                        : 'Copy decrypted plaintext to clipboard'
                    }
                    aria-label={
                      copied
                        ? 'Copied to clipboard'
                        : mode === 'encrypt'
                        ? 'Copy ciphertext result to clipboard'
                        : 'Copy decrypted plaintext to clipboard'
                    }
                    className="flex items-center gap-1 text-xs font-sans text-amber-300 hover:text-amber-200 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none rounded px-2 py-0.5 bg-[#111520] border border-stone-800 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
            <div role="status" aria-live="polite" className="sr-only">
              {copied ? `Copied ${mode === 'encrypt' ? 'ciphertext' : 'decrypted plaintext'} to clipboard` : ''}
            </div>
            <div
              id={`output-text-${exhibit.id}`}
              data-testid={`output-text-${exhibit.id}`}
              aria-labelledby={`output-label-${exhibit.id}`}
              aria-live="polite"
              aria-atomic="true"
              className="w-full min-h-[50px] p-3 rounded-lg bg-[#090b10] border border-stone-800 text-amber-300 font-mono text-xs break-all select-all"
            >
              {outputText || <span className="text-stone-400 italic font-sans">Result will appear here...</span>}
            </div>
          </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'cryptanalysis' && isClassical && (
        <div
          id={`wb-tabpanel-cryptanalysis-${exhibit.id}`}
          role="tabpanel"
          aria-labelledby={`wb-tab-cryptanalysis-${exhibit.id}`}
        >
          <FrequencyAnalysisView
            exhibitId={exhibit.id}
            inputText={inputText}
            onApplyShift={(s) => {
              setShift(s);
              setMode('decrypt');
              setActiveTab('workbench');
            }}
            onApplyAffine={(a, b) => {
              setAKey(a);
              setBKey(b);
              setMode('decrypt');
              setActiveTab('workbench');
            }}
            onApplyKey={(k) => {
              if (exhibit.id === 'substitution') setSubstitutionKey(k);
              else setKeyPhrase(k);
              setMode('decrypt');
              setActiveTab('workbench');
            }}
            onLoadSample={(sample) => setInputText(sample)}
          />
        </div>
      )}

      {activeTab === 'inspector' && (
        <div
          id={`wb-tabpanel-inspector-${exhibit.id}`}
          role="tabpanel"
          aria-labelledby={`wb-tab-inspector-${exhibit.id}`}
        >
          <StepInspectorView
            exhibitId={exhibit.id}
            inputText={inputText}
            keyPhrase={keyPhrase}
            shift={shift}
            enigmaRotors={enigmaRotors}
            enigmaPositions={enigmaPositions}
            enigmaReflector={enigmaReflector}
            enigmaPlugboard={enigmaPlugboard}
            dhPrime={dhPrime}
            dhGen={dhGen}
            dhAlice={dhAlice}
            dhBob={dhBob}
          />
        </div>
      )}

      {activeTab === 'attack-lab' && showAttackLab && (
        <div
          id={`wb-tabpanel-attack-lab-${exhibit.id}`}
          role="tabpanel"
          aria-labelledby={`wb-tab-attack-lab-${exhibit.id}`}
        >
          <AttackLabView
            exhibit={exhibit}
            inputText={inputText}
            onApplyShift={(s) => {
              setShift(s);
              setMode('decrypt');
              setActiveTab('workbench');
            }}
            onApplyAffine={(a, b) => {
              setAKey(a);
              setBKey(b);
              setMode('decrypt');
              setActiveTab('workbench');
            }}
            onApplyKey={(k) => {
              setKeyPhrase(k);
              setMode('decrypt');
              setActiveTab('workbench');
            }}
          />
        </div>
      )}

      {activeTab === 'challenge' && (
        <div
          id={`wb-tabpanel-challenge-${exhibit.id}`}
          role="tabpanel"
          aria-labelledby={`wb-tab-challenge-${exhibit.id}`}
        >
          <PassportChallengeView exhibit={exhibit} />
        </div>
      )}
    </div>
  );
}
