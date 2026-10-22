import { act, renderHook } from '@testing-library/react';
import { DESKTOP_ICONS } from 'src/data/gameContent';
import { useIconPositions } from 'src/hooks/useIconPositions';
import { audio } from 'src/services/audio';

// Deliberately a literal, not an import: pins the on-disk key the docs
// promise, independent of whatever the source happens to use today.
const STORAGE_KEY = 'org.remarkablegames.grandma-tech-support';

describe('useIconPositions hook', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('starts every icon in the left column, oldest at the top', () => {
    const { result } = renderHook(() => useIconPositions());

    DESKTOP_ICONS.forEach((icon, index) => {
      expect(result.current.positions[icon.id]).toEqual({ col: 0, row: index });
    });
  });

  it('picks up where the last session left off', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        icons: {
          notes: { col: 3, row: 1 },
          ghost: { col: 9, row: 9 },
        },
      }),
    );

    const { result } = renderHook(() => useIconPositions());

    expect(result.current.positions.notes).toEqual({ col: 3, row: 1 });
    // Ids the current desktop doesn't know stay out of the layout.
    expect(result.current.positions.ghost).toBeUndefined();
    expect(Object.keys(result.current.positions)).toHaveLength(
      DESKTOP_ICONS.length,
    );
    // The pre-bin format loads as an untouched desktop.
    expect(result.current.recycled).toEqual([]);
    expect(result.current.filed).toEqual([]);
  });

  it('reads back a saved bin and folder', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        icons: {
          positions: { notes: { col: 3, row: 1 } },
          recycled: ['internet', 'ghost', 7],
          filed: ['calculator'],
        },
      }),
    );

    const { result } = renderHook(() => useIconPositions());

    expect(result.current.positions.notes).toEqual({ col: 3, row: 1 });
    // Only ids the current desktop knows come back from the dead.
    expect(result.current.recycled).toEqual(['internet']);
    expect(result.current.filed).toEqual(['calculator']);
  });

  it('moves an icon and writes the layout back', () => {
    const { result } = renderHook(() => useIconPositions());

    act(() => {
      result.current.moveIcon('notes', { col: 2, row: 4 });
    });

    expect(result.current.positions.notes).toEqual({ col: 2, row: 4 });
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}')) //
      .toEqual({
        icons: {
          positions: result.current.positions,
          recycled: [],
          filed: [],
          binEmptied: false,
        },
      });
  });

  it('recycles, files, and restores icons, persisting every step', () => {
    const { result } = renderHook(() => useIconPositions());

    act(() => {
      result.current.recycleIcon('notes');
    });
    expect(result.current.recycled).toEqual(['notes']);
    // The bin keeps the icon's cell for its Restore button.
    expect(result.current.positions.notes).toEqual({ col: 0, row: 3 });

    // Eating the same shortcut twice never duplicates it...
    act(() => {
      result.current.recycleIcon('notes');
    });
    expect(result.current.recycled).toEqual(['notes']);

    // ...and the bin and the folder never hold the same icon at once.
    act(() => {
      result.current.fileIcon('notes');
    });
    expect(result.current.recycled).toEqual([]);
    expect(result.current.filed).toEqual(['notes']);

    // Filing appends: new arrivals sit at the bottom of the folder.
    act(() => {
      result.current.recycleIcon('internet');
      result.current.fileIcon('calculator');
    });
    expect(result.current.recycled).toEqual(['internet']);
    expect(result.current.filed).toEqual(['notes', 'calculator']);

    const stored = () =>
      (
        JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}') as {
          icons?: { recycled?: string[]; filed?: string[] };
        }
      ).icons;
    expect(stored()).toEqual({
      positions: result.current.positions,
      recycled: ['internet'],
      filed: ['notes', 'calculator'],
      binEmptied: false,
    });

    // Restore takes an icon out of whichever container holds it.
    act(() => {
      result.current.restoreIcon('internet');
      result.current.restoreIcon('notes');
      result.current.restoreIcon('ghost');
    });
    expect(result.current.recycled).toEqual([]);
    expect(result.current.filed).toEqual(['calculator']);
    expect(stored()).toEqual({
      positions: result.current.positions,
      recycled: [],
      filed: ['calculator'],
      binEmptied: false,
    });
  });

  it('empties the bin for real and puts the junk back on the reset', () => {
    const { result } = renderHook(() => useIconPositions());

    // The folder is a separate container: emptying never touches it.
    act(() => {
      result.current.fileIcon('calculator');
      result.current.recycleIcon('notes');
    });

    act(() => {
      result.current.emptyBin();
    });
    expect(result.current.recycled).toEqual([]);
    expect(result.current.binEmptied).toBe(true);
    expect(result.current.filed).toEqual(['calculator']);
    expect(
      JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}'),
    ).toEqual({
      icons: {
        positions: result.current.positions,
        recycled: [],
        filed: ['calculator'],
        binEmptied: true,
      },
    });

    // Play again (and the restart behind the boot screens) puts the joke
    // junk back in the bin.
    act(() => {
      result.current.resetBin();
    });
    expect(result.current.binEmptied).toBe(false);
    expect(result.current.filed).toEqual(['calculator']);
  });

  it('reads back a bin that has been emptied', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ icons: { binEmptied: true } }),
    );

    const { result } = renderHook(() => useIconPositions());

    expect(result.current.binEmptied).toBe(true);
    // Junk values never count as emptied.
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ icons: { binEmptied: 'purple' } }),
    );
    const junked = renderHook(() => useIconPositions());
    expect(junked.result.current.binEmptied).toBe(false);
  });

  it('shares one app document with the audio settings', () => {
    audio.setVolume(40);

    const { result } = renderHook(() => useIconPositions());

    act(() => {
      result.current.moveIcon('notes', { col: 3, row: 2 });
    });

    const readDoc = () =>
      JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}') as {
        audio?: { sfx?: { volume: number } };
        icons?: unknown;
      };

    // The layout write carries the volume section through...
    expect(readDoc().audio?.sfx?.volume).toBe(40);
    expect(readDoc().icons).toEqual({
      positions: result.current.positions,
      recycled: [],
      filed: [],
      binEmptied: false,
    });

    // ...and a later volume change must not wipe the layout.
    audio.setVolume(55);
    expect(readDoc().icons).toEqual({
      positions: result.current.positions,
      recycled: [],
      filed: [],
      binEmptied: false,
    });
    expect(readDoc().audio?.sfx?.volume).toBe(55);
  });

  it('falls back to the defaults when the saved layout is junk', () => {
    const junk = [
      'not json at all',
      '42',
      'null',
      '{"audio":{}}',
      '{"icons":null}',
      '{"icons":"purple"}',
      '{"icons":{"notes":null}}',
      '{"icons":{"notes":{"row":0}}}',
      '{"icons":{"notes":{"col":1}}}',
      '{"icons":{"notes":{"col":-1,"row":0}}}',
      '{"icons":{"notes":{"col":0,"row":-2}}}',
      '{"icons":{"positions":"purple"}}',
      '{"icons":{"positions":{},"recycled":"nope","filed":7}}',
      '{"icons":{"positions":null,"recycled":null,"filed":{}}}',
    ];
    const index = DESKTOP_ICONS.findIndex((icon) => icon.id === 'notes');

    junk.forEach((payload) => {
      window.localStorage.setItem(STORAGE_KEY, payload);

      const { result } = renderHook(() => useIconPositions());

      expect(result.current.positions.notes).toEqual({ col: 0, row: index });
    });
  });
});
