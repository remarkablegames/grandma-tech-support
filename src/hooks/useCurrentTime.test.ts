import { act, renderHook } from '@testing-library/react';

import { useCurrentTime } from './useCurrentTime';

describe('useCurrentTime hook', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] });
    vi.setSystemTime(new Date(2026, 9, 19, 15, 46, 59));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('reads the current time like the Win95 tray', () => {
    const { result } = renderHook(() => useCurrentTime());

    expect(result.current).toBe('3:46 PM');
  });

  it('ticks over when the minute changes', () => {
    const { result } = renderHook(() => useCurrentTime());

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current).toBe('3:47 PM');
  });

  it('clears the ticker when unmounted', () => {
    const clear = vi.spyOn(globalThis, 'clearInterval');
    const { unmount } = renderHook(() => useCurrentTime());

    unmount();

    expect(clear).toHaveBeenCalledTimes(1);
  });
});
