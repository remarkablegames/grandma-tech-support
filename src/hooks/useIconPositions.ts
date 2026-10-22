import { useState } from 'react';
import { DESKTOP_ICONS } from 'src/data/gameContent';
import {
  isJsonObject,
  loadSection,
  saveSection,
} from 'src/services/appStorage';
import type { IconCell } from 'src/types/game';

export type IconPositions = Record<string, IconCell>;

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
  const icons = loadSection(window.localStorage, 'icons');

  if (!isJsonObject(icons)) {
    return DEFAULT_POSITIONS;
  }

  return Object.fromEntries(
    DESKTOP_ICONS.map((icon) => {
      const cell = icons[icon.id];

      return [icon.id, isCell(cell) ? cell : DEFAULT_POSITIONS[icon.id]];
    }),
  );
}

// Where grandma's icons live between visits: the `icons` section of the
// shared store (see appStorage.ts), so her desktop stays exactly as
// scrambled as you left it — and the audio settings ride along untouched.
export function useIconPositions() {
  const [positions, setPositions] = useState<IconPositions>(loadPositions);

  const moveIcon = (id: string, cell: IconCell) => {
    const next = { ...positions, [id]: cell };

    setPositions(next);
    saveSection(window.localStorage, 'icons', next);
  };

  return { positions, moveIcon };
}
