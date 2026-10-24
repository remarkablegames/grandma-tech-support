import { useEffect, useRef, useState } from 'react';
import {
  BASE_VIEWPORT,
  BASE_WINDOW_POSITIONS,
  BUY_STORM,
  DESKTOP_ICONS,
  EMAILS,
  GRANDMA_LINES,
  ICON_WINDOW_BASE_POSITION,
  ICON_WINDOWS,
  JOKES,
  JUNK_EMAILS,
  MAIL_PASSWORD,
  MAX_ADDED_JUNK,
  MAX_POPUPS_PER_WINDOW,
  OBJECTIVES,
  TASK_FILES,
} from 'src/data/gameContent';
import { audio } from 'src/services/audio';
import type {
  DesktopIconConfig,
  EmailConfig,
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
  StartMenuLeafItem,
  UpdateStage,
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

// Junk is every email that isn't the grandkids' one.
const isJunk = (email: EmailConfig): boolean => !email.target;

// The junk pool's ids: these are the rows that can breed, and they're the
// only ones that count toward the cap (four at a time, at most).
const JUNK_IDS = new Set(JUNK_EMAILS.map((email) => email.id));

// Reading the junk makes more of it: two more land at the bottom, from the
// pool, until the box is full of them. Deleting junk frees the room again.
const withJunk = (list: EmailConfig[], amount: number): EmailConfig[] => {
  const added = list.filter((email) => JUNK_IDS.has(email.id)).length;
  const room = Math.max(MAX_ADDED_JUNK - added, 0);
  const next = JUNK_EMAILS.filter(
    (entry) => !list.some((email) => email.id === entry.id),
  ).slice(0, Math.min(amount, room));

  return next.length === 0 ? list : [...list, ...next];
};

// The cleanup task makes sure there's junk to clean: a player who swept
// the box early gets the junk back, "they keep coming".
const topUpJunk = (list: EmailConfig[], wanted: number): EmailConfig[] => {
  const have = list.filter(isJunk).length;

  return withJunk(list, wanted - have);
};

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

  // The task chain: which task is active, whether the mail gate is open,
  // and whether the task-3 ad storm has been unleashed yet.
  const [objectiveIndex, setObjectiveIndex] = useState(0);
  const [loggedIn, setLoggedIn] = useState(false);
  const [stormTriggered, setStormTriggered] = useState(false);

  // The inbox's mail: starts as the catalog, grows when junk gets opened,
  // shrinks when junk gets deleted. The grandkids' email never goes.
  const [emails, setEmails] = useState<EmailConfig[]>(EMAILS);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  // The ad window that refuses to close: the first two × presses answer
  // with a joke and a fresh pop-up. Resets at the next task.
  const MAX_CLINGY_CLOSES = 2;
  const [clingyCloses, setClingyCloses] = useState(0);

  // The late-task state: task 4's update dialog, task 5's frozen windows
  // (dead to every input until End Task) and the Task Manager dialog, plus
  // the completion event queued behind the update reboot's clouds.
  const [updateStage, setUpdateStage] = useState<UpdateStage | null>(null);
  const [frozen, setFrozen] =
    useState<Record<WindowId, boolean>>(INITIAL_WINDOW_FLAGS);
  const [taskManagerOpen, setTaskManagerOpen] = useState(false);
  const [pendingEvent, setPendingEvent] = useState<ObjectiveEvent | null>(null);
  // The finale's Disk Defragmenter: Start > Programs opens it any time, and
  // only a finished run's Exit ends the disk-full task.
  const [defragOpen, setDefragOpen] = useState(false);

  const spawnCounter = useRef(0);

  // Closed and minimized windows can't hold focus, so the top visible
  // window is active.
  const focusedId: WindowId | undefined = zOrder
    .filter((id) => open[id] && !minimized[id])
    .at(-1);
  const iconFocusedId: IconWindowId | undefined = iconZOrder
    .filter((id) => !iconMinimized[id])
    .at(-1);

  // A frozen window ignores raises: clicks slide off it the way a hung
  // Win95 window eats input, until End Task puts it out of its misery.
  const raise = (windowId: WindowId) => {
    if (frozen[windowId]) {
      return;
    }

    setZOrder((prev) => [...prev.filter((id) => id !== windowId), windowId]);
  };

  const minimize = (windowId: WindowId) => {
    setMinimized((prev) => ({ ...prev, [windowId]: true }));
  };

  const toggleMaximize = (windowId: WindowId) => {
    setMaximized((prev) => ({ ...prev, [windowId]: !prev[windowId] }));
  };

  // Win95 taskbar toggle: the active window's button minimizes it, any
  // other button restores and activates. Frozen windows do neither.
  const activateWindow = (windowId: WindowId) => {
    if (frozen[windowId]) {
      return;
    }

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

  // The chrome's ×: the order task's sale page refuses the first couple of
  // closes, answering with a joke and a fresh pop-up, the way adware pages
  // did — only after that does the window really close. End Task never
  // comes through here, so the frozen page still dies for real.
  const closeViaChrome = (windowId: WindowId) => {
    const clingy = OBJECTIVES[objectiveIndex].clingy;

    if (
      clingy !== undefined &&
      clingy.includes(windowId) &&
      clingyCloses < MAX_CLINGY_CLOSES
    ) {
      setClingyCloses((count) => count + 1);
      setMessage(JOKES.closeSticks);
      addSpawns([{ windowId, popupId: 'spam', count: 1 }]);
      return;
    }

    closeWindow(windowId);
  };

  const nextObjective = () => {
    const next = objectiveIndex + 1;
    const config = OBJECTIVES[next];

    setObjectiveIndex(next);
    setPhase('playing');
    setMessage(null);
    setGrandmaLine(config.instruction);

    // Each task starts fresh on the clingy-window counter.
    setClingyCloses(0);

    // Spring windows open first, freeze second, so a frozen window still
    // lands on top the way any freshly opened window would.
    for (const windowId of config.open ?? []) {
      openWindow(windowId);
    }

    // The inbox-cleanout task clears any pop-ups left from earlier tasks
    // first, so the mail list starts readable.
    if (config.clearPopups) {
      setOpenPopups([]);
    }

    if (config.update) {
      setUpdateStage('installing');
    }

    // The disk-full task's error takes over the way the update dialog does:
    // grandma clicked Toaster Setup, and Drive C: has 4 bytes left.
    if (config.lowDisk) {
      setMessage(JOKES.diskFull, 'error');
    }

    // The inbox-cleanout task tops the junk back up to at least this many
    // rows, so a player who swept early still has work to do.
    if (config.inboxTopUp !== undefined) {
      const wanted = config.inboxTopUp;
      setEmails((prev) => topUpJunk(prev, wanted));
      setSelectedEmail(null);
    }

    const freeze = config.freeze;

    if (freeze !== undefined) {
      setFrozen((prev) => {
        const flags = { ...prev };

        for (const windowId of freeze) {
          flags[windowId] = true;
        }

        return flags;
      });
    }

    addSpawns(config.spawn);
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

  // Task 4's update dialog advances only on clicks: the 99% stall, the
  // rollback gag, then the failure that asks for a reboot. "Later" never
  // gets rid of it.
  const advanceUpdate = () => {
    if (updateStage === 'installing') {
      setUpdateStage('restored');
      return;
    }

    setUpdateStage('failed');
  };

  const laterUpdate = () => {
    setMessage(JOKES.updateLater);
  };

  // The reboot the update asks for: everything the player did stays put
  // behind the boot line and clouds, and the task completes when the
  // desktop comes back — unlike Start > Shut Down > Restart, which resets.
  const rebootUpdate = () => {
    setUpdateStage(null);
    setPendingEvent('update-rebooted');
    audio.play('shutdown');
    audio.pauseMusic();
    setPowerScreen('boot');
  };

  // Poking a frozen window trades focus for grandma's diagnosis instead.
  const reactFrozen = () => {
    setGrandmaLine(GRANDMA_LINES.frozen);
  };

  // End Task from the Task Manager list: healthy windows joke, the frozen
  // one dies for real and finishes the force-quit task.
  const endTask = (windowId: WindowId) => {
    if (!frozen[windowId]) {
      setMessage(JOKES.endTaskAlive);
      return;
    }

    setTaskManagerOpen(false);
    setFrozen((prev) => ({ ...prev, [windowId]: false }));
    closeWindow(windowId);
    completeObjective('frozen-ended');
  };

  // Task 7's milestones: grandma talks the player through the beats — the
  // bin still holds the space, then the drive has room — but only the
  // defragmenter's finished run completes the task.
  const noteDiskMilestone = (kind: 'binned' | 'emptied') => {
    if (phase !== 'playing' || !onCurrentObjective('defrag-done')) {
      return;
    }

    setGrandmaLine(
      kind === 'binned' ? GRANDMA_LINES.diskBinned : GRANDMA_LINES.diskFreed,
    );
  };

  // Stop freezes the run where it stands (with a joke); Exit closes the
  // dialog and, only at 100%, finishes the task. Defragmenting the drive
  // any other evening is harmless.
  const stopDefrag = () => {
    setMessage(JOKES.defragStopped);
  };

  const exitDefrag = (finished: boolean) => {
    setDefragOpen(false);

    if (!finished) {
      setMessage(JOKES.defragEarlyExit);
      return;
    }

    if (!completeObjective('defrag-done')) {
      setMessage(JOKES.defragIdleDone);
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

  // Opening an inbox email: the grandkids' one is the target (and a second
  // read gets grandma's aside), junk jokes and breeds more junk.
  const openInboxEmail = (email: EmailConfig) => {
    if (email.target) {
      if (!completeObjective('email-opened')) {
        setMessage(JOKES.emailAlreadyRead);
      }

      return;
    }

    setMessage(email.joke);
    setEmails((prev) => withJunk(prev, 2));
  };

  // Win95 mail: a selected row goes in one Delete, and the sweep keeps
  // going — the list hands selection to whatever row took its place. The
  // grandkids' email is the one thing the junk can't take with it.
  const deleteEmail = (id: string) => {
    const index = emails.findIndex((email) => email.id === id);

    if (index === -1) {
      return;
    }

    if (emails[index].target) {
      setMessage(JOKES.inboxProtected);
      return;
    }

    const remaining = emails.filter((email) => email.id !== id);
    setEmails(remaining);
    // The grandkids' email is never deleted, so `remaining` is never
    // empty here; the null fallback is defensive only.
    /* v8 ignore next */
    setSelectedEmail(
      remaining[Math.min(index, remaining.length - 1)]?.id ?? null,
    );
    audio.play('delete');

    if (!remaining.some(isJunk)) {
      completeObjective('inbox-cleared');
    }
  };

  const selectEmail = (id: string) => {
    setSelectedEmail(id);
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
    setUpdateStage(null);
    setEmails(EMAILS);
    setSelectedEmail(null);
    setClingyCloses(0);
    setFrozen(INITIAL_WINDOW_FLAGS);
    setTaskManagerOpen(false);
    setPendingEvent(null);
    setDefragOpen(false);
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

  // Start > Task Manager — and the secret Ctrl+Alt+Del chord below — open
  // the task list dialog (Win95's Close Program under its NT-era name),
  // interrupting whatever's up.
  const openTaskManager = () => {
    setMessage(null);
    setTaskManagerOpen(true);
  };

  const closeTaskManager = () => {
    setTaskManagerOpen(false);
  };

  // The dialog's own Shut Down button runs the real shutdown flow.
  const shutDownFromTaskManager = () => {
    setTaskManagerOpen(false);
    openShutdown();
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

  // Leaving a power screen: both black lines — the boot line after a
  // restart, the safe-off toast after a shutdown — advance to the clouds
  // splash, the way a machine comes back on either way. Waking also trades
  // grandma's protest for her wake line behind the clouds (the restart's
  // reset has already put the intro back); the splash itself brings the
  // desktop back with the startup sound and the theme.
  const leavePowerScreen = () => {
    if (powerScreen === 'boot' || powerScreen === 'safe') {
      if (powerScreen === 'safe') {
        setGrandmaLine(GRANDMA_LINES.powerBack);
      }

      setPowerScreen('splash');
      return;
    }

    setPowerScreen(null);
    audio.play('startup');
    audio.startMusic();

    // The update reboot queues its completion behind the clouds; the
    // desktop coming back is what actually finishes the task.
    if (pendingEvent !== null) {
      const event = pendingEvent;
      setPendingEvent(null);
      completeObjective(event);
    }
  };

  const selectIcon = (icon: DesktopIconConfig) => {
    setSelectedIcon(icon.id);
  };

  // Win95's icon highlight is really focus: a press anywhere that isn't
  // an icon lets the selected one go.
  const clearSelection = () => {
    setSelectedIcon(null);
  };

  // The mail shortcut fails the Win95 way: only when you try to open it.
  const openMailDecoy = () => {
    setMessage(JOKES.mailError, 'error');
    setGrandmaLine(GRANDMA_LINES.mailDecoy);
  };

  // One way to launch a desktop icon, however it is reached: the desktop
  // itself, a filed row in My Documents, or Start > Documents.
  const openDesktopIcon = (id: string) => {
    const icon = DESKTOP_ICONS.find((entry) => entry.id === id);

    if (icon === undefined) {
      // The disk-full task's culprits aren't programs that run: opening one
      // re-raises the low-disk error it was installed from.
      if (TASK_FILES.some((entry) => entry.id === id)) {
        setMessage(JOKES.diskFull, 'error');
      }

      return;
    }

    if (icon.windowId !== undefined) {
      openIconWindow(icon.windowId);
      return;
    }

    if (icon.browserWindowId !== undefined) {
      openWindow(icon.browserWindowId);
      return;
    }

    openMailDecoy();
  };

  // Reactions overwrite grandma's line, so clicking her bubble puts the
  // current task back in her mouth.
  const repeatObjective = () => {
    setGrandmaLine(OBJECTIVES[objectiveIndex].instruction);
  };

  const toggleStart = () => {
    setStartOpen((open) => !open);
  };

  const selectStartItem = (item: StartMenuLeafItem) => {
    setStartOpen(false);

    if ('windowId' in item) {
      openWindow(item.windowId);
      return;
    }

    if ('iconWindowId' in item) {
      openIconWindow(item.iconWindowId);
      return;
    }

    if ('action' in item) {
      if (item.action === 'shutdown') {
        openShutdown();
        return;
      }

      if (item.action === 'task-manager') {
        openTaskManager();
        return;
      }

      if (item.action === 'defrag') {
        setDefragOpen(true);
        return;
      }

      setMessage(OBJECTIVES[objectiveIndex].instruction, 'info');
      return;
    }

    if ('desktopId' in item) {
      openDesktopIcon(item.desktopId);
      return;
    }

    setMessage(item.message);
  };

  // The three-key ritual: Win95's own Close Program chord, honored where
  // the browser actually receives it — Windows swallows Ctrl+Alt+Del at OS
  // level, which is why Start > Task Manager is the guaranteed mouse route.
  useEffect(() => {
    const handleChord = (event: KeyboardEvent) => {
      // Only on the live desktop: a chord mid-boot would open behind the
      // power screen, and the task screens own the desktop anyway.
      if (powerScreen !== null || phase !== 'playing' || shutdownOpen) {
        return;
      }

      if (
        event.ctrlKey &&
        event.altKey &&
        (event.key === 'Delete' || event.key === 'Backspace')
      ) {
        setSystemMessage(null);
        setMessageVariant('joke');
        setTaskManagerOpen(true);
      }
    };

    document.addEventListener('keydown', handleChord);
    return () => {
      document.removeEventListener('keydown', handleChord);
    };
  }, [powerScreen, phase, shutdownOpen]);

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
    updateStage,
    frozen,
    taskManagerOpen,
    defragOpen,
    raise,
    moveWindow,
    minimize,
    toggleMaximize,
    activateWindow,
    openWindow,
    closeWindow,
    closeViaChrome,
    openDesktopIcon,
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
    openInboxEmail,
    deleteEmail,
    selectEmail,
    emails,
    selectedEmail,
    login,
    buyToaster,
    completeScan,
    advanceUpdate,
    laterUpdate,
    rebootUpdate,
    reactFrozen,
    endTask,
    noteDiskMilestone,
    stopDefrag,
    exitDefrag,
    nextObjective,
    playAgain,
    selectIcon,
    clearSelection,
    openMailDecoy,
    repeatObjective,
    toggleStart,
    selectStartItem,
    openShutdown,
    closeShutdown,
    openTaskManager,
    closeTaskManager,
    shutDownFromTaskManager,
    confirmShutdown,
    leavePowerScreen,
  };
}
