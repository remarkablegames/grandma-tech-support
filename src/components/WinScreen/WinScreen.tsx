import { GRANDMA_LINES } from 'src/data/gameContent';

interface WinScreenProps {
  onPlayAgain: () => void;
}

export function WinScreen({ onPlayAgain }: WinScreenProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="You found your email"
        className="animate-dialog bg-win-face win-outset w-full max-w-md p-[3px]"
      >
        <div className="win-titlebar px-2 py-1 text-xs font-bold text-white">
          You found your email
        </div>

        <div className="flex flex-col items-center gap-4 p-6 text-center">
          <img
            src="/windows_icons_32x32/mail.png"
            alt=""
            width={32}
            height={32}
            draggable={false}
            className="pixelated size-12"
          />
          <p className="text-sm leading-snug text-black">{GRANDMA_LINES.win}</p>
          <button
            type="button"
            onClick={onPlayAgain}
            className="win-button px-5 py-2 text-sm font-bold text-black"
          >
            Play again
          </button>
        </div>
      </div>
    </div>
  );
}
