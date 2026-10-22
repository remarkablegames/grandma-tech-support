import { fireEvent } from '@testing-library/react';

// jsdom does not reliably ship a PointerEvent constructor, but both native
// listeners and React's synthetic onPointerDown match purely on event type —
// so a MouseEvent carrying a pointer* type behaves like the real thing here.
export function firePointer(
  target: Window | Element,
  type: 'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel',
  init: MouseEventInit = {},
) {
  fireEvent(
    target,
    new MouseEvent(type, { bubbles: true, cancelable: true, ...init }),
  );
}
