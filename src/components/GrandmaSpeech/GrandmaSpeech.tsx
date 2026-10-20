interface GrandmaSpeechProps {
  line: string;
  onRepeat: () => void;
}

export function GrandmaSpeech({ line, onRepeat }: GrandmaSpeechProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none absolute right-2 bottom-12 z-40 flex max-w-[min(92vw,26rem)] flex-row-reverse items-start gap-2"
    >
      <span
        key={`emoji-${line}`}
        aria-hidden="true"
        className="animate-wiggle text-3xl"
      >
        👵
      </span>
      <button
        key={`bubble-${line}`}
        type="button"
        onClick={onRepeat}
        className="animate-dialog win-outset bg-win-face pointer-events-auto max-w-full cursor-pointer px-3 py-2 text-left text-sm leading-snug text-black"
      >
        {line}
        <span className="sr-only">(click grandma to hear it again)</span>
      </button>
    </div>
  );
}
