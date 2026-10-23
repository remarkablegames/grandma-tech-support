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
  frozen: boolean;
  zIndex: number;
  onFocus: (windowId: WindowId) => void;
  onMove: (windowId: WindowId, position: WindowPosition) => void;
  onMinimize: (windowId: WindowId) => void;
  onToggleMaximize: (windowId: WindowId) => void;
  onClose: (windowId: WindowId) => void;
  onJoke: (joke: string) => void;
  onFrozenClick: () => void;
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
  frozen,
  zIndex,
  onFocus,
  onMove,
  onMinimize,
  onToggleMaximize,
  onClose,
  onJoke,
  onFrozenClick,
  children,
}: BrowserWindowProps) {
  // A frozen window labels itself the way later Windows do — the one place
  // this game knowingly borrows from after-Win95, for readability.
  const displayTitle = frozen ? `${title} (Not responding)` : title;

  const startDrag = createWindowDrag({
    position,
    enabled: !maximized && !frozen,
    onMove: (nextPosition) => {
      onMove(windowId, nextPosition);
    },
  });

  return (
    <section
      aria-label={displayTitle}
      className={`bg-win-face win-outset absolute flex flex-col p-[3px] ${
        maximized ? 'inset-x-0 top-0 bottom-10' : 'w-[min(92vw,440px)]'
      } ${frozen ? 'cursor-wait' : ''}`}
      style={
        maximized ? { zIndex } : { left: position.x, top: position.y, zIndex }
      }
      onPointerDown={(event) => {
        // Only the left button ticks, Win95 style.
        if (event.button === 0) {
          audio.play('click');
        }

        if (frozen) {
          onFrozenClick();
          return;
        }

        onFocus(windowId);
      }}
    >
      <div
        className={`flex touch-none items-center gap-1 px-1 py-1 ${
          isFront && !frozen ? 'win-titlebar' : 'win-titlebar-inactive'
        }`}
        onPointerDown={startDrag}
      >
        <button
          type="button"
          onClick={
            frozen
              ? undefined
              : () => {
                  onFocus(windowId);
                }
          }
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
          <span className="truncate">{displayTitle}</span>
        </button>

        <div className="flex shrink-0 items-center gap-px">
          <button
            type="button"
            aria-label={`Minimize ${displayTitle}`}
            onClick={
              frozen
                ? undefined
                : () => {
                    onMinimize(windowId);
                  }
            }
            className="win-button h-4 w-5 text-[8px] leading-none"
          >
            –
          </button>
          <button
            type="button"
            aria-label={
              maximized ? `Restore ${displayTitle}` : `Maximize ${displayTitle}`
            }
            onClick={
              frozen
                ? undefined
                : () => {
                    onToggleMaximize(windowId);
                  }
            }
            className="win-button h-4 w-5 text-[8px] leading-none"
          >
            {maximized ? '▣' : '□'}
          </button>
          <button
            type="button"
            aria-label={`Close ${displayTitle}`}
            onClick={
              frozen
                ? undefined
                : () => {
                    onClose(windowId);
                  }
            }
            className="win-button h-4 w-5 text-[9px] leading-none"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 px-1 py-1">
        <button
          type="button"
          aria-label={`Back in ${displayTitle}`}
          onClick={
            frozen
              ? undefined
              : () => {
                  onJoke(JOKES.goBack);
                }
          }
          className="win-button px-1.5 py-0.5 text-[10px] leading-none"
        >
          ◀
        </button>
        <button
          type="button"
          aria-label={`Forward in ${displayTitle}`}
          onClick={
            frozen
              ? undefined
              : () => {
                  onJoke(JOKES.goForward);
                }
          }
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
