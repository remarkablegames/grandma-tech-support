import type { ReactNode } from 'react';
import { JOKES } from 'src/data/gameContent';
import { audio } from 'src/services/audio';
import type { WindowId, WindowPosition } from 'src/types/game';
import { createWindowDrag } from 'src/utils/createWindowDrag';

interface BrowserWindowProps {
  windowId: WindowId;
  title: string;
  icon: string;
  url: string;
  position: WindowPosition;
  isFront: boolean;
  maximized: boolean;
  zIndex: number;
  onFocus: (windowId: WindowId) => void;
  onMove: (windowId: WindowId, position: WindowPosition) => void;
  onMinimize: (windowId: WindowId) => void;
  onToggleMaximize: (windowId: WindowId) => void;
  onClose: (windowId: WindowId) => void;
  onJoke: (joke: string) => void;
  children: ReactNode;
}

export function BrowserWindow({
  windowId,
  title,
  icon,
  url,
  position,
  isFront,
  maximized,
  zIndex,
  onFocus,
  onMove,
  onMinimize,
  onToggleMaximize,
  onClose,
  onJoke,
  children,
}: BrowserWindowProps) {
  const startDrag = createWindowDrag({
    position,
    enabled: !maximized,
    onMove: (nextPosition) => {
      onMove(windowId, nextPosition);
    },
  });

  return (
    <section
      aria-label={title}
      className={`bg-win-face win-outset absolute flex flex-col p-[3px] ${
        maximized ? 'inset-x-0 top-0 bottom-10' : 'w-[min(92vw,440px)]'
      }`}
      style={
        maximized ? { zIndex } : { left: position.x, top: position.y, zIndex }
      }
      onPointerDown={() => {
        audio.play('click');
        onFocus(windowId);
      }}
    >
      <div
        className={`flex touch-none items-center gap-1 px-1 py-1 ${isFront ? 'win-titlebar' : 'win-titlebar-inactive'}`}
        onPointerDown={startDrag}
      >
        <button
          type="button"
          onClick={() => {
            onFocus(windowId);
          }}
          className="flex min-w-0 flex-1 items-center gap-1.5 text-left text-xs font-bold text-white"
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

        <div className="flex shrink-0 items-center gap-px">
          <button
            type="button"
            aria-label={`Minimize ${title}`}
            onClick={() => {
              onMinimize(windowId);
            }}
            className="win-button h-4 w-5 text-[8px] leading-none"
          >
            –
          </button>
          <button
            type="button"
            aria-label={maximized ? `Restore ${title}` : `Maximize ${title}`}
            onClick={() => {
              onToggleMaximize(windowId);
            }}
            className="win-button h-4 w-5 text-[8px] leading-none"
          >
            {maximized ? '▣' : '□'}
          </button>
          <button
            type="button"
            aria-label={`Close ${title}`}
            onClick={() => {
              onClose(windowId);
            }}
            className="win-button h-4 w-5 text-[9px] leading-none"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 px-1 py-1">
        <button
          type="button"
          aria-label={`Back in ${title}`}
          onClick={() => {
            onJoke(JOKES.goBack);
          }}
          className="win-button px-1.5 py-0.5 text-[10px] leading-none"
        >
          ◀
        </button>
        <button
          type="button"
          aria-label={`Forward in ${title}`}
          onClick={() => {
            onJoke(JOKES.goForward);
          }}
          className="win-button px-1.5 py-0.5 text-[10px] leading-none"
        >
          ▶
        </button>
        <div className="win-inset min-w-0 flex-1 truncate bg-white px-1.5 py-0.5 font-mono text-[10px] text-black">
          {url}
        </div>
      </div>

      <div
        className={`relative overflow-hidden bg-white ${
          maximized ? 'flex-1' : 'h-[280px]'
        }`}
      >
        {children}
      </div>
    </section>
  );
}
