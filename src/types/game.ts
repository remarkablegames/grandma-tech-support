export type WindowId = 'shopping' | 'inbox' | 'virus';
export type BrowserWindowId = WindowId;

export type GamePhase = 'playing' | 'taskDone' | 'won';

export type ObjectiveEvent =
  | 'logged-in'
  | 'email-opened'
  | 'order-placed'
  | 'update-rebooted'
  | 'frozen-ended'
  | 'scan-complete';

// The Windows Update dialog's click-driven stages: the stall at 99%, the
// rollback gag, then the failure that asks for a reboot. No timers.
export type UpdateStage = 'installing' | 'restored' | 'failed';

export type PopupId = 'deal' | 'full' | 'spam';

export interface WindowPosition {
  x: number;
  y: number;
}

// A desktop icon's home: grid cells out from the desktop's top-left corner,
// Win95 style, instead of free-floating pixels.
export interface IconCell {
  col: number;
  row: number;
}

export interface WindowMeta {
  id: WindowId;
  title: string;
  url: string;
  icon: string;
}

export interface DesktopIconConfig {
  id: string;
  label: string;
  icon: string;
  windowId?: IconWindowId;
  browserWindowId?: WindowId;
}

// Windows that show grandma’s notes and joke files inside a Notepad frame.
export type NoteWindowId =
  | 'notes'
  | 'other-note'
  | 'untitled'
  | 'untitled-2'
  | 'untitled-3'
  | 'asdf'
  | 'todo'
  | 'recipe';

export type IconWindowId =
  | 'computer'
  | 'recycle'
  | 'documents'
  | 'calculator'
  | 'scanner'
  | NoteWindowId;

export interface IconWindowRow {
  icon?: string;
  label: string;
  hint?: string;
  opens?: IconWindowId;
}

export interface ListIconWindow {
  id: IconWindowId;
  title: string;
  icon: string;
  kind: 'list';
  rows: IconWindowRow[];
}

export interface NoteIconWindow {
  id: NoteWindowId;
  title: string;
  icon: string;
  kind: 'note';
  lines: string[];
}

export interface CalculatorIconWindow {
  id: 'calculator';
  title: string;
  icon: string;
  kind: 'calculator';
}

export interface ScannerIconWindow {
  id: 'scanner';
  title: string;
  icon: string;
  kind: 'scanner';
}

export type IconWindowConfig =
  ListIconWindow | NoteIconWindow | CalculatorIconWindow | ScannerIconWindow;

export interface IconTaskbarItem {
  id: IconWindowId;
  title: string;
  icon: string;
}

export interface PopupSpawn {
  windowId: WindowId;
  popupId: PopupId;
  count: number;
}

export interface ObjectiveConfig {
  instruction: string;
  doneTitle: string;
  doneMessage: string;
  icon: string;
  completesOn: ObjectiveEvent;
  // Windows that spring open (or back open) when this task starts.
  open?: WindowId[];
  spawn?: PopupSpawn[];
  // The update task: its Windows Update dialog takes over at task start.
  update?: boolean;
  // Windows that spring open frozen — dead to every input until End Task.
  freeze?: WindowId[];
}

export interface PopupButtonConfig {
  label: string;
  message: string;
  spawns?: number;
}

// System Message dialogs default to grandma's joke face; errors get the red X.
export type MessageVariant = 'joke' | 'error' | 'info';

export interface PopupConfig {
  title: string;
  icon: string;
  message: string;
  buttons: PopupButtonConfig[];
}

export interface OpenPopup {
  key: string;
  popupId: PopupId;
  windowId: WindowId;
}

export interface EmailBase {
  id: string;
  from: string;
  subject: string;
  date: string;
}

export type EmailConfig = EmailBase &
  ({ target: true } | { target: false; joke: string });

export interface ProductConfig {
  id: string;
  name: string;
  price: string;
  emoji: string;
  joke: string;
}

// Start menu entries come in two shapes: leaves act directly when picked —
// joke items put a grandma line in the dialog, app items open a browser
// window, icon-window items open the desktop's mini-windows, and the mission
// action re-reads the current task — while submenu items never act, they
// fan out into a flyout of leaves.
export interface StartMenuBaseItem {
  id: string;
  label: string;
  icon: string;
}

export interface StartMenuJokeItem extends StartMenuBaseItem {
  message: string;
}

export interface StartMenuAppItem extends StartMenuBaseItem {
  windowId: WindowId;
}

export interface StartMenuIconWindowItem extends StartMenuBaseItem {
  iconWindowId: IconWindowId;
}

// Menu items whose effect isn't a fixed string: Help re-reads whatever the
// current mission is, Shut Down... opens the power dialog, and Task Manager
// opens the task list, so none of them live in the content file.
export interface StartMenuActionItem extends StartMenuBaseItem {
  action: 'show-mission' | 'shutdown' | 'task-manager';
}

export type StartMenuLeafItem =
  | StartMenuJokeItem
  | StartMenuAppItem
  | StartMenuIconWindowItem
  | StartMenuActionItem;

// One level deep, the way Win95's first-cut menus cascade: flyouts hold
// leaves only, never a submenu of their own.
export interface StartMenuSubmenuItem extends StartMenuBaseItem {
  children: StartMenuLeafItem[];
}

export type StartMenuItem = StartMenuLeafItem | StartMenuSubmenuItem;

// The Shut Down dialog's two radio choices.
export type ShutdownMode = 'shutdown' | 'restart';

// Which full-screen power beat covers the desktop: the clouds splash the
// game itself boots through, the boot line on the way back from a restart,
// or Win95's amber safe-off toast after a shutdown.
export type PowerScreenMode = 'safe' | 'boot' | 'splash';

// Right-click menus. Joke items put a grandma line in the dialog, `open` runs
// whatever the right-clicked target would have done on a double-click,
// disabled items are the greyed-out entries Win95 never lets you pick, and
// separators are the horizontal rules it draws between groups.
export interface ContextMenuBaseItem {
  id: string;
  label: string;
}

export interface ContextMenuJokeItem extends ContextMenuBaseItem {
  message: string;
}

export interface ContextMenuOpenItem extends ContextMenuBaseItem {
  action: 'open';
}

export interface ContextMenuDisabledItem extends ContextMenuBaseItem {
  disabled: true;
}

export interface ContextMenuSeparator {
  id: string;
  separator: true;
}

export type ContextMenuItem =
  | ContextMenuJokeItem
  | ContextMenuOpenItem
  | ContextMenuDisabledItem
  | ContextMenuSeparator;
