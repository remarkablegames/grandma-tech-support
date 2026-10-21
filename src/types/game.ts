export type WindowId = 'shopping' | 'inbox' | 'virus';
export type BrowserWindowId = WindowId;

export type GamePhase = 'playing' | 'taskDone' | 'won';

export type ObjectiveEvent =
  'logged-in' | 'email-opened' | 'order-placed' | 'scan-complete';

export type PopupId = 'deal' | 'full' | 'spam';

export interface WindowPosition {
  x: number;
  y: number;
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

// Start menu entries double as launchers now: joke items put a grandma line
// in the dialog, app items open a browser window, and the mission item
// re-reads the current task.
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

// Menu items whose effect isn't a fixed string: Help re-reads whatever the
// current mission is, and Shut Down... opens the power dialog, so neither can
// live as a message in the static content file.
export interface StartMenuActionItem extends StartMenuBaseItem {
  action: 'show-mission' | 'shutdown';
}

export type StartMenuItem =
  StartMenuJokeItem | StartMenuAppItem | StartMenuActionItem;

// The Shut Down dialog's two radio choices.
export type ShutdownMode = 'shutdown' | 'restart';

// Which full-screen power line covers the desktop: Win95's amber safe-off
// toast after a shutdown, or the boot line while a restart comes back.
export type BlackScreenMode = 'safe' | 'boot';

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
