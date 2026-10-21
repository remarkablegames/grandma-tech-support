import { UPDATE_MESSAGES } from 'src/data/gameContent';
import { audio } from 'src/services/audio';
import type { UpdateStage } from 'src/types/game';

interface UpdateDialogProps {
  stage: UpdateStage;
  onAdvance: () => void;
  onLater: () => void;
  onRestart: () => void;
}

// Windows Update asking for the moon: a progress bar frozen at 99%, the
// rollback that restores nothing, then the restart plea. Only the buttons
// move it along — there is no timer to wait out.
export function UpdateDialog({
  stage,
  onAdvance,
  onLater,
  onRestart,
}: UpdateDialogProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Windows Update"
        className="animate-dialog bg-win-face win-outset w-full max-w-sm p-[3px]"
      >
        <div className="win-titlebar px-2 py-1 text-xs font-bold text-white">
          Windows Update
        </div>

        <div className="flex items-start gap-3 p-4">
          <img
            src="windows_icons_32x32/tools.png"
            alt=""
            width={32}
            height={32}
            draggable={false}
            className="pixelated size-8 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm leading-snug text-black">
              {UPDATE_MESSAGES[stage]}
            </p>
            {stage === 'installing' && (
              <div
                role="progressbar"
                aria-label="Update progress"
                aria-valuenow={99}
                aria-valuemin={0}
                aria-valuemax={100}
                className="win-inset mt-3 h-4 bg-white p-[2px]"
              >
                <div
                  className="h-full"
                  style={{
                    width: '99%',
                    backgroundImage:
                      'repeating-linear-gradient(90deg, var(--color-win-navy) 0 6px, transparent 6px 8px)',
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center gap-2 pb-4">
          {stage === 'failed' ? (
            <>
              <button
                type="button"
                autoFocus
                onClick={() => {
                  audio.play('click');
                  onLater();
                }}
                className="win-button min-w-24 px-4 py-1.5 text-sm font-bold text-black"
              >
                Later
              </button>
              <button
                type="button"
                onClick={() => {
                  audio.play('click');
                  onRestart();
                }}
                className="win-button min-w-24 px-4 py-1.5 text-sm font-bold text-black"
              >
                Restart now
              </button>
            </>
          ) : (
            <button
              type="button"
              autoFocus
              onClick={() => {
                audio.play('click');
                onAdvance();
              }}
              className="win-button min-w-24 px-4 py-1.5 text-sm font-bold text-black"
            >
              {stage === 'installing' ? 'Cancel' : 'OK'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
