import { act, renderHook } from '@testing-library/react';
import { DESKTOP_ICONS } from 'src/data/gameContent';
import { useIconPositions } from 'src/hooks/useIconPositions';

const STORAGE_KEY = 'org.remarkablegames.grandma-tech-support.icons';

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
      JSON.stringify({ notes: { col: 3, row: 1 }, ghost: { col: 9, row: 9 } }),
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
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null')) //
      .toEqual(result.current.positions);
  });

  it('falls back to the defaults when the saved layout is junk', () => {
    const junk = [
      'not json at all',
      '42',
      'null',
      '{"notes":null}',
      '{"notes":{"row":0}}',
      '{"notes":{"col":1}}',
      '{"notes":{"col":-1,"row":0}}',
    ];
    const index = DESKTOP_ICONS.findIndex((icon) => icon.id === 'notes');

    junk.forEach((payload) => {
      window.localStorage.setItem(STORAGE_KEY, payload);

      const { result } = renderHook(() => useIconPositions());

      expect(result.current.positions.notes).toEqual({ col: 0, row: index });
    });
  });
});
