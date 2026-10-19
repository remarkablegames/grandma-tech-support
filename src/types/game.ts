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
  decoy?: boolean;
}

export type IconWindowId =
  | 'computer'
  | 'recycle'
  | 'documents'
  | 'notes'
  | 'calculator'
  | 'scanner'
  | 'other-note';

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
  id: 'notes' | 'other-note';
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
  spawn?: PopupSpawn[];
}

export interface PopupButtonConfig {
  label: string;
  message: string;
  spawns?: number;
}

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
  joke: string;
}

export interface StartMenuItem {
  id: string;
  label: string;
  icon: string;
  message: string;
}
