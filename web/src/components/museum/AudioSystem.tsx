'use client';

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface AudioSystemProps {
  currentView: string;
  isTourActive?: boolean;
  tourStepIdx?: number;
}

export function AudioSystem({ currentView, isTourActive = false, tourStepIdx = 0 }: AudioSystemProps) {
  const [muted, setMuted] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const reverbGainRef = useRef<GainNode | null>(null);
  const enigmaOscRef = useRef<OscillatorNode | null>(null);
  const enigmaGainRef = useRef<GainNode | null>(null);
  const serverHumRef = useRef<OscillatorNode | null>(null);
  const serverGainRef = useRef<GainNode | null>(null);
  const prevTourStepRef = useRef<number>(tourStepIdx);

  const initAudio = () => {
    if (audioCtxRef.current) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Master ambient reverb / filtered noise generator for museum reverb
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Low pass filter for soft hall resonance
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      reverbGainRef.current = gain;

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      whiteNoise.start();

      // Enigma Rotor Ticking Synth
      const enigmaOsc = ctx.createOscillator();
      enigmaOsc.type = 'sawtooth';
      enigmaOsc.frequency.setValueAtTime(12, ctx.currentTime);
      const enigmaGain = ctx.createGain();
      enigmaGain.gain.setValueAtTime(0, ctx.currentTime);
      enigmaOsc.connect(enigmaGain);
      enigmaGain.connect(ctx.destination);
      enigmaOsc.start();
      enigmaOscRef.current = enigmaOsc;
      enigmaGainRef.current = enigmaGain;

      // Modern Vault Server Hum Synth
      const serverHum = ctx.createOscillator();
      serverHum.type = 'sine';
      serverHum.frequency.setValueAtTime(60, ctx.currentTime);
      const serverGain = ctx.createGain();
      serverGain.gain.setValueAtTime(0, ctx.currentTime);
      serverHum.connect(serverGain);
      serverGain.connect(ctx.destination);
      serverHum.start();
      serverHumRef.current = serverHum;
      serverGainRef.current = serverGain;

    } catch (e) {
      console.warn('AudioContext initialization failed or disabled', e);
    }
  };

  // Modulate subtle spatial ambience based on current museum zone
  useEffect(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const isHistorical = currentView === 'wing-historical' || currentView === 'enigma' || currentView === 'lorenz';
      const isModern =
        currentView === 'wing-modern' ||
        ['rsa', 'aes', 'sha256', 'hmac-hash', 'diffie-hellman'].includes(currentView);

      if (enigmaGainRef.current) {
        enigmaGainRef.current.gain.setTargetAtTime(!muted && isHistorical ? 0.006 : 0, now, 0.25);
      }
      if (serverGainRef.current) {
        serverGainRef.current.gain.setTargetAtTime(!muted && isModern ? 0.008 : 0, now, 0.25);
      }
      if (reverbGainRef.current) {
        reverbGainRef.current.gain.setTargetAtTime(muted ? 0 : 0.02, now, 0.2);
      }
    } catch {
      // Ignore audio automation errors in unsupported environments
    }
  }, [currentView, muted]);

  // Play soft harmonic chime cue when stepping through Guided Tour while unmuted
  useEffect(() => {
    if (!isTourActive) {
      prevTourStepRef.current = tourStepIdx;
      return;
    }
    if (prevTourStepRef.current === tourStepIdx) return;
    prevTourStepRef.current = tourStepIdx;

    const ctx = audioCtxRef.current;
    if (muted || !ctx) return;

    try {
      const now = ctx.currentTime;
      const chimeOsc = ctx.createOscillator();
      const chimeGain = ctx.createGain();
      chimeOsc.type = 'triangle';
      chimeOsc.frequency.setValueAtTime(528, now);
      chimeOsc.frequency.exponentialRampToValueAtTime(660, now + 0.18);

      chimeGain.gain.setValueAtTime(0.0001, now);
      chimeGain.gain.exponentialRampToValueAtTime(0.035, now + 0.03);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(ctx.destination);
      chimeOsc.start(now);
      chimeOsc.stop(now + 0.46);
    } catch {
      // Ignore chime errors
    }
  }, [isTourActive, tourStepIdx, muted]);

  const toggleMute = () => {
    if (!audioCtxRef.current) {
      initAudio();
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    const newMuted = !muted;
    setMuted(newMuted);

    if (reverbGainRef.current && audioCtxRef.current) {
      reverbGainRef.current.gain.setValueAtTime(newMuted ? 0 : 0.02, audioCtxRef.current.currentTime);
    }
  };

  return (
    <button
      onClick={toggleMute}
      aria-label={muted ? 'Unmute spatial audio' : 'Mute spatial audio'}
      aria-pressed={!muted}
      className="select-none fixed bottom-6 right-6 z-50 flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#0c0e14]/90 backdrop-blur-md border border-amber-500/25 text-stone-200 hover:bg-stone-900 transition-colors text-xs font-sans font-medium shadow-lg focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
      title={muted ? 'Unmute Spatial Audio' : 'Mute Spatial Audio'}
    >
      {muted ? <VolumeX className="w-4 h-4 text-stone-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
      <span>{muted ? 'Audio Off' : 'Spatial Audio'}</span>
    </button>
  );
}
