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
      className="select-none flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0c0e14]/90 backdrop-blur-md border border-stone-800 shadow-lg text-xs font-sans text-stone-300 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none transition-colors cursor-help"
      title={statusText}
    >
      <span
        data-testid="api-status-dot"
        className={`w-2 h-2 rounded-full shrink-0 transition-colors ${
          online === true
            ? 'bg-emerald-400'
            : online === false
            ? 'bg-rose-400'
            : 'bg-amber-400'
        }`}
      />
      <span className="sr-only sm:not-sr-only text-[11px] text-stone-300 font-medium">
        {online === true ? 'Cipher Service · Online' : online === false ? 'Cipher Service · Offline' : 'Connecting…'}
      </span>
    </div>
  );
}
