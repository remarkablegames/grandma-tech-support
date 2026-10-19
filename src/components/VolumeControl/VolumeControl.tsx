import { type ChangeEvent, useEffect, useRef, useState } from 'react';
import { audio } from 'src/services/audio';

export function VolumeControl() {
  const [open, setOpen] = useState(false);
  const [volume, setVolume] = useState(() => audio.getVolume());
  const [muted, setMuted] = useState(() => audio.isMuted());
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const faderRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    faderRef.current?.focus();

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextVolume = Number(event.target.value);
    audio.setVolume(nextVolume);
    setVolume(nextVolume);
  };

  const handleMuteChange = (event: ChangeEvent<HTMLInputElement>) => {
    audio.setMuted(event.target.checked);
    setMuted(event.target.checked);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={muted ? 'Volume control (muted)' : 'Volume control'}
        onClick={() => {
          setOpen((wasOpen) => !wasOpen);
        }}
        className="win-button flex items-center px-1.5 py-1"
      >
        <img
          src="windows_icons_32x32/sounds.png"
          alt=""
          width={16}
          height={16}
          draggable={false}
          className={`pixelated size-4 ${muted ? 'opacity-40' : ''}`}
        />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Volume Control"
          className="bg-win-face win-outset animate-menu absolute right-0 bottom-full z-50 mb-1 p-2"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-bold text-black">Sounds</span>

            <div className="flex items-center gap-1">
              <input
                id="volume-mute"
                type="checkbox"
                checked={muted}
                onChange={handleMuteChange}
                className="accent-win-navy size-3"
              />
              <label htmlFor="volume-mute" className="text-xs text-black">
                Mute
              </label>
            </div>

            <div className="flex gap-1">
              <div
                aria-hidden="true"
                className="flex h-24 flex-col justify-between text-[9px] leading-none text-black"
              >
                <span>100</span>
                <span>50</span>
                <span>0</span>
              </div>
              <input
                ref={faderRef}
                type="range"
                min={0}
                max={100}
                value={volume}
                aria-label="Sounds volume"
                onChange={handleVolumeChange}
                className="win-fader"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
