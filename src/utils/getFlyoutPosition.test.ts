import { getFlyoutPosition } from './getFlyoutPosition';

describe('getFlyoutPosition', () => {
  it('sits flush against the parent item when there is room', () => {
    expect(
      getFlyoutPosition(
        { top: 120, right: 190 },
        { width: 176, height: 200 },
        { width: 1024, height: 768 },
      ),
    ).toEqual({ left: 190, top: 120 });
  });

  it('pulls back inside the screen when the edge would clip', () => {
    expect(
      getFlyoutPosition(
        { top: 700, right: 950 },
        { width: 176, height: 300 },
        { width: 1024, height: 768 },
      ),
    ).toEqual({ left: 848, top: 468 });
  });

  it('never reports a negative edge when the viewport is smaller', () => {
    expect(
      getFlyoutPosition(
        { top: -40, right: -10 },
        { width: 1200, height: 900 },
        { width: 1024, height: 768 },
      ),
    ).toEqual({ left: 0, top: 0 });
  });
});
