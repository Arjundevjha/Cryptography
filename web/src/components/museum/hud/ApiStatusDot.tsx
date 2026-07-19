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

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-950/80 border border-stone-800 text-xs font-mono">
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
      <span className="text-stone-300 text-[11px]">
        {online === true ? 'FASTAPI ONLINE' : online === false ? 'FASTAPI OFFLINE' : 'CHECKING API...'}
      </span>
    </div>
  );
}
