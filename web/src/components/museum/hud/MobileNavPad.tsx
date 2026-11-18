'use client';

import React, { useState, useCallback } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Compass } from 'lucide-react';

export type MobileMoveDirection = 'forward' | 'backward' | 'left' | 'right';

interface MobileNavPadProps {
  onMoveChange: (direction: MobileMoveDirection, active: boolean) => void;
  className?: string;
}

const DIRECTION_CONFIG: Array<{
  direction: MobileMoveDirection;
  label: string;
  gridClass: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  { direction: 'forward', label: 'Move forward', gridClass: 'col-start-2 row-start-1', Icon: ArrowUp },
  { direction: 'left', label: 'Strafe left', gridClass: 'col-start-1 row-start-2', Icon: ArrowLeft },
  { direction: 'right', label: 'Strafe right', gridClass: 'col-start-3 row-start-2', Icon: ArrowRight },
  { direction: 'backward', label: 'Move backward', gridClass: 'col-start-2 row-start-3', Icon: ArrowDown },
];

export function MobileNavPad({ onMoveChange, className }: MobileNavPadProps) {
  const [activeDirs, setActiveDirs] = useState<Record<MobileMoveDirection, boolean>>({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  const setDirectionActive = useCallback(
    (direction: MobileMoveDirection, active: boolean) => {
      setActiveDirs((prev) => {
        if (prev[direction] === active) return prev;
        return { ...prev, [direction]: active };
      });
      onMoveChange(direction, active);
    },
    [onMoveChange]
  );

  return (
    <div
      role="group"
      aria-label="Mobile movement controls"
      data-testid="mobile-nav-pad"
      className={
        className ??
        'fixed bottom-32 left-4 z-30 md:hidden pointer-events-auto touch-none select-none'
      }
    >
      <div className="grid grid-cols-3 grid-rows-3 gap-1 p-1.5 rounded-2xl bg-[#161412]/90 backdrop-blur-xl border border-amber-500/30 shadow-2xl">
        {DIRECTION_CONFIG.map(({ direction, label, gridClass, Icon }) => {
          const isActive = activeDirs[direction];
          return (
            <button
              key={direction}
              type="button"
              aria-label={label}
              aria-pressed={isActive}
              data-testid={`mobile-nav-${direction}`}
              onPointerDown={(e) => {
                e.preventDefault();
                setDirectionActive(direction, true);
              }}
              onPointerUp={() => setDirectionActive(direction, false)}
              onPointerLeave={() => setDirectionActive(direction, false)}
              onPointerCancel={() => setDirectionActive(direction, false)}
              onBlur={() => setDirectionActive(direction, false)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  setDirectionActive(direction, true);
                }
              }}
              onKeyUp={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  setDirectionActive(direction, false);
                }
              }}
              className={`${gridClass} w-10 h-10 rounded-xl flex items-center justify-center transition-colors touch-none select-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                isActive
                  ? 'bg-amber-500 text-stone-950 shadow-inner'
                  : 'bg-[#24201c] hover:bg-[#322d27] text-amber-300 border border-amber-500/20'
              }`}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}

        <div
          aria-hidden="true"
          className="col-start-2 row-start-2 w-10 h-10 rounded-xl flex items-center justify-center bg-[#1c1916] border border-stone-800/80 text-amber-400/70"
        >
          <Compass className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
