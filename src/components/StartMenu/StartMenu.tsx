import type { StartMenuItem } from 'src/types/game';

interface StartMenuProps {
  items: StartMenuItem[];
  onSelect: (item: StartMenuItem) => void;
}

export function StartMenu({ items, onSelect }: StartMenuProps) {
  return (
    <div
      role="menu"
      aria-label="Start menu"
      className="animate-menu bg-win-face win-outset absolute bottom-10 left-1 z-[45] flex w-56 p-[3px]"
    >
      <div
        aria-hidden="true"
        className="bg-win-navy flex w-7 items-end justify-center pb-3"
      >
        <span className="rotate-180 text-sm font-bold tracking-widest text-white [writing-mode:vertical-rl]">
          Grandma95
        </span>
      </div>

      <div className="flex-1 py-1">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            role="menuitem"
            onClick={() => {
              onSelect(item);
            }}
            className="hover:bg-win-navy flex w-full items-center gap-2 px-2 py-1.5 text-left text-sm text-black hover:text-white"
          >
            <img
              src={item.icon}
              alt=""
              width={20}
              height={20}
              draggable={false}
              className="pixelated size-5 shrink-0"
            />
            <span className="truncate">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
