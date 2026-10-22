import { useEffect, useRef } from 'react';
import { audio } from 'src/services/audio';
import type {
  ContextMenuEffectItem,
  ContextMenuItem,
  ContextMenuJokeItem,
  ContextMenuOpenItem,
} from 'src/types/game';

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onSelect: (
    item: ContextMenuJokeItem | ContextMenuOpenItem | ContextMenuEffectItem,
  ) => void;
  onDismiss: () => void;
}

// Win95's right-click menu: it opens under the cursor, nudged back inside
// the screen when the edge would clip it, and it goes away when you press
// anywhere else or hit Escape.
export function ContextMenu({
  x,
  y,
  items,
  onSelect,
  onDismiss,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);

  // The callback identity changes every render, so React re-attaches it
  // each time: measure the menu and pull it back inside the viewport
  // before the browser paints.
  const handleMenuRef = (node: HTMLDivElement | null) => {
    menuRef.current = node;

    if (node === null) {
      return;
    }

    const rect = node.getBoundingClientRect();
    const left = Math.min(x, window.innerWidth - rect.width);
    const top = Math.min(y, window.innerHeight - rect.height);

    node.style.left = `${String(left)}px`;
    node.style.top = `${String(top)}px`;
  };

  useEffect(() => {
    menuRef.current
      ?.querySelector<HTMLButtonElement>('button:not(:disabled)')
      ?.focus();

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        onDismiss();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onDismiss();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onDismiss]);

  return (
    <div
      ref={handleMenuRef}
      role="menu"
      aria-label="Context menu"
      className="bg-win-face win-outset animate-menu fixed z-[45] flex w-44 flex-col p-[3px]"
      style={{ left: x, top: y }}
    >
      {items.map((item) => {
        if ('separator' in item) {
          return (
            <div
              key={item.id}
              role="separator"
              className="bg-win-shadow mx-1 my-1 h-px"
            />
          );
        }

        if ('disabled' in item) {
          return (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              disabled
              className="text-win-shadow px-3 py-1 text-left text-sm"
            >
              {item.label}
            </button>
          );
        }

        return (
          <button
            key={item.id}
            type="button"
            role="menuitem"
            onClick={() => {
              audio.play('click');
              onSelect(item);
            }}
            className="enabled:hover:bg-win-navy px-3 py-1 text-left text-sm text-black enabled:hover:text-white"
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
