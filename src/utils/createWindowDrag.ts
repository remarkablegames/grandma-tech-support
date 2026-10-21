import type { PointerEvent as ReactPointerEvent } from 'react';
import type { WindowPosition } from 'src/types/game';

const DRAG_VISIBLE_WIDTH = 150;
const DRAG_VISIBLE_HEIGHT = 60;

interface WindowDragOptions {
  position: WindowPosition;
  onMove: (position: WindowPosition) => void;
  enabled?: boolean;
}

// Shared title-bar drag for browser and icon windows: 1:1 pointer tracking,
// clamped so a title bar corner always stays reachable on the desktop.
export function createWindowDrag({
  position,
  onMove,
  enabled = true,
}: WindowDragOptions) {
  return (event: ReactPointerEvent<HTMLElement>) => {
    if (!enabled) {
      return;
    }

    // Only the left button drags, Win95 style: right-press opens the menu.
    if (event.button !== 0) {
      return;
    }

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
      onMove({ x, y });
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
}
