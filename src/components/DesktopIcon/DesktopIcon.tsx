import { useRef } from 'react';
import { audio } from 'src/services/audio';
import type { DesktopIconConfig } from 'src/types/game';

const DOUBLE_CLICK_MS = 400;

interface DesktopIconProps {
  icon: DesktopIconConfig;
  selected: boolean;
  onSelect: (icon: DesktopIconConfig) => void;
  onOpen?: () => void;
}

export function DesktopIcon({
  icon,
  selected,
  onSelect,
  onOpen,
}: DesktopIconProps) {
  const lastClickRef = useRef(0);

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={(event) => {
        audio.play('click');
        onSelect(icon);

        // Open like Windows: keyboard Enter right away, a quick second
        // click (or tap) otherwise. detail === 0 marks keyboard clicks.
        const now = Date.now();
        if (
          onOpen !== undefined &&
          (event.detail === 0 || now - lastClickRef.current <= DOUBLE_CLICK_MS)
        ) {
          onOpen();
        }
        lastClickRef.current = now;
      }}
      className="flex w-20 flex-col items-center gap-1 p-1"
    >
      <img
        src={icon.icon}
        alt=""
        width={32}
        height={32}
        draggable={false}
        className="pixelated size-8"
      />
      <span
        className={`px-1 text-center text-[11px] leading-tight text-white [text-shadow:1px_1px_0_#000] ${
          selected ? 'bg-win-navy' : ''
        }`}
      >
        {icon.label}
      </span>
    </button>
  );
}
