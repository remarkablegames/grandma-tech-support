import { ICON_GRID, snapIconCell } from './snapIconCell';

const VIEWPORT = { width: 1024, height: 768 };

describe('snapIconCell util', () => {
  it('snaps a whole cell of drag onto the grid', () => {
    expect(
      snapIconCell(
        { col: 0, row: 0 },
        ICON_GRID.width,
        ICON_GRID.height * 2,
        VIEWPORT,
      ),
    ).toEqual({ col: 1, row: 2 });
  });

  it('rounds a partial cell to the nearest one', () => {
    expect(snapIconCell({ col: 0, row: 0 }, 39, 0, VIEWPORT)).toEqual({
      col: 0,
      row: 0,
    });
    expect(snapIconCell({ col: 0, row: 0 }, 41, 0, VIEWPORT)).toEqual({
      col: 1,
      row: 0,
    });
  });

  it('clamps a drag back onto the grid at zero', () => {
    expect(snapIconCell({ col: 2, row: 2 }, -9999, -9999, VIEWPORT)).toEqual({
      col: 0,
      row: 0,
    });
  });

  it('clamps a drag to the far edge of the viewport', () => {
    expect(snapIconCell({ col: 0, row: 0 }, 9999, 9999, VIEWPORT)).toEqual({
      col: 11,
      row: 8,
    });
  });

  it('holds the grid at zero even in a viewport smaller than a cell', () => {
    expect(
      snapIconCell({ col: 0, row: 0 }, 100, 100, { width: 40, height: 40 }),
    ).toEqual({ col: 0, row: 0 });
  });
});
