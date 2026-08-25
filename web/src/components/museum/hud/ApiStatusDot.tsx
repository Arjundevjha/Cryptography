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

  const statusMessage =
    online === true
      ? 'Cryptographic Server: Online'
      : online === false
      ? 'Cryptographic Server: Offline'
      : 'Cryptographic Server: Connecting...';

  return (
    <div
      tabIndex={0}
      role="status"
      aria-live="polite"
      className="flex items-center justify-center p-2 rounded-full bg-stone-950/80 backdrop-blur-md border border-stone-800 shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
      title={statusMessage}
    >
      <span
        data-testid="api-status-dot"
        className={`w-2.5 h-2.5 rounded-full transition-all ${
          online === true
            ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
            : online === false
            ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
            : 'bg-amber-500 animate-pulse'
        }`}
      />
      <span className="sr-only">{statusMessage}</span>
    </div>
  );
}
