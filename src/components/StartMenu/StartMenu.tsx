import { useEffect, useRef, useState } from 'react';
import { audio } from 'src/services/audio';
import type {
  StartMenuItem,
  StartMenuLeafItem,
  StartMenuSubmenuItem,
} from 'src/types/game';
import { getFlyoutPosition } from 'src/utils/getFlyoutPosition';

interface StartMenuProps {
  items: StartMenuItem[];
  onSelect: (item: StartMenuLeafItem) => void;
  onDismiss: () => void;
}

interface FlyoutAnchor {
  item: StartMenuSubmenuItem;
  rect: { top: number; right: number };
}

const flyoutId = (item: StartMenuSubmenuItem) => `start-flyout-${item.id}`;

function MenuIcon({ icon }: { icon: string }) {
  return (
    <img
      src={icon}
      alt=""
      width={20}
      height={20}
      draggable={false}
      className="pixelated size-5 shrink-0"
    />
  );
}

// Win95's Start menu with its second layer: Programs and friends cascade
// into flyouts that open on hover or tap, moving between parents switches
// them, Escape peels one layer at a time, and a press anywhere outside
// takes the whole menu away. The Start button itself is exempt: its click
// toggles the menu, so a press there must not close it a beat too early.
export function StartMenu({ items, onSelect, onDismiss }: StartMenuProps) {
  const [anchor, setAnchor] = useState<FlyoutAnchor | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const flyoutRef = useRef<HTMLDivElement | null>(null);

  // Re-opening the same flyout reuses its anchor object, so a tap's
  // synthesized pointerenter and the click that follows share one state
  // instead of fighting over it.
  const openFlyout = (item: StartMenuSubmenuItem, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();

    setAnchor((prev) =>
      prev?.item.id === item.id
        ? prev
        : { item, rect: { top: rect.top, right: rect.right } },
    );
  };

  // The callback identity changes every render, so the flyout re-measures
  // and pulls itself inside the viewport before paint — the same edge
  // discipline ContextMenu applies to its own frame.
  const handleFlyoutRef = (node: HTMLDivElement | null) => {
    flyoutRef.current = node;

    if (node === null || anchor === null) {
      return;
    }

    const { left, top } = getFlyoutPosition(
      anchor.rect,
      node.getBoundingClientRect(),
      { width: window.innerWidth, height: window.innerHeight },
    );

    node.style.left = `${String(left)}px`;
    node.style.top = `${String(top)}px`;
  };

  // Focus lands on the flyout's first entry when it opens, the way the
  // right-click menu grabs its first item, so keyboard users start inside.
  useEffect(() => {
    flyoutRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
  }, [anchor]);

  useEffect(() => {
    const isInside = (target: EventTarget | null) =>
      menuRef.current?.contains(target as Node) === true ||
      flyoutRef.current?.contains(target as Node) === true;

    const handlePointerDown = (event: PointerEvent) => {
      // Pressing Start while the menu is open must reach the button's own
      // toggle alone: closing on pointerdown here would reopen on the click
      // that follows, trapping the menu on screen.
      if (
        event.target instanceof Element &&
        event.target.closest('[data-start-toggle]') !== null
      ) {
        return;
      }

      if (!isInside(event.target)) {
        setAnchor(null);
        onDismiss();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }

      if (anchor !== null) {
        setAnchor(null);
        // Hand focus back to the parent entry while its aria-controls link
        // still names the flyout that just went away.
        menuRef.current
          ?.querySelector<HTMLButtonElement>(
            `[aria-controls="${flyoutId(anchor.item)}"]`,
          )
          ?.focus();
        return;
      }

      onDismiss();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [anchor, onDismiss]);

  return (
    <>
      <div
        ref={menuRef}
        role="menu"
        aria-label="Start menu"
        className="animate-menu bg-win-face win-outset absolute bottom-10 left-1 z-[45] flex w-56 p-[3px]"
      >
        <div
          aria-hidden="true"
          className="bg-win-navy flex w-7 items-end justify-center pb-3"
        >
          <span className="text-win-face rotate-180 text-sm font-bold tracking-widest [writing-mode:vertical-rl]">
            Rainbows<span className="font-light text-white">95</span>
          </span>
        </div>

        <div className="flex-1 py-1">
          {items.map((item) => {
            if ('children' in item) {
              const open = anchor?.item.id === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  aria-haspopup="menu"
                  aria-expanded={open}
                  aria-controls={open ? flyoutId(item) : undefined}
                  onClick={(event) => {
                    audio.play('click');
                    openFlyout(item, event.currentTarget);
                  }}
                  onPointerEnter={(event) => {
                    openFlyout(item, event.currentTarget);
                  }}
                  className={`hover:bg-win-navy flex w-full items-center gap-2 px-2 py-1.5 text-left text-sm text-black hover:text-white ${
                    open ? 'bg-win-navy text-white' : ''
                  }`}
                >
                  <MenuIcon icon={item.icon} />
                  <span className="truncate">{item.label}</span>
                  <span
                    aria-hidden="true"
                    className="ml-auto h-0 w-0 shrink-0 border-y-4 border-l-[5px] border-y-transparent border-l-current"
                  />
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
                onPointerEnter={() => {
                  setAnchor(null);
                }}
                className="hover:bg-win-navy flex w-full items-center gap-2 px-2 py-1.5 text-left text-sm text-black hover:text-white"
              >
                <MenuIcon icon={item.icon} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {anchor !== null && (
        <div
          id={flyoutId(anchor.item)}
          ref={handleFlyoutRef}
          role="menu"
          aria-label={`${anchor.item.label} submenu`}
          className="bg-win-face win-outset animate-menu fixed z-[46] flex w-44 flex-col p-[3px]"
        >
          {anchor.item.children.map((child) => (
            <button
              key={child.id}
              type="button"
              role="menuitem"
              onClick={() => {
                audio.play('click');
                setAnchor(null);
                onSelect(child);
              }}
              className="hover:bg-win-navy flex w-full items-center gap-2 px-2 py-1.5 text-left text-sm text-black hover:text-white"
            >
              <MenuIcon icon={child.icon} />
              <span className="truncate">{child.label}</span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}
