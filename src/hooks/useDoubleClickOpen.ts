import type { MouseEvent as ReactMouseEvent } from 'react';
import { useRef } from 'react';

const DOUBLE_CLICK_MS = 400;

// Win95 open semantics, shared by desktop icons and file rows: keyboard
// activation opens right away (detail === 0), a mouse needs a quick second click.
export function useDoubleClickOpen(onOpen?: () => void) {
  const lastClickRef = useRef(0);

  return (event: ReactMouseEvent<HTMLElement>) => {
    if (onOpen === undefined) {
      return;
    }

    const now = Date.now();
    if (event.detail === 0 || now - lastClickRef.current <= DOUBLE_CLICK_MS) {
      onOpen();
    }
    lastClickRef.current = now;
  };
}
