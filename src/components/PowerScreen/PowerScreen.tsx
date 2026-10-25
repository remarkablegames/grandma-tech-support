import { useEffect } from 'react';
import clouds from 'src/assets/clouds.jpg';
import { POWER_MESSAGES } from 'src/data/gameContent';
import type { PowerScreenMode } from 'src/types/game';

// Each power beat holds like the real machine: the boot line for a
// POST-length pause, the clouds splash a touch longer; the safe-off line
// waits for the player, the way 1996 did. All of them yield to a click,
// Enter, or Space.
const HOLD_MS: Record<'boot' | 'splash', number> = {
  boot: 1000,
  splash: 1500,
};

interface PowerScreenProps {
  mode: PowerScreenMode;
  onLeave: () => void;
}

export function PowerScreen({ mode, onLeave }: PowerScreenProps) {
  const holdMs = mode === 'safe' ? undefined : HOLD_MS[mode];

  useEffect(() => {
    if (holdMs === undefined) {
      return;
    }

    const timer = setTimeout(() => {
      onLeave();
    }, holdMs);

    return () => {
      clearTimeout(timer);
    };
  }, [holdMs, onLeave]);

  if (mode === 'splash') {
    return (
      <button
        type="button"
        autoFocus
        onClick={onLeave}
        style={{ backgroundImage: `url(${clouds})` }}
        className="absolute inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-cover bg-center text-center"
      >
        <img
          src="logo.svg"
          alt=""
          width={128}
          height={128}
          draggable={false}
          className="pixelated size-32"
        />
        <span className="font-w95fa text-5xl font-bold text-black drop-shadow-md">
          Rainbow<span className="font-light text-white">59</span>
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      autoFocus
      onClick={onLeave}
      className="absolute inset-0 z-[60] flex items-center justify-center bg-black p-4 text-center"
    >
      <span
        className={`font-w95fa text-2xl font-bold ${mode === 'boot' ? 'text-white' : 'text-[#ffa500]'}`}
      >
        {POWER_MESSAGES[mode]}
        {mode === 'boot' && (
          <span aria-hidden="true" className="animate-blink">
            _
          </span>
        )}
      </span>
    </button>
  );
}
