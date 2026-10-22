import type { DesktopIconConfig, IconCell } from 'src/types/game';

// What a drop did, decided Win95 style by whatever sits under the icon
// when the player lets go.
export type IconDropResult = 'move' | 'recycle' | 'file' | 'refuse';

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

  const consumable = dragged.system !== true && dragged.container === undefined;

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
