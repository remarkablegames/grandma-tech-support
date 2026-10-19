import { useRef, useState } from 'react';
import {
  BASE_VIEWPORT,
  BASE_WINDOW_POSITIONS,
  GRANDMA_LINES,
  ICON_WINDOW_BASE_POSITION,
  ICON_WINDOWS,
  INITIAL_POPUPS,
  MAX_POPUPS_PER_WINDOW,
} from 'src/data/gameContent';
import type {
  DesktopIconConfig,
  GamePhase,
  IconWindowId,
  OpenPopup,
  PopupButtonConfig,
  PopupId,
  StartMenuItem,
  WindowId,
  WindowPosition,
} from 'src/types/game';

const INITIAL_Z_ORDER: WindowId[] = ['inbox', 'shopping', 'virus'];

const INITIAL_WINDOW_FLAGS: Record<WindowId, boolean> = {
  shopping: false,
  inbox: false,
  virus: false,
};

const ICON_WINDOW_CASCADE_STEP = 24;

const INITIAL_ICON_WINDOW_FLAGS: Record<IconWindowId, boolean> = {
  computer: false,
  recycle: false,
  documents: false,
  notes: false,
  calculator: false,
};

function getInitialIconWindowPositions(): Record<IconWindowId, WindowPosition> {
  return {
    computer: ICON_WINDOW_BASE_POSITION,
    recycle: ICON_WINDOW_BASE_POSITION,
    documents: ICON_WINDOW_BASE_POSITION,
    notes: ICON_WINDOW_BASE_POSITION,
    calculator: ICON_WINDOW_BASE_POSITION,
  };
}

function scalePosition(
  position: WindowPosition,
  scale: number,
): WindowPosition {
  return {
    x: Math.round(position.x * scale),
    y: Math.round(position.y * scale),
  };
}

function getInitialPositions(): Record<WindowId, WindowPosition> {
  const scale = Math.min(
    window.innerWidth / BASE_VIEWPORT.width,
    window.innerHeight / BASE_VIEWPORT.height,
  );

  return {
    shopping: scalePosition(BASE_WINDOW_POSITIONS.shopping, scale),
    inbox: scalePosition(BASE_WINDOW_POSITIONS.inbox, scale),
    virus: scalePosition(BASE_WINDOW_POSITIONS.virus, scale),
  };
}

export function useGame() {
  const [phase, setPhase] = useState<GamePhase>('playing');
  const [zOrder, setZOrder] = useState<WindowId[]>(INITIAL_Z_ORDER);
  const [positions, setPositions] =
    useState<Record<WindowId, WindowPosition>>(getInitialPositions);
  const [openPopups, setOpenPopups] = useState<OpenPopup[]>(INITIAL_POPUPS);
  const [message, setMessage] = useState<string | null>(null);
  const [grandmaLine, setGrandmaLine] = useState<string>(GRANDMA_LINES.intro);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [startOpen, setStartOpen] = useState(false);
  const [minimized, setMinimized] =
    useState<Record<WindowId, boolean>>(INITIAL_WINDOW_FLAGS);
  const [maximized, setMaximized] =
    useState<Record<WindowId, boolean>>(INITIAL_WINDOW_FLAGS);
  const [openIconWindows, setOpenIconWindows] = useState<
    Record<IconWindowId, boolean>
  >(INITIAL_ICON_WINDOW_FLAGS);
  const [iconWindowPositions, setIconWindowPositions] = useState<
    Record<IconWindowId, WindowPosition>
  >(getInitialIconWindowPositions);
  const [iconZOrder, setIconZOrder] = useState<IconWindowId[]>([]);
  const [iconMinimized, setIconMinimized] = useState<
    Record<IconWindowId, boolean>
  >(INITIAL_ICON_WINDOW_FLAGS);
  const spamCounter = useRef(0);

  // A minimized window can't hold focus, so the top visible window is active.
  const focusedId: WindowId | undefined = zOrder
    .filter((id) => !minimized[id])
    .at(-1);
  const iconFocusedId: IconWindowId | undefined = iconZOrder
    .filter((id) => !iconMinimized[id])
    .at(-1);

  const raise = (windowId: WindowId) => {
    setZOrder((prev) => [...prev.filter((id) => id !== windowId), windowId]);
  };

  const minimize = (windowId: WindowId) => {
    setMinimized((prev) => ({ ...prev, [windowId]: true }));
  };

  const toggleMaximize = (windowId: WindowId) => {
    setMaximized((prev) => ({ ...prev, [windowId]: !prev[windowId] }));
  };

  // Win95 taskbar toggle: the active window's button minimizes it, any
  // other button restores and activates.
  const activateWindow = (windowId: WindowId) => {
    if (windowId === focusedId) {
      minimize(windowId);
      return;
    }

    setMinimized((prev) => ({ ...prev, [windowId]: false }));
    raise(windowId);
  };

  const moveWindow = (windowId: WindowId, position: WindowPosition) => {
    setPositions((prev) => {
      const next = { ...prev };
      next[windowId] = position;
      return next;
    });
  };

  const raiseIconWindow = (windowId: IconWindowId) => {
    setIconZOrder((prev) => [
      ...prev.filter((id) => id !== windowId),
      windowId,
    ]);
  };

  const minimizeIconWindow = (windowId: IconWindowId) => {
    setIconMinimized((prev) => ({ ...prev, [windowId]: true }));
  };

  const activateIconWindow = (windowId: IconWindowId) => {
    if (windowId === iconFocusedId) {
      minimizeIconWindow(windowId);
      return;
    }

    setIconMinimized((prev) => ({ ...prev, [windowId]: false }));
    raiseIconWindow(windowId);
  };

  const moveIconWindow = (windowId: IconWindowId, position: WindowPosition) => {
    setIconWindowPositions((prev) => ({ ...prev, [windowId]: position }));
  };

  const openIconWindow = (windowId: IconWindowId) => {
    if (!openIconWindows[windowId]) {
      const openCount = ICON_WINDOWS.filter(
        (config) => openIconWindows[config.id],
      ).length;

      moveIconWindow(windowId, {
        x: ICON_WINDOW_BASE_POSITION.x + openCount * ICON_WINDOW_CASCADE_STEP,
        y: ICON_WINDOW_BASE_POSITION.y + openCount * ICON_WINDOW_CASCADE_STEP,
      });
    }

    setOpenIconWindows((prev) => ({ ...prev, [windowId]: true }));
    setIconMinimized((prev) => ({ ...prev, [windowId]: false }));
    raiseIconWindow(windowId);
  };

  const closeIconWindow = (windowId: IconWindowId) => {
    setOpenIconWindows((prev) => ({ ...prev, [windowId]: false }));
    setIconZOrder((prev) => prev.filter((id) => id !== windowId));
  };

  const showJoke = (joke: string) => {
    setMessage(joke);
  };

  const dismissJoke = () => {
    setMessage(null);
  };

  const popupAction = (windowId: WindowId, button: PopupButtonConfig) => {
    setMessage(button.message);

    const spawns = button.spawns ?? 0;

    setOpenPopups((prev) => {
      const count = prev.filter((popup) => popup.windowId === windowId).length;
      const amount = Math.min(
        spawns,
        Math.max(MAX_POPUPS_PER_WINDOW - count, 0),
      );
      const extras: OpenPopup[] = Array.from({ length: amount }, () => {
        spamCounter.current += 1;
        return {
          key: `spam-${String(spamCounter.current)}`,
          popupId: 'spam',
          windowId,
        };
      });
      return [...prev, ...extras];
    });
  };

  const dismissPopup = (key: string, popupId: PopupId) => {
    setOpenPopups((prev) => prev.filter((popup) => popup.key !== key));

    if (popupId === 'full') {
      setGrandmaLine(GRANDMA_LINES.correctClose);
    }
  };

  const openEmail = () => {
    setPhase('won');
  };

  const playAgain = () => {
    spamCounter.current = 0;
    setPhase('playing');
    setZOrder(INITIAL_Z_ORDER);
    setPositions(getInitialPositions());
    setOpenPopups(INITIAL_POPUPS);
    setMessage(null);
    setGrandmaLine(GRANDMA_LINES.intro);
    setSelectedIcon(null);
    setStartOpen(false);
    setMinimized(INITIAL_WINDOW_FLAGS);
    setMaximized(INITIAL_WINDOW_FLAGS);
    setOpenIconWindows(INITIAL_ICON_WINDOW_FLAGS);
    setIconWindowPositions(getInitialIconWindowPositions());
    setIconZOrder([]);
    setIconMinimized(INITIAL_ICON_WINDOW_FLAGS);
  };

  const selectIcon = (icon: DesktopIconConfig) => {
    setSelectedIcon(icon.id);

    if (icon.decoy) {
      setGrandmaLine(GRANDMA_LINES.mailDecoy);
    }
  };

  const toggleStart = () => {
    setStartOpen((open) => !open);
  };

  const selectStartItem = (item: StartMenuItem) => {
    setStartOpen(false);
    setMessage(item.message);
  };

  return {
    phase,
    focusedId,
    zOrder,
    positions,
    minimized,
    maximized,
    openIconWindows,
    iconWindowPositions,
    iconZOrder,
    iconMinimized,
    iconFocusedId,
    openPopups,
    message,
    grandmaLine,
    selectedIcon,
    startOpen,
    raise,
    moveWindow,
    minimize,
    toggleMaximize,
    activateWindow,
    openIconWindow,
    closeIconWindow,
    raiseIconWindow,
    moveIconWindow,
    minimizeIconWindow,
    activateIconWindow,
    showJoke,
    dismissJoke,
    popupAction,
    dismissPopup,
    openEmail,
    playAgain,
    selectIcon,
    toggleStart,
    selectStartItem,
  };
}
