import { useState } from 'react';
import { DESKTOP_ICONS } from 'src/data/gameContent';
import type { IconCell } from 'src/types/game';

export type IconPositions = Record<string, IconCell>;

const STORAGE_KEY = 'org.remarkablegames.grandma-tech-support.icons';

// First run is the classic column: oldest icon at the top, all eight down
// the left edge.
const DEFAULT_POSITIONS: IconPositions = Object.fromEntries(
  DESKTOP_ICONS.map((icon, index) => [icon.id, { col: 0, row: index }]),
);

function isCell(value: unknown): value is IconCell {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  if (!('col' in value) || !('row' in value)) {
    return false;
  }

  const col = Number(value.col);
  const row = Number(value.row);

  return col >= 0 && row >= 0;
}

function loadPositions(): IconPositions {
  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (stored === null) {
    return DEFAULT_POSITIONS;
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(stored);
  } catch {
    return DEFAULT_POSITIONS;
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return DEFAULT_POSITIONS;
  }

  const record = parsed as Record<string, unknown>;

  return Object.fromEntries(
    DESKTOP_ICONS.map((icon) => {
      const cell: unknown = record[icon.id];

      return [icon.id, isCell(cell) ? cell : DEFAULT_POSITIONS[icon.id]];
    }),
  );
}

// Where grandma's icons live between visits: grid cells persisted to
// localStorage, so her desktop stays exactly as scrambled as you left it.
export function useIconPositions() {
  const [positions, setPositions] = useState<IconPositions>(loadPositions);

  const moveIcon = (id: string, cell: IconCell) => {
    const next = { ...positions, [id]: cell };

    setPositions(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  return { positions, moveIcon };
}
