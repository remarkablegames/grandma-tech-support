import type { WindowId, WindowMeta } from 'src/types/game';

interface TaskbarProps {
  windows: WindowMeta[];
  focusedId: WindowId;
  startOpen: boolean;
  onStartToggle: () => void;
  onWindowClick: (windowId: WindowId) => void;
}

export function Taskbar({
  windows,
  focusedId,
  startOpen,
  onStartToggle,
  onWindowClick,
}: TaskbarProps) {
  return (
    <div className="bg-win-face win-outset absolute inset-x-0 bottom-0 z-40 flex h-10 items-center gap-1 px-1">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={startOpen}
        onClick={onStartToggle}
        className="win-button flex shrink-0 items-center gap-1.5 px-2 py-1.5 text-sm font-bold text-black"
      >
        <img
          src="windows_icons_32x32/program.png"
          alt=""
          width={16}
          height={16}
          draggable={false}
          className="pixelated size-4"
        />
        Start
      </button>

      <div className="bg-win-shadow mx-1 h-6 w-px" aria-hidden="true" />

      {windows.map((meta) => (
        <button
          key={meta.id}
          type="button"
          aria-label={`Switch to ${meta.title}`}
          onClick={() => {
            onWindowClick(meta.id);
          }}
          className={`flex max-w-44 min-w-0 flex-1 items-center gap-1.5 px-2 py-1.5 text-xs text-black ${
            focusedId === meta.id ? 'win-inset font-bold' : 'win-button'
          }`}
        >
          <img
            src={meta.icon}
            alt=""
            width={16}
            height={16}
            draggable={false}
            className="pixelated size-4 shrink-0"
          />
          <span className="truncate">{meta.title}</span>
        </button>
      ))}

      <div className="win-inset ml-auto flex shrink-0 items-center gap-1.5 px-2 py-1.5 text-xs text-black">
        <img
          src="windows_icons_32x32/clock.png"
          alt=""
          width={16}
          height={16}
          draggable={false}
          className="pixelated size-4"
        />
        3:47 PM
      </div>
    </div>
  );
}
