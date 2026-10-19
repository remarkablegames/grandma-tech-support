export type WindowId = 'shopping' | 'inbox' | 'virus';

export type GamePhase = 'playing' | 'won';

export type PopupId = 'deal' | 'full' | 'spam';

export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowMeta {
  id: WindowId;
  title: string;
  icon: string;
  url: string;
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

export interface StartMenuItem {
  id: string;
  label: string;
  icon: string;
  message: string;
}

export interface DesktopIconConfig {
  id: string;
  label: string;
  icon: string;
  decoy?: boolean;
  windowId?: IconWindowId;
}

export type IconWindowId =
  'computer' | 'recycle' | 'documents' | 'notes' | 'calculator';

export interface IconWindowRow {
  icon?: string;
  label: string;
  hint?: string;
}

export interface ListIconWindow {
  id: IconWindowId;
  title: string;
  icon: string;
  kind: 'list';
  rows: IconWindowRow[];
}

export interface NoteIconWindow {
  id: 'notes';
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

export type IconWindowConfig =
  ListIconWindow | NoteIconWindow | CalculatorIconWindow;

export interface IconTaskbarItem {
  id: IconWindowId;
  title: string;
  icon: string;
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
