import { act, fireEvent, renderHook } from '@testing-library/react';
import {
  DESKTOP_ICONS,
  GRANDMA_LINES,
  JOKES,
  MAIL_PASSWORD,
  OBJECTIVES,
  START_ITEMS,
} from 'src/data/gameContent';
import { useGame } from 'src/hooks/useGame';
import type { StartMenuLeafItem } from 'src/types/game';

const { play, startMusic, pauseMusic } = vi.hoisted(() => ({
  play: vi.fn(),
  startMusic: vi.fn(),
  pauseMusic: vi.fn(),
}));

vi.mock('src/services/audio', () => ({
  audio: {
    play,
    startMusic,
    pauseMusic,
  },
}));

function countInboxPopups(openPopups: { windowId: string }[]) {
  return openPopups.filter((popup) => popup.windowId === 'inbox').length;
}

// Drill into a flyout the way StartMenu does before handing a leaf over.
function startLeaf(itemId: string, childId: string) {
  const item = START_ITEMS.find((entry) => entry.id === itemId);

  if (item === undefined || !('children' in item)) {
    throw new Error(`Start item ${itemId} has no flyout`);
  }

  const leaf = item.children.find((entry) => entry.id === childId);

  if (leaf === undefined) {
    throw new Error(`Flyout ${itemId} has no ${childId}`);
  }

  return leaf;
}

// A top-level entry that acts when picked, e.g. Start > Help.
function startLeafItem(itemId: string): StartMenuLeafItem {
  const item = START_ITEMS.find((entry) => entry.id === itemId);

  if (item === undefined || 'children' in item) {
    throw new Error(`Start item ${itemId} is not a leaf`);
  }

  return item;
}

// Walk the mission chain to the start of task 4: log in, read the email,
// order the toaster through the ad storm, and land on the update dialog.
function walkToUpdateTask(result: { current: ReturnType<typeof useGame> }) {
  act(() => {
    result.current.login(MAIL_PASSWORD);
  });
  act(() => {
    result.current.nextObjective();
  });
  act(() => {
    result.current.openEmail();
  });
  act(() => {
    result.current.nextObjective();
  });
  act(() => {
    result.current.buyToaster(JOKES.toasterTile);
  });
  for (const popup of [...result.current.openPopups]) {
    if (popup.windowId === 'shopping') {
      act(() => {
        result.current.dismissPopup(popup.key, popup.popupId);
      });
    }
  }
  act(() => {
    result.current.buyToaster(JOKES.toasterTile);
  });
  act(() => {
    result.current.nextObjective();
  });
}

// ...and on to task 5, through the update's reboot, where the bargain page
// springs open frozen.
function walkToFrozenTask(result: { current: ReturnType<typeof useGame> }) {
  walkToUpdateTask(result);
  act(() => {
    result.current.advanceUpdate();
  });
  act(() => {
    result.current.advanceUpdate();
  });
  act(() => {
    result.current.rebootUpdate();
  });
  act(() => {
    result.current.leavePowerScreen();
  });
  act(() => {
    result.current.leavePowerScreen();
  });
  act(() => {
    result.current.nextObjective();
  });
}

describe('useGame hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
    expect(result.current.shutdownOpen).toBe(false);
    // The game itself boots through the clouds splash.
    expect(result.current.powerScreen).toBe('splash');
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
      untitled: false,
      'untitled-2': false,
      'untitled-3': false,
      asdf: false,
      todo: false,
      recipe: false,
    });
    expect(result.current.openIconWindows).toEqual({
      computer: false,
      recycle: false,
      documents: false,
      notes: false,
      calculator: false,
      scanner: false,
      'other-note': false,
      untitled: false,
      'untitled-2': false,
      'untitled-3': false,
      asdf: false,
      todo: false,
      recipe: false,
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
      result.current.selectStartItem(startLeafItem('inbox'));
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
      result.current.selectStartItem(startLeafItem('inbox'));
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
    expect(result.current.messageVariant).toBe('joke');

    // The decoy "Inbox" shortcut: selecting stays silent.
    const mailIcon = DESKTOP_ICONS[5];

    act(() => {
      result.current.selectIcon(mailIcon);
    });
    expect(result.current.selectedIcon).toBe(mailIcon.id);
    expect(result.current.message).toBeNull();
    expect(result.current.grandmaLine).toBe(GRANDMA_LINES.intro);

    // Opening it errors out, and grandma explains over the system's shoulder.
    act(() => {
      result.current.openMailDecoy();
    });
    expect(result.current.message).toBe(JOKES.mailError);
    expect(result.current.messageVariant).toBe('error');
    expect(result.current.grandmaLine).toBe(GRANDMA_LINES.mailDecoy);
  });

  it('lets grandma re-read the current mission after a reaction', () => {
    const { result } = renderHook(() => useGame());

    // Get to task 2, whose instruction is not the intro line.
    act(() => {
      result.current.login(MAIL_PASSWORD);
    });
    act(() => {
      result.current.nextObjective();
    });
    expect(result.current.grandmaLine).toBe(OBJECTIVES[1].instruction);

    // The decoy reaction overwrites the mission...
    act(() => {
      result.current.openMailDecoy();
    });
    expect(result.current.grandmaLine).toBe(GRANDMA_LINES.mailDecoy);

    // ...and clicking grandma puts the current mission back.
    act(() => {
      result.current.repeatObjective();
    });
    expect(result.current.grandmaLine).toBe(OBJECTIVES[1].instruction);
  });

  it('puts the current mission in the dialog from Start > Help', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.login(MAIL_PASSWORD);
    });
    act(() => {
      result.current.nextObjective();
    });
    expect(result.current.message).toBeNull();

    // Start > Help re-reads whatever the current task is.
    act(() => {
      result.current.toggleStart();
    });
    act(() => {
      result.current.selectStartItem(startLeafItem('help'));
    });
    expect(result.current.startOpen).toBe(false);
    expect(result.current.message).toBe(OBJECTIVES[1].instruction);
    expect(result.current.messageVariant).toBe('info');
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
      result.current.selectStartItem(startLeafItem('shutdown'));
    });
    expect(result.current.startOpen).toBe(false);
    expect(result.current.shutdownOpen).toBe(true);
    expect(result.current.message).toBeNull();
    expect(result.current.grandmaLine).toBe(GRANDMA_LINES.shutDown);

    // Joke leaves still land in the System Message dialog; Programs cascades
    // now, so its old line lives on the Solitaire leaf.
    act(() => {
      result.current.toggleStart();
    });
    act(() => {
      result.current.selectStartItem(startLeaf('programs', 'solitaire'));
    });
    expect(result.current.startOpen).toBe(false);
    expect(result.current.message).toBe(JOKES.startPrograms);
  });

  it('opens an icon window from the Documents flyout leaf', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.toggleStart();
    });
    act(() => {
      result.current.selectStartItem(startLeaf('documents', 'my-documents'));
    });
    expect(result.current.startOpen).toBe(false);
    expect(result.current.openIconWindows.documents).toBe(true);
  });

  it('cancels the power dialog but keeps the protest standing', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.openShutdown();
    });
    expect(result.current.shutdownOpen).toBe(true);
    expect(result.current.grandmaLine).toBe(GRANDMA_LINES.shutDown);

    act(() => {
      result.current.closeShutdown();
    });
    expect(result.current.shutdownOpen).toBe(false);
    // Cancel never touches the power screen: the boot splash is still up.
    expect(result.current.powerScreen).toBe('splash');
    expect(result.current.grandmaLine).toBe(GRANDMA_LINES.shutDown);
    expect(pauseMusic).not.toHaveBeenCalled();
  });

  it('goes black on shutdown and wakes with the desktop untouched', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.openWindow('inbox');
    });
    act(() => {
      result.current.openShutdown();
    });
    act(() => {
      result.current.confirmShutdown('shutdown');
    });

    expect(result.current.shutdownOpen).toBe(false);
    expect(result.current.powerScreen).toBe('safe');
    expect(result.current.open.inbox).toBe(true);
    expect(result.current.grandmaLine).toBe(GRANDMA_LINES.shutDown);
    expect(play).toHaveBeenCalledWith('shutdown');
    expect(pauseMusic).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.leavePowerScreen();
    });

    // The safe line powers up through the clouds splash, state untouched —
    // but grandma swaps the protest for the wake line on the way up.
    expect(result.current.powerScreen).toBe('splash');
    expect(result.current.open.inbox).toBe(true);
    expect(result.current.grandmaLine).toBe(GRANDMA_LINES.powerBack);
    expect(play).not.toHaveBeenCalledWith('startup');

    act(() => {
      result.current.leavePowerScreen();
    });

    expect(result.current.powerScreen).toBeNull();
    expect(result.current.open.inbox).toBe(true);
    expect(play).toHaveBeenCalledWith('startup');
    expect(startMusic).toHaveBeenCalledTimes(1);
  });

  it('restarts behind the boot screen to a fresh desktop', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.openWindow('inbox');
    });
    act(() => {
      result.current.openIconWindow('notes');
    });
    act(() => {
      result.current.confirmShutdown('restart');
    });

    expect(result.current.powerScreen).toBe('boot');
    expect(result.current.open).toEqual({
      shopping: false,
      inbox: false,
      virus: false,
    });
    expect(result.current.openIconWindows.notes).toBe(false);
    expect(result.current.grandmaLine).toBe(GRANDMA_LINES.intro);
    expect(play).toHaveBeenCalledWith('shutdown');
    expect(pauseMusic).toHaveBeenCalledTimes(1);

    // The boot line hands off to the clouds splash; the chime waits for
    // the desktop, not for the middle of the sequence.
    act(() => {
      result.current.leavePowerScreen();
    });
    expect(result.current.powerScreen).toBe('splash');
    expect(play).not.toHaveBeenCalledWith('startup');

    act(() => {
      result.current.leavePowerScreen();
    });

    expect(result.current.powerScreen).toBeNull();
    expect(play).toHaveBeenCalledWith('startup');
    expect(startMusic).toHaveBeenCalledTimes(1);
  });

  it('boots through the clouds splash on load', () => {
    const { result } = renderHook(() => useGame());

    expect(result.current.powerScreen).toBe('splash');

    act(() => {
      result.current.leavePowerScreen();
    });

    expect(result.current.powerScreen).toBeNull();
    expect(play).toHaveBeenCalledWith('startup');
    expect(startMusic).toHaveBeenCalledTimes(1);
  });

  it('clears a half-open power dialog on play again', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.openShutdown();
    });
    act(() => {
      result.current.playAgain();
    });

    expect(result.current.shutdownOpen).toBe(false);
    expect(result.current.powerScreen).toBeNull();
    expect(result.current.grandmaLine).toBe(GRANDMA_LINES.intro);
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
      result.current.selectStartItem(startLeafItem('inbox'));
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

  it("only the note's password opens the mail gate", () => {
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

    // Task 4 opens the update dialog over the still-open desktop.
    act(() => {
      result.current.nextObjective();
    });
    expect(result.current.objectiveIndex).toBe(3);
    expect(result.current.updateStage).toBe('installing');
    expect(result.current.openPopups).toHaveLength(0);

    act(() => {
      result.current.advanceUpdate();
    });
    act(() => {
      result.current.advanceUpdate();
    });
    expect(result.current.updateStage).toBe('failed');

    // The reboot keeps every window exactly where the player left it.
    act(() => {
      result.current.rebootUpdate();
    });
    expect(result.current.powerScreen).toBe('boot');
    expect(result.current.phase).toBe('playing');

    act(() => {
      result.current.leavePowerScreen();
    });
    act(() => {
      result.current.leavePowerScreen();
    });
    expect(result.current.phase).toBe('taskDone');

    // Task 5 springs the bargain page open frozen.
    act(() => {
      result.current.nextObjective();
    });
    expect(result.current.objectiveIndex).toBe(4);
    expect(result.current.frozen.shopping).toBe(true);

    act(() => {
      result.current.endTask('shopping');
    });
    expect(result.current.phase).toBe('taskDone');
    expect(result.current.frozen.shopping).toBe(false);
    expect(result.current.open.shopping).toBe(false);

    // Task 6 floods every window again.
    act(() => {
      result.current.nextObjective();
    });
    expect(result.current.objectiveIndex).toBe(5);
    expect(result.current.openPopups).toHaveLength(9);
    expect(result.current.open.shopping).toBe(true);

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
    expect(result.current.updateStage).toBeNull();
    expect(result.current.frozen).toEqual({
      shopping: false,
      inbox: false,
      virus: false,
    });
    expect(result.current.taskManagerOpen).toBe(false);
    expect(result.current.openPopups).toEqual([]);
    expect(result.current.open).toEqual({
      shopping: false,
      inbox: false,
      virus: false,
    });
  });

  it('reboots for the update without losing any progress', () => {
    const { result } = renderHook(() => useGame());
    walkToUpdateTask(result);

    expect(result.current.objectiveIndex).toBe(3);
    expect(result.current.updateStage).toBe('installing');
    expect(result.current.grandmaLine).toBe(OBJECTIVES[3].instruction);
    expect(result.current.phase).toBe('playing');
    expect(result.current.loggedIn).toBe(true);
    expect(result.current.open).toEqual({
      shopping: true,
      inbox: true,
      virus: true,
    });

    act(() => {
      result.current.advanceUpdate();
    });
    expect(result.current.updateStage).toBe('restored');

    act(() => {
      result.current.advanceUpdate();
    });
    expect(result.current.updateStage).toBe('failed');

    // "Later" tells the joke and keeps the dialog in its seat.
    act(() => {
      result.current.laterUpdate();
    });
    expect(result.current.message).toBe(JOKES.updateLater);
    expect(result.current.updateStage).toBe('failed');
    expect(result.current.phase).toBe('playing');

    // Restart now: black line, music off, nothing else touched.
    act(() => {
      result.current.rebootUpdate();
    });
    expect(result.current.powerScreen).toBe('boot');
    expect(result.current.updateStage).toBeNull();
    expect(result.current.objectiveIndex).toBe(3);
    expect(result.current.phase).toBe('playing');
    expect(result.current.open).toEqual({
      shopping: true,
      inbox: true,
      virus: true,
    });
    expect(play).toHaveBeenCalledWith('shutdown');
    expect(pauseMusic).toHaveBeenCalledTimes(1);

    // The boot line hands over to the clouds; progress waits behind them.
    act(() => {
      result.current.leavePowerScreen();
    });
    expect(result.current.powerScreen).toBe('splash');
    expect(result.current.phase).toBe('playing');

    // The desktop's reveal is what finishes the task.
    act(() => {
      result.current.leavePowerScreen();
    });
    expect(result.current.powerScreen).toBeNull();
    expect(result.current.phase).toBe('taskDone');
    // The joke from "Later" is gone; the win screen carries the done copy.
    expect(result.current.message).toBeNull();
    expect(play).toHaveBeenCalledWith('startup');
  });

  it('freezes the bargain page until End Task puts it down', () => {
    const { result } = renderHook(() => useGame());
    walkToFrozenTask(result);

    expect(result.current.objectiveIndex).toBe(4);
    expect(result.current.grandmaLine).toBe(OBJECTIVES[4].instruction);
    expect(result.current.open.shopping).toBe(true);
    expect(result.current.frozen).toEqual({
      shopping: true,
      inbox: false,
      virus: false,
    });

    // The frozen window lands on top, then ignores every raise.
    expect(result.current.zOrder[result.current.zOrder.length - 1]).toBe(
      'shopping',
    );
    act(() => {
      result.current.raise('inbox');
    });
    expect(result.current.zOrder[result.current.zOrder.length - 1]).toBe(
      'inbox',
    );
    act(() => {
      result.current.raise('shopping');
    });
    expect(result.current.zOrder[result.current.zOrder.length - 1]).toBe(
      'inbox',
    );

    // Taskbar presses are dead weight, too.
    act(() => {
      result.current.activateWindow('shopping');
    });
    expect(result.current.minimized.shopping).toBe(false);
    expect(result.current.zOrder[result.current.zOrder.length - 1]).toBe(
      'inbox',
    );

    // Poking it trades grandma's line for a diagnosis.
    act(() => {
      result.current.reactFrozen();
    });
    expect(result.current.grandmaLine).toBe(GRANDMA_LINES.frozen);

    // The task list interrupts, and End Task on a healthy window just jokes.
    act(() => {
      result.current.openTaskManager();
    });
    expect(result.current.taskManagerOpen).toBe(true);
    act(() => {
      result.current.endTask('inbox');
    });
    expect(result.current.message).toBe(JOKES.endTaskAlive);
    expect(result.current.open.inbox).toBe(true);
    expect(result.current.frozen.inbox).toBe(false);
    expect(result.current.phase).toBe('playing');
    expect(result.current.taskManagerOpen).toBe(true);

    // End Task on the frozen one kills it and finishes the task.
    act(() => {
      result.current.endTask('shopping');
    });
    expect(result.current.open.shopping).toBe(false);
    expect(result.current.frozen).toEqual({
      shopping: false,
      inbox: false,
      virus: false,
    });
    expect(result.current.taskManagerOpen).toBe(false);
    expect(result.current.phase).toBe('taskDone');
    expect(result.current.message).toBeNull();
  });

  it('opens the task manager from Start and cancels it again', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.showJoke(JOKES.toasterTile);
    });
    // Start > Task Manager opens the task list dialog.
    act(() => {
      result.current.toggleStart();
    });
    act(() => {
      result.current.selectStartItem(startLeafItem('task-manager'));
    });
    expect(result.current.startOpen).toBe(false);
    expect(result.current.taskManagerOpen).toBe(true);
    // It interrupts whatever dialog was up.
    expect(result.current.message).toBeNull();

    // Its own Shut Down button runs the real shutdown flow.
    act(() => {
      result.current.shutDownFromTaskManager();
    });
    expect(result.current.taskManagerOpen).toBe(false);
    expect(result.current.shutdownOpen).toBe(true);

    act(() => {
      result.current.closeShutdown();
    });
    act(() => {
      result.current.openTaskManager();
    });
    expect(result.current.taskManagerOpen).toBe(true);
    act(() => {
      result.current.closeTaskManager();
    });
    expect(result.current.taskManagerOpen).toBe(false);
  });

  it('opens the task manager on the three-key chord where the browser delivers it', () => {
    const { result } = renderHook(() => useGame());

    // The splash owns the screen: the chord would only open behind the clouds.
    fireEvent.keyDown(document, { key: 'Delete', ctrlKey: true, altKey: true });
    expect(result.current.taskManagerOpen).toBe(false);

    act(() => {
      result.current.leavePowerScreen();
    });
    expect(result.current.powerScreen).toBeNull();

    // Plain keys and half-modified presses stay quiet.
    fireEvent.keyDown(document, { key: 'Delete' });
    expect(result.current.taskManagerOpen).toBe(false);
    fireEvent.keyDown(document, { key: 'Delete', ctrlKey: true });
    expect(result.current.taskManagerOpen).toBe(false);
    fireEvent.keyDown(document, { key: 'a', ctrlKey: true, altKey: true });
    expect(result.current.taskManagerOpen).toBe(false);

    // The ritual itself, on both Delete keys keyboards send.
    fireEvent.keyDown(document, { key: 'Delete', ctrlKey: true, altKey: true });
    expect(result.current.taskManagerOpen).toBe(true);

    act(() => {
      result.current.closeTaskManager();
    });
    fireEvent.keyDown(document, {
      key: 'Backspace',
      ctrlKey: true,
      altKey: true,
    });
    expect(result.current.taskManagerOpen).toBe(true);
  });

  it('keeps the chord out of task screens and the power dialogs', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.leavePowerScreen();
    });
    act(() => {
      result.current.login(MAIL_PASSWORD);
    });
    expect(result.current.phase).toBe('taskDone');
    fireEvent.keyDown(document, { key: 'Delete', ctrlKey: true, altKey: true });
    expect(result.current.taskManagerOpen).toBe(false);

    act(() => {
      result.current.nextObjective();
    });
    act(() => {
      result.current.openShutdown();
    });
    fireEvent.keyDown(document, { key: 'Delete', ctrlKey: true, altKey: true });
    expect(result.current.taskManagerOpen).toBe(false);
    expect(result.current.shutdownOpen).toBe(true);
  });

  it('blocks the order only while the sale page is buried', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.login(MAIL_PASSWORD);
    });
    act(() => {
      result.current.nextObjective();
    });
    act(() => {
      result.current.openEmail();
    });
    act(() => {
      result.current.nextObjective();
    });
    expect(result.current.objectiveIndex).toBe(2);

    // The first click storms all three windows.
    act(() => {
      result.current.buyToaster(JOKES.toasterTile);
    });
    expect(result.current.openPopups).toHaveLength(12);

    // Clear only the sale page's pop-ups.
    const salePagePopups = result.current.openPopups.filter(
      (popup) => popup.windowId === 'shopping',
    );
    for (const popup of salePagePopups) {
      act(() => {
        result.current.dismissPopup(popup.key, popup.popupId);
      });
    }
    expect(result.current.openPopups).toHaveLength(7);

    // The other windows are still buried, but the order goes through.
    act(() => {
      result.current.buyToaster(JOKES.toasterTile);
    });
    expect(result.current.phase).toBe('taskDone');
    expect(result.current.openPopups).toHaveLength(7);
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
