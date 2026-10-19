import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import { JOKES } from 'src/data/gameContent';
import { audio } from 'src/services/audio';
import type { WindowId, WindowPosition } from 'src/types/game';

const DRAG_VISIBLE_WIDTH = 150;
const DRAG_VISIBLE_HEIGHT = 60;

interface BrowserWindowProps {
  windowId: WindowId;
  title: string;
  icon: string;
  url: string;
  position: WindowPosition;
  isFront: boolean;
  zIndex: number;
  onFocus: (windowId: WindowId) => void;
  onMove: (windowId: WindowId, position: WindowPosition) => void;
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
  zIndex,
  onFocus,
  onMove,
  onJoke,
  children,
}: BrowserWindowProps) {
  const handleTitlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const originX = event.clientX - position.x;
    const originY = event.clientY - position.y;

    const handleMove = (moveEvent: PointerEvent) => {
      const x = Math.min(
        Math.max(moveEvent.clientX - originX, 0),
        Math.max(window.innerWidth - DRAG_VISIBLE_WIDTH, 0),
      );
      const y = Math.min(
        Math.max(moveEvent.clientY - originY, 0),
        Math.max(window.innerHeight - DRAG_VISIBLE_HEIGHT, 0),
      );
      onMove(windowId, { x, y });
    };

    const handleEnd = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleEnd);
      window.removeEventListener('pointercancel', handleEnd);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleEnd);
    window.addEventListener('pointercancel', handleEnd);
  };

  return (
    <section
      aria-label={title}
      className="bg-win-face win-outset absolute w-[min(92vw,440px)] p-[3px]"
      style={{ left: position.x, top: position.y, zIndex }}
      onPointerDown={() => {
        audio.play('click');
        onFocus(windowId);
      }}
    >
      <div
        className={`flex touch-none items-center gap-1 px-1 py-1 ${isFront ? 'win-titlebar' : 'win-titlebar-inactive'}`}
        onPointerDown={handleTitlePointerDown}
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
              onJoke(JOKES.minimize);
            }}
            className="win-button h-4 w-5 text-[8px] leading-none"
          >
            –
          </button>
          <button
            type="button"
            aria-label={`Maximize ${title}`}
            onClick={() => {
              onJoke(JOKES.maximize);
            }}
            className="win-button h-4 w-5 text-[8px] leading-none"
          >
            □
          </button>
          <button
            type="button"
            aria-label={`Close ${title}`}
            onClick={() => {
              onJoke(JOKES.windowClose);
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

      <div className="relative h-[280px] overflow-hidden bg-white">
        {children}
      </div>
    </section>
  );
}
