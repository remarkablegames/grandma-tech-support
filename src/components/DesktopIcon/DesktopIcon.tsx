import type { PointerEvent as ReactPointerEvent } from 'react';
import { useRef, useState } from 'react';
import { useDoubleClickOpen } from 'src/hooks/useDoubleClickOpen';
import { audio } from 'src/services/audio';
import type { DesktopIconConfig, IconCell } from 'src/types/game';
import { ICON_GRID, snapIconCell } from 'src/utils/snapIconCell';

// Win95's SM_CXDRAG: four pixels of intent before a press becomes a drag,
// so clicks and double-clicks on the icons stay rock solid.
const DRAG_THRESHOLD = 4;

interface DesktopIconProps {
  icon: DesktopIconConfig;
  position: IconCell;
  selected: boolean;
  onSelect: (icon: DesktopIconConfig) => void;
  onMove: (cell: IconCell) => void;
  onOpen?: () => void;
  onContextMenu?: (x: number, y: number) => void;
}

export function DesktopIcon({
  icon,
  position,
  selected,
  onSelect,
  onMove,
  onOpen,
  onContextMenu,
}: DesktopIconProps) {
  const handleOpen = useDoubleClickOpen(onOpen);
  const [drag, setDrag] = useState<{ dx: number; dy: number } | null>(null);
  // A drop ends with a click the browser still fires; that tail must not
  // count as a fresh press toward the next double-click open.
  const droppedRef = useRef(false);

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    // Only the left button drags, Win95 style: right-press opens the menu.
    if (event.button !== 0) {
      return;
    }

    droppedRef.current = false;

    // Win95 highlights the icon on mouse-down, so the label is already
    // blue by the time the drag starts.
    onSelect(icon);

    const originX = event.clientX;
    const originY = event.clientY;
    let started = false;
    let dx = 0;
    let dy = 0;

    function handleMove(moveEvent: PointerEvent) {
      dx = moveEvent.clientX - originX;
      dy = moveEvent.clientY - originY;

      if (started) {
        setDrag({ dx, dy });
        return;
      }

      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) {
        return;
      }

      started = true;
      setDrag({ dx, dy });
    }

    function detach() {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleCancel);
    }

    function handleUp() {
      detach();

      if (!started) {
        return;
      }

      droppedRef.current = true;
      setDrag(null);
      // A dragged icon ends up selected, Win95 style, and lands on the
      // nearest free cell of the desktop grid.
      onSelect(icon);
      onMove(
        snapIconCell(position, dx, dy, {
          width: window.innerWidth,
          height: window.innerHeight,
        }),
      );
    }

    function handleCancel() {
      detach();
      setDrag(null);
    }

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleCancel);
  };

  return (
    <button
      type="button"
      aria-pressed={selected}
      onPointerDown={handlePointerDown}
      onClick={(event) => {
        // The tail of a drop: the icon is already selected and placed.
        // Keyboard activation (detail === 0) is never a drop's tail.
        if (droppedRef.current && event.detail > 0) {
          droppedRef.current = false;
          return;
        }

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
      style={{
        left: ICON_GRID.origin + position.col * ICON_GRID.width,
        top: ICON_GRID.origin + position.row * ICON_GRID.height,
        transform:
          drag === null
            ? undefined
            : `translate(${String(drag.dx)}px, ${String(drag.dy)}px)`,
      }}
      className={`pointer-events-auto absolute flex w-20 touch-none flex-col items-center gap-1 p-1 ${
        drag === null ? '' : 'z-10'
      }`}
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
