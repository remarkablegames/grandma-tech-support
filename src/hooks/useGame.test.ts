import { act, renderHook } from '@testing-library/react';
import {
  DESKTOP_ICONS,
  GRANDMA_LINES,
  INITIAL_POPUPS,
  JOKES,
  START_ITEMS,
} from 'src/data/gameContent';
import { useGame } from 'src/hooks/useGame';

function countInboxPopups(openPopups: { windowId: string }[]) {
  return openPopups.filter((popup) => popup.windowId === 'inbox').length;
}

describe('useGame hook', () => {
  it('starts with the intro state', () => {
    const { result } = renderHook(() => useGame());

    expect(result.current.phase).toBe('playing');
    expect(result.current.focusedId).toBe('virus');
    expect(result.current.zOrder).toEqual(['inbox', 'shopping', 'virus']);
    expect(result.current.positions).toEqual({
      shopping: { x: 60, y: 90 },
      inbox: { x: 340, y: 210 },
      virus: { x: 430, y: 70 },
    });
    expect(result.current.openPopups).toHaveLength(2);
    expect(result.current.message).toBeNull();
    expect(result.current.grandmaLine).toBe(GRANDMA_LINES.intro);
    expect(result.current.selectedIcon).toBeNull();
    expect(result.current.startOpen).toBe(false);
    expect(result.current.minimized).toEqual({
      shopping: false,
      inbox: false,
      virus: false,
    });
    expect(result.current.maximized).toEqual({
      shopping: false,
      inbox: false,
      virus: false,
    });
    expect(result.current.iconZOrder).toEqual([]);
    expect(result.current.openIconWindows).toEqual({
      computer: false,
      recycle: false,
      documents: false,
      notes: false,
      calculator: false,
    });
  });

  it('raises windows to the front', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.raise('inbox');
    });
    expect(result.current.focusedId).toBe('inbox');
    expect(result.current.zOrder).toEqual(['shopping', 'virus', 'inbox']);

    act(() => {
      result.current.raise('shopping');
    });
    expect(result.current.focusedId).toBe('shopping');
    expect(result.current.zOrder).toHaveLength(3);
    expect(new Set(result.current.zOrder).size).toBe(3);
  });

  it('minimizes a window and hands focus to the one behind', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.minimize('virus');
    });
    expect(result.current.minimized.virus).toBe(true);
    expect(result.current.focusedId).toBe('shopping');

    act(() => {
      result.current.activateWindow('virus');
    });
    expect(result.current.minimized.virus).toBe(false);
    expect(result.current.focusedId).toBe('virus');
  });

  it('has no focused window once every window is minimized', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.minimize('shopping');
      result.current.minimize('inbox');
      result.current.minimize('virus');
    });

    expect(result.current.focusedId).toBeUndefined();
  });

  it('toggles maximize one window at a time', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.toggleMaximize('inbox');
    });
    expect(result.current.maximized.inbox).toBe(true);
    expect(result.current.maximized.virus).toBe(false);

    act(() => {
      result.current.toggleMaximize('inbox');
    });
    expect(result.current.maximized.inbox).toBe(false);
  });

  it('opens, raises, moves, and closes desktop icon windows', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.openIconWindow('computer');
    });
    expect(result.current.openIconWindows.computer).toBe(true);
    expect(result.current.iconZOrder).toEqual(['computer']);
    expect(result.current.iconWindowPositions.computer).toEqual({
      x: 150,
      y: 100,
    });

    act(() => {
      result.current.openIconWindow('notes');
    });
    expect(result.current.iconZOrder).toEqual(['computer', 'notes']);
    expect(result.current.iconWindowPositions.notes).toEqual({
      x: 174,
      y: 124,
    });

    act(() => {
      result.current.raiseIconWindow('computer');
    });
    expect(result.current.iconZOrder).toEqual(['notes', 'computer']);

    act(() => {
      result.current.moveIconWindow('computer', { x: 5, y: 6 });
    });
    expect(result.current.iconWindowPositions.computer).toEqual({
      x: 5,
      y: 6,
    });

    act(() => {
      result.current.closeIconWindow('computer');
    });
    expect(result.current.openIconWindows.computer).toBe(false);
    expect(result.current.iconZOrder).toEqual(['notes']);
  });

  it('keeps the position when re-opening an open icon window', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.openIconWindow('calculator');
    });
    act(() => {
      result.current.moveIconWindow('calculator', { x: 40, y: 50 });
    });
    act(() => {
      result.current.openIconWindow('calculator');
    });

    expect(result.current.iconWindowPositions.calculator).toEqual({
      x: 40,
      y: 50,
    });
    expect(result.current.iconZOrder).toEqual(['calculator']);
  });

  it('moves one window without touching the others', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.moveWindow('inbox', { x: 5, y: 6 });
    });

    expect(result.current.positions.inbox).toEqual({ x: 5, y: 6 });
    expect(result.current.positions.shopping).toEqual({ x: 60, y: 90 });
  });

  it('shows and dismisses jokes', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.showJoke('A joke!');
    });
    expect(result.current.message).toBe('A joke!');

    act(() => {
      result.current.dismissJoke();
    });
    expect(result.current.message).toBeNull();
  });

  it('keeps popups in place for buttons without spawns', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.popupAction('shopping', {
        label: 'Buy',
        message: JOKES.buyButton,
      });
    });

    expect(result.current.message).toBe(JOKES.buyButton);
    expect(result.current.openPopups).toHaveLength(2);
  });

  it('spawns spam popups from liar Close buttons, capped per window', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.popupAction('inbox', {
        label: 'Close',
        message: JOKES.liarClose,
        spawns: 2,
      });
    });
    expect(result.current.openPopups).toHaveLength(4);
    expect(countInboxPopups(result.current.openPopups)).toBe(3);

    const keys = result.current.openPopups.map((popup) => popup.key);
    expect(new Set(keys).size).toBe(keys.length);

    act(() => {
      result.current.popupAction('inbox', {
        label: 'Close',
        message: JOKES.liarClose,
        spawns: 2,
      });
    });
    expect(countInboxPopups(result.current.openPopups)).toBe(5);

    act(() => {
      result.current.popupAction('inbox', {
        label: 'Close',
        message: JOKES.liarClose,
        spawns: 2,
      });
    });
    expect(countInboxPopups(result.current.openPopups)).toBe(5);
    expect(result.current.openPopups).toHaveLength(6);
    expect(result.current.message).toBe(JOKES.liarClose);
  });

  it('only changes the grandma line for the inbox popup', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.dismissPopup('shopping-deal', 'deal');
    });
    expect(result.current.openPopups).toHaveLength(1);
    expect(result.current.grandmaLine).toBe(GRANDMA_LINES.intro);

    act(() => {
      result.current.dismissPopup('inbox-full', 'full');
    });
    expect(result.current.openPopups).toHaveLength(0);
    expect(result.current.grandmaLine).toBe(GRANDMA_LINES.correctClose);
  });

  it('tracks icon selection and the decoy mail line', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.selectIcon(DESKTOP_ICONS[0]);
    });
    expect(result.current.selectedIcon).toBe('computer');
    expect(result.current.grandmaLine).toBe(GRANDMA_LINES.intro);

    // The decoy "Grandma's Mail" shortcut, last in the icon list.
    const mailIcon = DESKTOP_ICONS[5];

    act(() => {
      result.current.selectIcon(mailIcon);
    });
    expect(result.current.selectedIcon).toBe(mailIcon.id);
    expect(result.current.grandmaLine).toBe(GRANDMA_LINES.mailDecoy);
  });

  it('toggles the start menu and picks items', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.toggleStart();
    });
    expect(result.current.startOpen).toBe(true);

    act(() => {
      result.current.toggleStart();
    });
    expect(result.current.startOpen).toBe(false);

    act(() => {
      result.current.toggleStart();
    });
    expect(result.current.startOpen).toBe(true);

    act(() => {
      result.current.selectStartItem(START_ITEMS[6]);
    });
    expect(result.current.startOpen).toBe(false);
    expect(result.current.message).toBe(START_ITEMS[6].message);
  });

  it('wins on opening the email and resets everything on play again', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.raise('inbox');
    });
    act(() => {
      result.current.moveWindow('inbox', { x: 1, y: 2 });
    });
    act(() => {
      result.current.minimize('shopping');
    });
    act(() => {
      result.current.toggleMaximize('inbox');
    });
    act(() => {
      result.current.openIconWindow('computer');
    });
    act(() => {
      result.current.popupAction('shopping', {
        label: 'Buy',
        message: JOKES.buyButton,
      });
    });
    act(() => {
      result.current.dismissPopup('inbox-full', 'full');
    });
    act(() => {
      result.current.toggleStart();
    });
    act(() => {
      result.current.selectIcon(DESKTOP_ICONS[0]);
    });
    act(() => {
      result.current.openEmail();
    });
    expect(result.current.phase).toBe('won');

    act(() => {
      result.current.playAgain();
    });

    expect(result.current.phase).toBe('playing');
    expect(result.current.focusedId).toBe('virus');
    expect(result.current.positions).toEqual({
      shopping: { x: 60, y: 90 },
      inbox: { x: 340, y: 210 },
      virus: { x: 430, y: 70 },
    });
    expect(result.current.openPopups).toEqual(INITIAL_POPUPS);
    expect(result.current.message).toBeNull();
    expect(result.current.grandmaLine).toBe(GRANDMA_LINES.intro);
    expect(result.current.selectedIcon).toBeNull();
    expect(result.current.startOpen).toBe(false);
    expect(result.current.minimized).toEqual({
      shopping: false,
      inbox: false,
      virus: false,
    });
    expect(result.current.maximized).toEqual({
      shopping: false,
      inbox: false,
      virus: false,
    });
    expect(result.current.openIconWindows.computer).toBe(false);
    expect(result.current.iconZOrder).toEqual([]);
    expect(result.current.iconWindowPositions.computer).toEqual({
      x: 150,
      y: 100,
    });
  });
});
