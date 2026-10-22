import type { IconCell } from 'src/types/game';

// The desktop grid: icons snap into 80px cells behind an 8px margin, the
// way Win95 parks them in a column a hand-width from the corner.
export const ICON_GRID = { origin: 8, width: 80, height: 80 };

const clampCell = (value: number, max: number) =>
  Math.min(Math.max(value, 0), Math.max(max, 0));

// Drag offset → snapped cell, clamped so a dropped icon always keeps at
// least its top-left corner on screen and stays grabbable again.
export function snapIconCell(
  from: IconCell,
  dx: number,
  dy: number,
  viewport: { width: number; height: number },
): IconCell {
  const maxCol = Math.floor(
    (viewport.width - ICON_GRID.origin - ICON_GRID.width) / ICON_GRID.width,
  );
  const maxRow = Math.floor(
    (viewport.height - ICON_GRID.origin - ICON_GRID.height) / ICON_GRID.height,
  );

  return {
    col: clampCell(
      Math.round((from.col * ICON_GRID.width + dx) / ICON_GRID.width),
      maxCol,
    ),
    row: clampCell(
      Math.round((from.row * ICON_GRID.height + dy) / ICON_GRID.height),
      maxRow,
    ),
  };
}
