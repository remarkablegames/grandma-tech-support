import { useRef, useState } from 'react';
import {
  BASE_VIEWPORT,
  BASE_WINDOW_POSITIONS,
  BUY_STORM,
  GRANDMA_LINES,
  ICON_WINDOW_BASE_POSITION,
  ICON_WINDOWS,
  JOKES,
  MAIL_PASSWORD,
  MAX_POPUPS_PER_WINDOW,
  OBJECTIVES,
} from 'src/data/gameContent';
import { audio } from 'src/services/audio';
import type {
  DesktopIconConfig,
  GamePhase,
  IconWindowId,
  MessageVariant,
  ObjectiveEvent,
  OpenPopup,
  PopupButtonConfig,
  PopupId,
  PopupSpawn,
  PowerScreenMode,
  ShutdownMode,
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

// The desktop starts blank: every browser window is closed until a task's
// spring-back or the Start menu opens it.
const INITIAL_WINDOW_OPEN: Record<WindowId, boolean> = {
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
  scanner: false,
  'other-note': false,
  untitled: false,
  'untitled-2': false,
  'untitled-3': false,
  asdf: false,
  todo: false,
  recipe: false,
};

function getInitialIconWindowPositions(): Record<IconWindowId, WindowPosition> {
  return {
    computer: ICON_WINDOW_BASE_POSITION,
    recycle: ICON_WINDOW_BASE_POSITION,
    documents: ICON_WINDOW_BASE_POSITION,
    notes: ICON_WINDOW_BASE_POSITION,
    calculator: ICON_WINDOW_BASE_POSITION,
    scanner: ICON_WINDOW_BASE_POSITION,
    'other-note': ICON_WINDOW_BASE_POSITION,
    untitled: ICON_WINDOW_BASE_POSITION,
    'untitled-2': ICON_WINDOW_BASE_POSITION,
    'untitled-3': ICON_WINDOW_BASE_POSITION,
    asdf: ICON_WINDOW_BASE_POSITION,
    todo: ICON_WINDOW_BASE_POSITION,
    recipe: ICON_WINDOW_BASE_POSITION,
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
  const [openPopups, setOpenPopups] = useState<OpenPopup[]>([]);
  const [systemMessage, setSystemMessage] = useState<string | null>(null);
  const [messageVariant, setMessageVariant] = useState<MessageVariant>('joke');

  // The power screens: the Shut Down dialog, and which full-screen boot beat
  // (if any) covers the desktop on top of everything. The game itself boots
  // through the clouds splash, so that's where the screen state starts.
  const [shutdownOpen, setShutdownOpen] = useState(false);
  const [powerScreen, setPowerScreen] = useState<PowerScreenMode | null>(
    'splash',
  );

  // Jokes keep grandma's 😅 dialog; error copy opts into the red X and ding.
  const setMessage = (
    text: string | null,
    variant: MessageVariant = 'joke',
  ) => {
    setSystemMessage(text);
    setMessageVariant(variant);
  };
  const [grandmaLine, setGrandmaLine] = useState<string>(GRANDMA_LINES.intro);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [startOpen, setStartOpen] = useState(false);
  const [open, setOpen] =
    useState<Record<WindowId, boolean>>(INITIAL_WINDOW_OPEN);
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

  // The mission chain: which task is active, whether the mail gate is open,
  // and whether the task-3 ad storm has been unleashed yet.
  const [objectiveIndex, setObjectiveIndex] = useState(0);
  const [loggedIn, setLoggedIn] = useState(false);
  const [stormTriggered, setStormTriggered] = useState(false);

  const spawnCounter = useRef(0);

  // Closed and minimized windows can't hold focus, so the top visible
  // window is active.
  const focusedId: WindowId | undefined = zOrder
    .filter((id) => open[id] && !minimized[id])
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

  // Opening a browser window (Start menu or a task's spring-back) shows it
  // fresh and raises it.
  const openWindow = (windowId: WindowId) => {
    setOpen((prev) => ({ ...prev, [windowId]: true }));
    setMinimized((prev) => ({ ...prev, [windowId]: false }));
    raise(windowId);
  };

  // Closing takes the window's pop-ups down with it, the way closing a real
  // page clears whatever it piled up.
  const closeWindow = (windowId: WindowId) => {
    setOpen((prev) => ({ ...prev, [windowId]: false }));
    setMinimized((prev) => ({ ...prev, [windowId]: false }));
    setOpenPopups((prev) =>
      prev.filter((popup) => popup.windowId !== windowId),
    );
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

  const onCurrentObjective = (event: ObjectiveEvent): boolean =>
    OBJECTIVES[objectiveIndex].completesOn === event;

  // Finishing a task clears any joke dialog and pauses on the interstitial
  // screen — except the last task, which ends the game.
  const completeObjective = (event: ObjectiveEvent): boolean => {
    if (phase !== 'playing' || !onCurrentObjective(event)) {
      return false;
    }

    setMessage(null);
    setPhase(objectiveIndex === OBJECTIVES.length - 1 ? 'won' : 'taskDone');
    return true;
  };

  // Objective storms spring their windows back open and land on top, capped
  // at MAX_POPUPS_PER_WINDOW per window.
  const addSpawns = (spawns: PopupSpawn[] | undefined) => {
    if (spawns === undefined) {
      return;
    }

    for (const spawn of spawns) {
      openWindow(spawn.windowId);
    }

    setOpenPopups((prev) => {
      const next = [...prev];

      for (const spawn of spawns) {
        const used = next.filter(
          (popup) => popup.windowId === spawn.windowId,
        ).length;
        const amount = Math.min(
          spawn.count,
          Math.max(MAX_POPUPS_PER_WINDOW - used, 0),
        );

        for (let i = 0; i < amount; i += 1) {
          spawnCounter.current += 1;
          next.push({
            key: `${spawn.popupId}-${String(spawnCounter.current)}`,
            popupId: spawn.popupId,
            windowId: spawn.windowId,
          });
        }
      }

      return next;
    });
  };

  const nextObjective = () => {
    const next = objectiveIndex + 1;

    setObjectiveIndex(next);
    setPhase('playing');
    setMessage(null);
    setGrandmaLine(OBJECTIVES[next].instruction);

    for (const windowId of OBJECTIVES[next].open ?? []) {
      openWindow(windowId);
    }

    addSpawns(OBJECTIVES[next].spawn);
  };

  // Only the password from the other note opens the mail gate.
  const login = (password: string): boolean => {
    if (password !== MAIL_PASSWORD) {
      return false;
    }

    setLoggedIn(true);
    completeObjective('logged-in');
    return true;
  };

  const buyToaster = (joke: string) => {
    if (!onCurrentObjective('order-placed')) {
      setMessage(joke);
      return;
    }

    if (!stormTriggered) {
      setStormTriggered(true);
      setMessage(joke);
      addSpawns(BUY_STORM);
      return;
    }

    // Only the sale page's own pop-ups block the order.
    if (openPopups.some((popup) => popup.windowId === 'shopping')) {
      setMessage(JOKES.buyBlocked);
      return;
    }

    completeObjective('order-placed');
  };

  // A completed scan sweeps the whole desktop's pop-ups away.
  const completeScan = () => {
    if (completeObjective('scan-complete')) {
      setOpenPopups([]);
    }
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
        spawnCounter.current += 1;
        return {
          key: `spam-${String(spawnCounter.current)}`,
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
    completeObjective('email-opened');
  };

  const playAgain = () => {
    spawnCounter.current = 0;
    setPhase('playing');
    setZOrder(INITIAL_Z_ORDER);
    setPositions(getInitialPositions());
    setOpenPopups([]);
    setMessage(null);
    setGrandmaLine(GRANDMA_LINES.intro);
    setSelectedIcon(null);
    setStartOpen(false);
    setOpen(INITIAL_WINDOW_OPEN);
    setMinimized(INITIAL_WINDOW_FLAGS);
    setMaximized(INITIAL_WINDOW_FLAGS);
    setOpenIconWindows(INITIAL_ICON_WINDOW_FLAGS);
    setIconWindowPositions(getInitialIconWindowPositions());
    setIconZOrder([]);
    setIconMinimized(INITIAL_ICON_WINDOW_FLAGS);
    setObjectiveIndex(0);
    setLoggedIn(false);
    setStormTriggered(false);
    setShutdownOpen(false);
    setPowerScreen(null);
  };

  // Start > Shut Down... : grandma protests in the bubble (the dialog itself
  // stays plain Win95), and Cancel leaves her protest standing.
  const openShutdown = () => {
    setGrandmaLine(GRANDMA_LINES.shutDown);
    setShutdownOpen(true);
  };

  const closeShutdown = () => {
    setShutdownOpen(false);
  };

  // Both exits go black with the power sound and the theme paused; only
  // restart resets the desktop, and it does so behind the screens so the
  // player never catches the swap.
  const confirmShutdown = (mode: ShutdownMode) => {
    setShutdownOpen(false);
    audio.play('shutdown');
    audio.pauseMusic();

    if (mode === 'restart') {
      playAgain();
    }

    setPowerScreen(mode === 'restart' ? 'boot' : 'safe');
  };

  // Leaving a power screen: the boot line advances to the clouds splash;
  // everything else brings the desktop back with the startup sound and the
  // theme — the safe line over untouched state, the splash over a reset.
  const leavePowerScreen = () => {
    if (powerScreen === 'boot') {
      setPowerScreen('splash');
      return;
    }

    setPowerScreen(null);
    audio.play('startup');
    audio.startMusic();
  };

  const selectIcon = (icon: DesktopIconConfig) => {
    setSelectedIcon(icon.id);
  };

  // The mail shortcut fails the Win95 way: only when you try to open it.
  const openMailDecoy = () => {
    setMessage(JOKES.mailError, 'error');
    setGrandmaLine(GRANDMA_LINES.mailDecoy);
  };

  // Reactions overwrite grandma's line, so clicking her bubble puts the
  // current mission back in her mouth.
  const repeatObjective = () => {
    setGrandmaLine(OBJECTIVES[objectiveIndex].instruction);
  };

  const toggleStart = () => {
    setStartOpen((open) => !open);
  };

  const selectStartItem = (item: StartMenuItem) => {
    setStartOpen(false);

    if ('windowId' in item) {
      openWindow(item.windowId);
      return;
    }

    if ('action' in item) {
      if (item.action === 'shutdown') {
        openShutdown();
        return;
      }

      setMessage(OBJECTIVES[objectiveIndex].instruction, 'info');
      return;
    }

    setMessage(item.message);
  };

  return {
    phase,
    objectiveIndex,
    loggedIn,
    stormTriggered,
    focusedId,
    zOrder,
    positions,
    open,
    minimized,
    maximized,
    openIconWindows,
    iconWindowPositions,
    iconZOrder,
    iconMinimized,
    iconFocusedId,
    openPopups,
    message: systemMessage,
    messageVariant,
    grandmaLine,
    selectedIcon,
    startOpen,
    shutdownOpen,
    powerScreen,
    raise,
    moveWindow,
    minimize,
    toggleMaximize,
    activateWindow,
    openWindow,
    closeWindow,
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
    login,
    buyToaster,
    completeScan,
    nextObjective,
    playAgain,
    selectIcon,
    openMailDecoy,
    repeatObjective,
    toggleStart,
    selectStartItem,
    openShutdown,
    closeShutdown,
    confirmShutdown,
    leavePowerScreen,
  };
}
