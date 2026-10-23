import { useRef, useState } from 'react';
import { DESKTOP_ICONS } from 'src/data/gameContent';
import {
  isJsonObject,
  loadSection,
  saveSection,
} from 'src/services/appStorage';
import type { IconCell } from 'src/types/game';

export type IconPositions = Record<string, IconCell>;

// The whole persisted desktop: where every icon sits, plus the ones the
// player has dragged off it — into the Recycle Bin, My Documents, or the
// deleted list. `deleted` remembers what the bin emptied for real: it all
// comes back on Play again or a restart, like everything else the reset
// puts back.
export interface IconLayout {
  positions: IconPositions;
  recycled: string[];
  filed: string[];
  deleted: string[];
}

// First run is the classic column: oldest icon at the top, all eight down
// the left edge.
const DEFAULT_POSITIONS: IconPositions = Object.fromEntries(
  DESKTOP_ICONS.map((icon, index) => [icon.id, { col: 0, row: index }]),
);

const DEFAULT_LAYOUT: IconLayout = {
  positions: DEFAULT_POSITIONS,
  recycled: [],
  filed: [],
  deleted: [],
};

const KNOWN_ICON_IDS = new Set(DESKTOP_ICONS.map((icon) => icon.id));

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

// A stored id list: only strings the current desktop knows survive, so a
// stale document can never smuggle a ghost icon back onto the screen.
function readIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (id): id is string => typeof id === 'string' && KNOWN_ICON_IDS.has(id),
  );
}

function readPositions(source: Record<string, unknown>): IconPositions {
  return Object.fromEntries(
    DESKTOP_ICONS.map((icon) => {
      const cell = source[icon.id];

      return [icon.id, isCell(cell) ? cell : DEFAULT_POSITIONS[icon.id]];
    }),
  );
}

function loadLayout(): IconLayout {
  const section = loadSection(window.localStorage, 'icons');

  if (!isJsonObject(section)) {
    return DEFAULT_LAYOUT;
  }

  // Saves from before the bin and the folder existed were a bare
  // positions map; those documents still load, just with nothing eaten.
  const source = isJsonObject(section.positions) ? section.positions : section;

  return {
    positions: readPositions(source),
    recycled: readIds(section.recycled),
    filed: readIds(section.filed),
    // Only the desktop's own icons survive a reload, so a deleted mission
    // file (which the store never learns) quietly returns with its task.
    deleted: readIds(section.deleted),
  };
}

// Where grandma's icons live between visits: the `icons` section of the
// shared store (see appStorage.ts), so her desktop stays exactly as
// scrambled as you left it — bin, folder, and all — and the audio
// settings ride along untouched.
export function useIconPositions() {
  const [layout, setLayout] = useState<IconLayout>(loadLayout);

  // Every mutation reads the latest layout from here, so two changes in
  // one tick (recycle, then file) compose instead of clobbering.
  const layoutRef = useRef(layout);

  const commit = (next: IconLayout) => {
    layoutRef.current = next;
    setLayout(next);
    saveSection(window.localStorage, 'icons', next);
  };

  const moveIcon = (id: string, cell: IconCell) => {
    const current = layoutRef.current;

    commit({ ...current, positions: { ...current.positions, [id]: cell } });
  };

  // The bin eats shortcuts newest-first, and nothing it eats is ever
  // forgotten: the icon keeps its old cell for the Restore button.
  const recycleIcon = (id: string) => {
    const current = layoutRef.current;

    commit({
      ...current,
      recycled: [id, ...current.recycled.filter((kept) => kept !== id)],
      filed: current.filed.filter((kept) => kept !== id),
    });
  };

  // Filing appends, so the new arrival sits at the bottom of the folder —
  // in the window and in Start > Documents alike.
  const fileIcon = (id: string) => {
    const current = layoutRef.current;

    commit({
      ...current,
      filed: [...current.filed.filter((kept) => kept !== id), id],
      recycled: current.recycled.filter((kept) => kept !== id),
    });
  };

  const restoreIcon = (id: string) => {
    const current = layoutRef.current;

    commit({
      ...current,
      recycled: current.recycled.filter((kept) => kept !== id),
      filed: current.filed.filter((kept) => kept !== id),
    });
  };

  // Win95's Empty Recycle Bin: everything in the bin — every shortcut the
  // player recycled — is deleted for real, parked in `deleted` so it stays
  // off the desktop until the evening resets. Filed shortcuts belong to
  // My Documents and stay put.
  const emptyBin = () => {
    const current = layoutRef.current;

    commit({
      ...current,
      deleted: [
        ...current.deleted,
        ...current.recycled.filter((id) => !current.deleted.includes(id)),
      ],
      recycled: [],
    });
  };

  // Play again (and the restart behind the power screens) puts everything
  // emptied for real back, the way it puts the rest of the evening back.
  const resetBin = () => {
    commit({ ...layoutRef.current, deleted: [] });
  };

  return {
    positions: layout.positions,
    recycled: layout.recycled,
    filed: layout.filed,
    deleted: layout.deleted,
    moveIcon,
    recycleIcon,
    fileIcon,
    restoreIcon,
    emptyBin,
    resetBin,
  };
}
