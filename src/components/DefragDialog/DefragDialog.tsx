import { useEffect, useState } from 'react';
import { audio } from 'src/services/audio';

interface DefragDialogProps {
  onStopped: () => void;
  onExit: (finished: boolean) => void;
}

// One percent per tick: the run takes about ten seconds of watching blocks
// settle, a compression of the evenings the real thing used to claim.
const TICK_MS = 100;
const BLOCK_COUNT = 60;

// Win95's Disk Defragmenter: a field of little blocks consolidating left to
// right while the percentage climbs. Stop freezes the run where it stands
// (with a grandma joke behind the dialog); Exit closes it, finishing the
// disk-full task only once the drive is actually tidy.
export function DefragDialog({ onStopped, onExit }: DefragDialogProps) {
  const [percent, setPercent] = useState(0);
  const [stopped, setStopped] = useState(false);

  useEffect(() => {
    if (stopped) {
      return;
    }

    const timer = window.setInterval(() => {
      setPercent((current) => (current >= 100 ? current : current + 1));
    }, TICK_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [stopped]);

  const packed = Math.round((percent * BLOCK_COUNT) / 100);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Disk Defragmenter"
        className="animate-dialog bg-win-face win-outset w-full max-w-sm p-[3px]"
      >
        <div className="win-titlebar px-2 py-1 text-xs font-bold text-white">
          Disk Defragmenter
        </div>

        <div className="flex items-start gap-3 p-4">
          <img
            src="windows_icons_32x32/3d_graphics_program.png"
            alt=""
            width={32}
            height={32}
            draggable={false}
            className="pixelated size-8 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm leading-snug text-black">
              {stopped
                ? `Stopped at ${String(percent)}% complete.`
                : `Consolidating free space on Drive C: ... ${String(percent)}% complete`}
            </p>
            <div
              role="progressbar"
              aria-label="Defragment progress"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              className="win-inset mt-3 grid grid-cols-12 gap-[2px] bg-white p-[2px]"
            >
              {Array.from({ length: BLOCK_COUNT }, (_, index) => (
                <span
                  key={index}
                  className={`h-2.5 ${
                    index < packed
                      ? 'bg-win-navy'
                      : index % 2 === 0
                        ? 'bg-white'
                        : 'bg-win-shadow'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-2 pb-4">
          <button
            type="button"
            disabled={stopped}
            onClick={() => {
              audio.play('click');
              setStopped(true);
              onStopped();
            }}
            className="win-button min-w-24 px-4 py-1.5 text-sm font-bold text-black"
          >
            Stop
          </button>
          <button
            type="button"
            autoFocus
            onClick={() => {
              audio.play('click');
              onExit(percent >= 100);
            }}
            className="win-button min-w-24 px-4 py-1.5 text-sm font-bold text-black"
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}
