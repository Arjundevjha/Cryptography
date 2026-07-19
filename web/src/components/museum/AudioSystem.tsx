'use client';

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface AudioSystemProps {
  currentView: string;
}

export function AudioSystem({ currentView }: AudioSystemProps) {
  const [muted, setMuted] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const reverbGainRef = useRef<GainNode | null>(null);
  const enigmaOscRef = useRef<OscillatorNode | null>(null);
  const serverHumRef = useRef<OscillatorNode | null>(null);

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

    } catch (e) {
      console.warn('AudioContext initialization failed or disabled', e);
    }
  };

  const toggleMute = () => {
    if (!audioCtxRef.current) {
      initAudio();
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    if (reverbGainRef.current && audioCtxRef.current) {
      const newMuted = !muted;
      setMuted(newMuted);
      reverbGainRef.current.gain.setValueAtTime(newMuted ? 0 : 0.02, audioCtxRef.current.currentTime);
    }
  };

  return (
    <button
      onClick={toggleMute}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-3 py-2 rounded-full bg-stone-900/80 backdrop-blur-md border border-amber-500/30 text-amber-200 hover:bg-stone-800 transition-all text-xs font-mono shadow-lg"
      title={muted ? 'Unmute Spatial Audio' : 'Mute Spatial Audio'}
    >
      {muted ? <VolumeX className="w-4 h-4 text-amber-400/60" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
      <span>{muted ? 'AUDIO OFF' : 'SPATIAL AUDIO'}</span>
    </button>
  );
}
