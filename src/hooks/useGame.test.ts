import { act, renderHook } from '@testing-library/react';
import {
  DESKTOP_ICONS,
  GRANDMA_LINES,
  JOKES,
  MAIL_PASSWORD,
  OBJECTIVES,
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
    // The desktop starts blank: every browser window is closed.
    expect(result.current.focusedId).toBeUndefined();
    expect(result.current.zOrder).toEqual(['inbox', 'shopping', 'virus']);
    expect(result.current.positions).toEqual({
      shopping: { x: 60, y: 90 },
      inbox: { x: 340, y: 210 },
      virus: { x: 430, y: 70 },
    });
    expect(result.current.open).toEqual({
      shopping: false,
      inbox: false,
      virus: false,
    });
    expect(result.current.openPopups).toHaveLength(0);
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
    expect(result.current.iconFocusedId).toBeUndefined();
    expect(result.current.iconMinimized).toEqual({
      computer: false,
      recycle: false,
      documents: false,
      notes: false,
      calculator: false,
      scanner: false,
      'other-note': false,
    });
    expect(result.current.openIconWindows).toEqual({
      computer: false,
      recycle: false,
      documents: false,
      notes: false,
      calculator: false,
      scanner: false,
      'other-note': false,
    });
  });

  it('raises windows to the front', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.openWindow('inbox');
    });
    expect(result.current.focusedId).toBe('inbox');
    expect(result.current.zOrder).toEqual(['shopping', 'virus', 'inbox']);

    act(() => {
      result.current.openWindow('shopping');
    });
    expect(result.current.focusedId).toBe('shopping');
    expect(result.current.zOrder).toHaveLength(3);
    expect(new Set(result.current.zOrder).size).toBe(3);
  });

  it('opens and closes browser windows, taking their pop-ups with them', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.selectStartItem(START_ITEMS[0]);
    });
    expect(result.current.open.inbox).toBe(true);
    expect(result.current.focusedId).toBe('inbox');

    // Task 2 lands the deal, spam, and mailbox-full pop-ups.
    act(() => {
      result.current.login(MAIL_PASSWORD);
    });
    act(() => {
      result.current.nextObjective();
    });
    expect(result.current.openPopups).toHaveLength(4);
    expect(countInboxPopups(result.current.openPopups)).toBe(1);

    // Closing the window takes its pop-ups down with it; focus falls to
    // the sale page the storm kept raised underneath.
    act(() => {
      result.current.closeWindow('inbox');
    });
    expect(result.current.open.inbox).toBe(false);
    expect(result.current.minimized.inbox).toBe(false);
    expect(result.current.focusedId).toBe('shopping');
    expect(countInboxPopups(result.current.openPopups)).toBe(0);
    expect(result.current.openPopups).toHaveLength(3);

    // The Start menu brings the window back, pop-ups and all.
    act(() => {
      result.current.selectStartItem(START_ITEMS[0]);
    });
    expect(result.current.open.inbox).toBe(true);
    expect(result.current.focusedId).toBe('inbox');
    expect(countInboxPopups(result.current.openPopups)).toBe(0);
  });

  it('minimizes a window and hands focus to the one behind', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.openWindow('shopping');
      result.current.openWindow('inbox');
      result.current.openWindow('virus');
    });
    expect(result.current.focusedId).toBe('virus');

    act(() => {
      result.current.minimize('virus');
    });
    expect(result.current.minimized.virus).toBe(true);
    expect(result.current.focusedId).toBe('inbox');

    act(() => {
      result.current.activateWindow('virus');
    });
    expect(result.current.minimized.virus).toBe(false);
    expect(result.current.focusedId).toBe('virus');
  });

  it('has no focused window once every window is minimized', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.openWindow('shopping');
      result.current.openWindow('inbox');
      result.current.openWindow('virus');
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

  it('minimizes icon windows and toggles them from the taskbar', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.openIconWindow('computer');
    });
    act(() => {
      result.current.openIconWindow('notes');
    });
    expect(result.current.iconFocusedId).toBe('notes');

    // The focused window's taskbar button minimizes it (Win95 toggle).
    act(() => {
      result.current.activateIconWindow('notes');
    });
    expect(result.current.iconMinimized.notes).toBe(true);
    expect(result.current.iconFocusedId).toBe('computer');

    // Clicking it again restores and raises it.
    act(() => {
      result.current.activateIconWindow('notes');
    });
    expect(result.current.iconMinimized.notes).toBe(false);
    expect(result.current.iconFocusedId).toBe('notes');

    // The title-bar minimize button hands focus to the next window.
    act(() => {
      result.current.minimizeIconWindow('computer');
    });
    expect(result.current.iconFocusedId).toBe('notes');

    // Double-clicking the desktop icon restores a minimized window.
    act(() => {
      result.current.openIconWindow('computer');
    });
    expect(result.current.iconMinimized.computer).toBe(false);
    expect(result.current.iconFocusedId).toBe('computer');
  });

  it('toggles the focused browser window from its taskbar button', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.openWindow('shopping');
      result.current.openWindow('inbox');
      result.current.openWindow('virus');
    });

    // 'virus' was raised last, so it starts focused.
    expect(result.current.focusedId).toBe('virus');

    act(() => {
      result.current.activateWindow('virus');
    });
    expect(result.current.minimized.virus).toBe(true);
    expect(result.current.focusedId).toBe('inbox');

    act(() => {
      result.current.activateWindow('virus');
    });
    expect(result.current.minimized.virus).toBe(false);
    expect(result.current.focusedId).toBe('virus');
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
      result.current.popupAction('inbox', {
        label: 'Close',
        message: JOKES.liarClose,
        spawns: 2,
      });
    });
    expect(result.current.openPopups).toHaveLength(2);

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
    expect(result.current.openPopups).toHaveLength(2);
    expect(countInboxPopups(result.current.openPopups)).toBe(2);

    const keys = result.current.openPopups.map((popup) => popup.key);
    expect(new Set(keys).size).toBe(keys.length);

    act(() => {
      result.current.popupAction('inbox', {
        label: 'Close',
        message: JOKES.liarClose,
        spawns: 2,
      });
    });
    expect(countInboxPopups(result.current.openPopups)).toBe(4);

    act(() => {
      result.current.popupAction('inbox', {
        label: 'Close',
        message: JOKES.liarClose,
        spawns: 2,
      });
    });
    expect(countInboxPopups(result.current.openPopups)).toBe(5);
    expect(result.current.openPopups).toHaveLength(5);
    expect(result.current.message).toBe(JOKES.liarClose);
  });

  it('only changes the grandma line for the inbox popup', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.login(MAIL_PASSWORD);
    });
    act(() => {
      result.current.nextObjective();
    });
    expect(result.current.openPopups).toHaveLength(4);

    act(() => {
      result.current.dismissPopup('deal-1', 'deal');
    });
    expect(result.current.openPopups).toHaveLength(3);
    expect(result.current.grandmaLine).toBe(OBJECTIVES[1].instruction);

    act(() => {
      result.current.dismissPopup('full-4', 'full');
    });
    expect(result.current.openPopups).toHaveLength(2);
    expect(result.current.grandmaLine).toBe(GRANDMA_LINES.correctClose);
  });

  it('tracks icon selection and the decoy mail line', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.selectIcon(DESKTOP_ICONS[0]);
    });
    expect(result.current.selectedIcon).toBe('computer');
    expect(result.current.grandmaLine).toBe(GRANDMA_LINES.intro);

    // The decoy "Grandma's Mail" shortcut.
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
      result.current.selectStartItem(START_ITEMS[8]);
    });
    expect(result.current.startOpen).toBe(false);
    expect(result.current.message).toBe(JOKES.startShutDown);
  });

  it('completes a task and resets everything on play again', () => {
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
        label: 'Close',
        message: JOKES.liarClose,
        spawns: 2,
      });
    });
    act(() => {
      result.current.selectStartItem(START_ITEMS[0]);
    });
    act(() => {
      result.current.toggleStart();
    });
    act(() => {
      result.current.selectIcon(DESKTOP_ICONS[0]);
    });
    act(() => {
      result.current.minimizeIconWindow('computer');
    });
    act(() => {
      result.current.login(MAIL_PASSWORD);
    });
    expect(result.current.phase).toBe('taskDone');

    act(() => {
      result.current.playAgain();
    });

    expect(result.current.phase).toBe('playing');
    expect(result.current.focusedId).toBeUndefined();
    expect(result.current.positions).toEqual({
      shopping: { x: 60, y: 90 },
      inbox: { x: 340, y: 210 },
      virus: { x: 430, y: 70 },
    });
    expect(result.current.openPopups).toEqual([]);
    expect(result.current.message).toBeNull();
    expect(result.current.grandmaLine).toBe(GRANDMA_LINES.intro);
    expect(result.current.selectedIcon).toBeNull();
    expect(result.current.startOpen).toBe(false);
    expect(result.current.open).toEqual({
      shopping: false,
      inbox: false,
      virus: false,
    });
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
    expect(result.current.iconFocusedId).toBeUndefined();
    expect(result.current.iconMinimized.computer).toBe(false);
    expect(result.current.iconWindowPositions.computer).toEqual({
      x: 150,
      y: 100,
    });
  });

  it('starts the mission chain at task one', () => {
    const { result } = renderHook(() => useGame());

    expect(result.current.objectiveIndex).toBe(0);
    expect(result.current.loggedIn).toBe(false);
    expect(result.current.stormTriggered).toBe(false);
  });

  it('only the note’s password opens the mail gate', () => {
    const { result } = renderHook(() => useGame());

    let accepted = true;
    act(() => {
      accepted = result.current.login('nope');
    });
    expect(accepted).toBe(false);
    expect(result.current.loggedIn).toBe(false);
    expect(result.current.phase).toBe('playing');

    act(() => {
      accepted = result.current.login(MAIL_PASSWORD);
    });
    expect(accepted).toBe(true);
    expect(result.current.loggedIn).toBe(true);
    expect(result.current.phase).toBe('taskDone');

    // Re-submitting the right password can't re-complete a finished task.
    act(() => {
      accepted = result.current.login(MAIL_PASSWORD);
    });
    expect(accepted).toBe(true);
    expect(result.current.phase).toBe('taskDone');
  });

  it('runs the whole mission chain and resets it on play again', () => {
    const { result } = renderHook(() => useGame());

    // Task 2 starts: grandma explains the email, ad spam lands in Shopping.
    act(() => {
      result.current.login(MAIL_PASSWORD);
    });
    act(() => {
      result.current.nextObjective();
    });
    expect(result.current.phase).toBe('playing');
    expect(result.current.objectiveIndex).toBe(1);
    expect(result.current.grandmaLine).toBe(OBJECTIVES[1].instruction);
    // The whole internet springs back open: two ad spam plus the deal popup
    // in Shopping, and the mailbox-full popup in the Inbox.
    expect(result.current.open).toEqual({
      shopping: true,
      inbox: true,
      virus: true,
    });
    expect(result.current.openPopups).toHaveLength(4);

    act(() => {
      result.current.openEmail();
    });
    expect(result.current.phase).toBe('taskDone');

    // Task 3 starts with no extra pop-ups.
    act(() => {
      result.current.nextObjective();
    });
    expect(result.current.objectiveIndex).toBe(2);

    // First click: the joke plus the ad storm across all three windows.
    act(() => {
      result.current.buyToaster(JOKES.toasterTile);
    });
    expect(result.current.stormTriggered).toBe(true);
    expect(result.current.message).toBe(JOKES.toasterTile);
    expect(result.current.openPopups).toHaveLength(12);

    // Pop-ups still open: the toaster refuses to order.
    act(() => {
      result.current.buyToaster(JOKES.toasterTile);
    });
    expect(result.current.message).toBe(JOKES.buyBlocked);
    expect(result.current.phase).toBe('playing');

    for (const popup of [...result.current.openPopups]) {
      act(() => {
        result.current.dismissPopup(popup.key, popup.popupId);
      });
    }
    expect(result.current.openPopups).toHaveLength(0);

    // A clean desktop lets the next click through.
    act(() => {
      result.current.buyToaster(JOKES.toasterTile);
    });
    expect(result.current.phase).toBe('taskDone');

    // Task 4 floods every window again.
    act(() => {
      result.current.nextObjective();
    });
    expect(result.current.objectiveIndex).toBe(3);
    expect(result.current.openPopups).toHaveLength(9);

    // The scan completes the finale and sweeps the storm in one motion.
    act(() => {
      result.current.completeScan();
    });
    expect(result.current.phase).toBe('won');
    expect(result.current.openPopups).toHaveLength(0);

    // Winning again is impossible; the final reset starts a fresh evening.
    act(() => {
      result.current.completeScan();
    });
    expect(result.current.phase).toBe('won');

    act(() => {
      result.current.playAgain();
    });
    expect(result.current.phase).toBe('playing');
    expect(result.current.objectiveIndex).toBe(0);
    expect(result.current.loggedIn).toBe(false);
    expect(result.current.stormTriggered).toBe(false);
    expect(result.current.openPopups).toEqual([]);
    expect(result.current.open).toEqual({
      shopping: false,
      inbox: false,
      virus: false,
    });
  });

  it('keeps out-of-objective clicks harmless', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.buyToaster(JOKES.toasterTile);
    });
    expect(result.current.message).toBe(JOKES.toasterTile);
    expect(result.current.stormTriggered).toBe(false);
    expect(result.current.openPopups).toHaveLength(0);

    act(() => {
      result.current.openEmail();
    });
    expect(result.current.phase).toBe('playing');

    act(() => {
      result.current.completeScan();
    });
    expect(result.current.phase).toBe('playing');
    expect(result.current.openPopups).toHaveLength(0);
  });

  it('skips objective pop-ups for windows that are already full', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.popupAction('inbox', {
        label: 'Close',
        message: JOKES.liarClose,
        spawns: 5,
      });
    });
    expect(result.current.openPopups).toHaveLength(5);
    expect(countInboxPopups(result.current.openPopups)).toBe(5);

    act(() => {
      result.current.login(MAIL_PASSWORD);
    });
    act(() => {
      result.current.nextObjective();
    });

    // The Inbox was already at its cap, so the mailbox-full popup lands
    // nowhere new; Shopping still gets the deal plus two spam.
    expect(result.current.openPopups).toHaveLength(8);
    expect(countInboxPopups(result.current.openPopups)).toBe(5);
  });
});
