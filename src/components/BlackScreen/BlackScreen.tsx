import { useEffect } from 'react';
import { POWER_MESSAGES } from 'src/data/gameContent';
import type { BlackScreenMode } from 'src/types/game';

// The boot line holds for a beat like a real POST, then returns on its own;
// the safe-off line waits for the player, the way 1996 did.
const BOOT_RETURN_MS = 1000;

interface BlackScreenProps {
  mode: BlackScreenMode;
  onReturn: () => void;
}

// The whole desktop replaced by one line of text — itself a real button, so
// a click, Enter, or Space all bring the player back. Both lines wear the
// system monospace stack like VGA text mode: white for the DOS-style boot
// line, amber for Win95's famous safe-off toast.
export function BlackScreen({ mode, onReturn }: BlackScreenProps) {
  useEffect(() => {
    if (mode !== 'boot') {
      return;
    }

    const timer = setTimeout(() => {
      onReturn();
    }, BOOT_RETURN_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [mode, onReturn]);

  return (
    <button
      type="button"
      autoFocus
      onClick={onReturn}
      className="absolute inset-0 z-[60] flex items-center justify-center bg-black p-4 text-center"
    >
      <span
        className={`font-mono text-xl font-bold ${mode === 'boot' ? 'text-white' : 'text-[#ffa500]'}`}
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
