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
  });

  it('moves an icon and writes the layout back', () => {
    const { result } = renderHook(() => useIconPositions());

    act(() => {
      result.current.moveIcon('notes', { col: 2, row: 4 });
    });

    expect(result.current.positions.notes).toEqual({ col: 2, row: 4 });
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}')) //
      .toEqual({ icons: result.current.positions });
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
    expect(readDoc().icons).toEqual(result.current.positions);

    // ...and a later volume change must not wipe the layout.
    audio.setVolume(55);
    expect(readDoc().icons).toEqual(result.current.positions);
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
    ];
    const index = DESKTOP_ICONS.findIndex((icon) => icon.id === 'notes');

    junk.forEach((payload) => {
      window.localStorage.setItem(STORAGE_KEY, payload);

      const { result } = renderHook(() => useIconPositions());

      expect(result.current.positions.notes).toEqual({ col: 0, row: index });
    });
  });
});
