import { useEffect } from 'react';
import { JOKES } from 'src/data/gameContent';
import { audio } from 'src/services/audio';

interface VirusWindowProps {
  onJoke: (joke: string) => void;
}

export function VirusWindow({ onJoke }: VirusWindowProps) {
  useEffect(() => {
    audio.play('error');
  }, []);

  return (
    <div
      role="region"
      aria-label="URGENT: VIRUS DETECTED"
      tabIndex={0}
      className="flex h-full flex-col overflow-y-auto bg-[#4d0000] p-4 text-white"
    >
      {/* m-auto centers the scare and still lets it scroll when it overflows. */}
      <div className="m-auto flex w-full flex-col items-center gap-3 text-center">
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

        <p className="text-xs font-bold">Threat level: extremely toasty.</p>

        <div className="win-inset bg-win-face h-4 w-56" aria-hidden="true">
          <div className="bg-win-alert h-full w-2/3 animate-pulse" />
        </div>

        <div aria-hidden="true" className="text-[10px] text-[#ff9c9c]">
          <p>scanning C:\... toaster found</p>
          <p>scanning D:\... 1 song found</p>
          <p>scanning A:\... nothing was ever on the floppy</p>
        </div>

        <p className="text-[10px]">
          🛡 Certified by the Bureau of Very Serious Warnings
        </p>

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

        <p className="text-[10px] opacity-75">
          This warning was paid for by toasters.
        </p>
      </div>
    </div>
  );
}
