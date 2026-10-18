interface GrandmaSpeechProps {
  line: string;
}

export function GrandmaSpeech({ line }: GrandmaSpeechProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none absolute bottom-12 left-2 z-40 flex max-w-[min(92vw,26rem)] items-start gap-2"
    >
      <span aria-hidden="true" className="text-3xl">
        👵
      </span>
      <p className="win-outset bg-win-face max-w-full px-3 py-2 text-sm leading-snug text-black">
        {line}
      </p>
    </div>
  );
}
