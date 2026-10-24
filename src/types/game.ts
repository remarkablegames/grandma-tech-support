export type WindowId = 'shopping' | 'inbox' | 'virus';
export type BrowserWindowId = WindowId;

export type GamePhase = 'playing' | 'taskDone' | 'won';

export type ObjectiveEvent =
  | 'logged-in'
  | 'email-opened'
  | 'inbox-cleared'
  | 'order-placed'
  | 'update-rebooted'
  | 'frozen-ended'
  | 'scan-complete'
  | 'defrag-done';

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
  // Drop semantics, Win95 style: containers swallow dropped shortcuts
  // (the bin recycles them, the folder files them), while system icons
  // refuse drops both ways.
  container?: 'recycle' | 'folder';
  system?: boolean;
}

// The disk-full task's culprits: ordinary draggable files that live on the
// desktop only while that task is on, so their cells come from the config
// instead of the persisted default layout.
export interface TaskFileConfig extends DesktopIconConfig {
  home: IconCell;
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
  // A shortcut filed into this window from the desktop: it opens like
  // the desktop icon it came from, and can be taken back out.
  desktopId?: string;
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
  // The disk-full task: its low-disk error takes over at task start, and
  // the two culprit files land on the desktop.
  lowDisk?: boolean;
  // Windows that spring open frozen — dead to every input until End Task.
  freeze?: WindowId[];
  // Windows that spring open (or back open) when this task starts.
  // The inbox-cleanout task clears any pop-ups left from earlier tasks first,
  // so the mail list starts readable.
  clearPopups?: boolean;
  // The inbox-cleanout task tops the junk back up to at least this many
  // rows at task start, so a player who swept early still has work to do.
  inboxTopUp?: number;
  // The ad window that refuses to close for the first few tries, landing a
  // fresh pop-up each time — the way adware pages did.
  clingy?: WindowId[];
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
// window, icon-window items open the desktop's mini-windows, and the task
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
// current task is, Shut Down... opens the power dialog, Task Manager
// opens the task list, and Disk Defragmenter opens the drive tool, so none
// of them live in the content file.
export interface StartMenuActionItem extends StartMenuBaseItem {
  action: 'show-task' | 'shutdown' | 'task-manager' | 'defrag';
}

// A filed shortcut in Start > Documents: it launches the same desktop
// icon it was dragged into the folder.
export interface StartMenuDesktopItem extends StartMenuBaseItem {
  desktopId: string;
}

export type StartMenuLeafItem =
  | StartMenuJokeItem
  | StartMenuAppItem
  | StartMenuIconWindowItem
  | StartMenuActionItem
  | StartMenuDesktopItem;

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
// whatever the right-clicked target would have done on a double-click, effect
// items hand a real action back to the desktop (the bin's Empty Recycle Bin,
// a deleted file's Restore, Win95's own Delete), disabled items are the
// greyed-out entries Win95 never lets you pick, and separators are the
// horizontal rules it draws between groups.
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

// One of the effects: emptying the Recycle Bin, which the desktop turns into
// a confirm dialog instead of acting on the spot.
export interface ContextMenuEffectItem extends ContextMenuBaseItem {
  effect: 'empty-bin';
}

// The second: Win95's file menu inside the Recycle Bin, where `Restore` takes
// the deleted file's own desktop id to put it straight back.
export interface ContextMenuRestoreItem extends ContextMenuBaseItem {
  effect: 'restore';
  desktopId: string;
}

// The third: Win95's Delete, which always asks before acting — `recycle`
// sends the file to the bin (the desktop or a folder's copy of it), while
// `purge`, from inside the bin, deletes it for real for the evening.
// `target` and `icon` dress the confirm with the file's name and face.
export interface ContextMenuDeleteItem extends ContextMenuBaseItem {
  effect: 'recycle' | 'purge';
  desktopId: string;
  target: string;
  icon?: string;
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
  | ContextMenuEffectItem
  | ContextMenuRestoreItem
  | ContextMenuDeleteItem
  | ContextMenuDisabledItem
  | ContextMenuSeparator;
