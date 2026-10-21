import { useState } from 'react';
import { audio } from 'src/services/audio';
import type { ShutdownMode } from 'src/types/game';

// Win95's power prompt: the lead-in and both radio questions verbatim short
// phrases, no trade dress — grandma's protest lives in her bubble instead.
interface ShutdownDialogProps {
  onConfirm: (mode: ShutdownMode) => void;
  onCancel: () => void;
}

export function ShutdownDialog({ onConfirm, onCancel }: ShutdownDialogProps) {
  const [mode, setMode] = useState<ShutdownMode>('shutdown');

  // No dimmed backdrop: Win95 leaves the desktop visible behind the dialog.
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Shut Down"
        className="animate-dialog bg-win-face win-outset w-full max-w-sm p-[3px]"
      >
        <div className="win-titlebar px-2 py-1 text-xs font-bold text-white">
          Shut Down
        </div>

        <div className="px-4 pt-4">
          <fieldset className="m-0 border-0 p-0">
            <legend className="p-0 text-sm text-black">
              Are you sure you want to:
            </legend>
            <label className="mt-2 flex items-center gap-2 text-sm text-black">
              <input
                type="radio"
                name="shutdown-mode"
                value="shutdown"
                checked={mode === 'shutdown'}
                onChange={() => {
                  setMode('shutdown');
                }}
                className="accent-win-navy size-3.5"
              />
              Shut down the computer?
            </label>
            <label className="mt-2 flex items-center gap-2 text-sm text-black">
              <input
                type="radio"
                name="shutdown-mode"
                value="restart"
                checked={mode === 'restart'}
                onChange={() => {
                  setMode('restart');
                }}
                className="accent-win-navy size-3.5"
              />
              Restart the computer?
            </label>
          </fieldset>
        </div>

        <div className="flex justify-end gap-2 px-4 pt-4 pb-4">
          <button
            type="button"
            autoFocus
            onClick={() => {
              audio.play('click');
              onConfirm(mode);
            }}
            className="win-button min-w-20 px-4 py-1.5 text-sm font-bold text-black"
          >
            OK
          </button>
          <button
            type="button"
            onClick={() => {
              audio.play('click');
              onCancel();
            }}
            className="win-button min-w-20 px-4 py-1.5 text-sm font-bold text-black"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
