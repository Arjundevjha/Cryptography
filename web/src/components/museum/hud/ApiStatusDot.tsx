'use client';

import { useState, useEffect } from 'react';

export function ApiStatusDot() {
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          setOnline(true);
        } else {
          setOnline(false);
        }
      } catch {
        setOnline(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const statusText =
    online === true
      ? 'Cryptographic Server: Online'
      : online === false
      ? 'Cryptographic Server: Offline'
      : 'Cryptographic Server: Connecting...';

  return (
    <div
      tabIndex={0}
      role="status"
      aria-label={statusText}
      className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-stone-950/80 backdrop-blur-md border border-stone-800 shadow-lg text-[11px] font-mono text-stone-300 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none transition-all cursor-help"
      title={statusText}
    >
      <span
        data-testid="api-status-dot"
        className={`w-2.5 h-2.5 rounded-full shrink-0 transition-all ${
          online === true
            ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
            : online === false
            ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
            : 'bg-amber-500 animate-pulse'
        }`}
      />
      <span className="sr-only sm:not-sr-only text-[10px] uppercase tracking-wider text-stone-400 font-bold">
        {online === true ? 'API ONLINE' : online === false ? 'API OFFLINE' : 'CONNECTING...'}
      </span>
    </div>
  );
}
