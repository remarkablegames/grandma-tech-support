import { useEffect } from 'react';
import { audio } from 'src/services/audio';

interface WinScreenProps {
  title: string;
  message: string;
  icon: string;
  buttonLabel: string;
  onConfirm: () => void;
}

export function WinScreen({
  title,
  message,
  icon,
  buttonLabel,
  onConfirm,
}: WinScreenProps) {
  useEffect(() => {
    audio.play('win');
  }, []);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="animate-dialog bg-win-face win-outset w-full max-w-md p-[3px]"
      >
        <div className="win-titlebar px-2 py-1 text-xs font-bold text-white">
          {title}
        </div>

        <div className="flex flex-col items-center gap-4 p-6 text-center">
          <img
            src={icon}
            alt=""
            width={32}
            height={32}
            draggable={false}
            className="pixelated size-12"
          />
          <p className="text-sm leading-snug text-black">{message}</p>
          <button
            type="button"
            onClick={() => {
              audio.play('click');
              onConfirm();
            }}
            className="win-button px-5 py-2 text-sm font-bold text-black"
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
