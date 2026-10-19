import { useCurrentTime } from 'src/hooks/useCurrentTime';
import { audio } from 'src/services/audio';
import type {
  IconTaskbarItem,
  IconWindowId,
  WindowId,
  WindowMeta,
} from 'src/types/game';

import { VolumeControl } from '../VolumeControl';

interface TaskbarButtonProps {
  icon: string;
  title: string;
  focused: boolean;
  onClick: () => void;
}

function TaskbarButton({ icon, title, focused, onClick }: TaskbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={`Switch to ${title}`}
      onClick={() => {
        audio.play('click');
        onClick();
      }}
      className={`flex max-w-44 min-w-0 flex-1 items-center gap-1.5 px-2 py-1.5 text-xs text-black ${
        focused ? 'win-inset font-bold' : 'win-button'
      }`}
    >
      <img
        src={icon}
        alt=""
        width={16}
        height={16}
        draggable={false}
        className="pixelated size-4 shrink-0"
      />
      <span className="truncate">{title}</span>
    </button>
  );
}

interface TaskbarProps {
  windows: WindowMeta[];
  iconWindows: IconTaskbarItem[];
  focusedId: WindowId | undefined;
  focusedIconId: IconWindowId | undefined;
  startOpen: boolean;
  onStartToggle: () => void;
  onWindowClick: (windowId: WindowId) => void;
  onIconWindowClick: (windowId: IconWindowId) => void;
}

export function Taskbar({
  windows,
  iconWindows,
  focusedId,
  focusedIconId,
  startOpen,
  onStartToggle,
  onWindowClick,
  onIconWindowClick,
}: TaskbarProps) {
  const time = useCurrentTime();

  return (
    <div className="bg-win-face win-outset absolute inset-x-0 bottom-0 z-40 flex h-10 items-center gap-1 px-1">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={startOpen}
        onClick={() => {
          audio.play('click');
          onStartToggle();
        }}
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
        <TaskbarButton
          key={meta.id}
          icon={meta.icon}
          title={meta.title}
          focused={focusedId === meta.id}
          onClick={() => {
            onWindowClick(meta.id);
          }}
        />
      ))}

      {iconWindows.map((item) => (
        <TaskbarButton
          key={item.id}
          icon={item.icon}
          title={item.title}
          focused={focusedIconId === item.id}
          onClick={() => {
            onIconWindowClick(item.id);
          }}
        />
      ))}

      <div className="win-inset ml-auto flex shrink-0 items-center gap-1.5 px-1.5 py-1 text-xs text-black">
        <VolumeControl />
        <img
          src="windows_icons_32x32/clock.png"
          alt=""
          width={16}
          height={16}
          draggable={false}
          className="pixelated size-4"
        />
        {time}
      </div>
    </div>
  );
}
