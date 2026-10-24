import type { DesktopIconConfig, IconCell } from 'src/types/game';

// What a drop did, decided Win95 style by whatever sits under the icon
// when the player lets go.
export type IconDropResult = 'move' | 'recycle' | 'file' | 'refuse';

// What the bin and the folder will take: the same rule decides both a
// drop's fate and whether a menu's Delete is Win95's real thing or the
// joke for something that can't go anywhere (the system icons and the
// containers themselves).
export function isConsumable(icon: DesktopIconConfig): boolean {
  return icon.system !== true && icon.container === undefined;
}

// Grid-accurate drop resolution: the bin swallows dropped shortcuts, the
// folder files them, system icons (and the containers themselves) refuse
// drops both ways, and anything else just lands on the cell — shortcuts
// may even stack, the one place our grid is kinder than Win95's. When
// icons already overlap, precedence runs bin, then folder, then system.
export function resolveIconDrop(
  dragged: DesktopIconConfig,
  cell: IconCell,
  positions: Record<string, IconCell>,
  icons: DesktopIconConfig[],
): IconDropResult {
  const occupants = icons.filter(
    (other) =>
      other.id !== dragged.id &&
      positions[other.id].col === cell.col &&
      positions[other.id].row === cell.row,
  );

  if (occupants.length === 0) {
    return 'move';
  }

  const consumable = isConsumable(dragged);

  if (occupants.some((other) => other.container === 'recycle')) {
    return consumable ? 'recycle' : 'refuse';
  }

  if (occupants.some((other) => other.container === 'folder')) {
    return consumable ? 'file' : 'refuse';
  }

  if (occupants.some((other) => other.system === true)) {
    return 'refuse';
  }

  return 'move';
}
