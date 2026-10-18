import { JOKES } from 'src/data/gameContent';

interface VirusWindowProps {
  onJoke: (joke: string) => void;
}

export function VirusWindow({ onJoke }: VirusWindowProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 bg-[#4d0000] p-4 text-center text-white">
      <p
        aria-hidden="true"
        className="animate-blink text-2xl font-bold text-[#ff6b6b]"
      >
        ⚠ VIRUS DETECTED ⚠
      </p>

      <p className="text-xs">
        Your computer has 4 viruses (4,000,000 estimated). Act now to avoid
        permanent sadness.
      </p>

      <div className="win-inset bg-win-face h-4 w-56" aria-hidden="true">
        <div className="bg-win-alert h-full w-2/3 animate-pulse" />
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => {
            onJoke(JOKES.cleanNow);
          }}
          className="win-button px-3 py-1.5 text-xs font-bold text-black"
        >
          CLEAN MY COMPUTER NOW!
        </button>
        <button
          type="button"
          onClick={() => {
            onJoke(JOKES.maybeLater);
          }}
          className="win-button px-3 py-1.5 text-xs text-black"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
