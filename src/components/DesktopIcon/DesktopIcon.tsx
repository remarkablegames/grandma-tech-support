import { useDoubleClickOpen } from 'src/hooks/useDoubleClickOpen';
import { audio } from 'src/services/audio';
import type { DesktopIconConfig } from 'src/types/game';

interface DesktopIconProps {
  icon: DesktopIconConfig;
  selected: boolean;
  onSelect: (icon: DesktopIconConfig) => void;
  onOpen?: () => void;
  onContextMenu?: (x: number, y: number) => void;
}

export function DesktopIcon({
  icon,
  selected,
  onSelect,
  onOpen,
  onContextMenu,
}: DesktopIconProps) {
  const handleOpen = useDoubleClickOpen(onOpen);

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={(event) => {
        audio.play('click');
        onSelect(icon);
        handleOpen(event);
      }}
      onContextMenu={(event) => {
        // Right-clicking selects the icon, Win95 style, and the desktop
        // decides which menu (if any) opens on top.
        event.preventDefault();
        onSelect(icon);
        onContextMenu?.(event.clientX, event.clientY);
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
