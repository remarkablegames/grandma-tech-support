import type {
  DesktopIconConfig,
  EmailConfig,
  OpenPopup,
  PopupConfig,
  PopupId,
  ProductConfig,
  StartMenuItem,
  WindowMeta,
} from 'src/types/game';

const ICONS = 'windows_icons_32x32';

export const JOKES = {
  toasterTile:
    'That’s the seventh toaster, dear. The garage is mostly toasters now.',
  buyButton:
    'You’ve spent $4.99 you don’t have. Just kidding, the payment didn’t go through.',
  liarClose:
    'That “Close” button was reporting to the ads. Now there are twice as many.',
  fixNow:
    'We “fixed” it by deleting nothing. It wasn’t broken in the first place.',
  claimPrize:
    'Congratulations: you’ve won a FREE mouse. The live one got away.',
  cleanNow:
    'Your computer is now 400% more infected. Just kidding, someone made this in Paint.',
  maybeLater: 'It’ll still be urgent later.',
  windowClose: 'That one’s never worked, it’s purely decorative.',
  goBack: 'There’s nowhere to go back to. The internet only goes forward.',
  goForward: 'Forward is where the pop-ups live.',
  emailDog: 'Forty-seven pictures of the same dog.',
  emailUpdate: 'That’s the update that broke the internet in year 2000.',
  startPrograms: 'There are 47 programs. 46 of them are Solitaire.',
  startDocuments: 'They’re all called “untitled_final_v2”.',
  startSettings: 'Everything’s set to “don’t touch”.',
  startFind: 'It was open in the internet thing.',
  startHelp: 'You ARE the help.',
  startRun: 'That’s how the toaster got installed.',
  startShutDown: 'Don’t shut it down! I’m expecting an email.',
} as const;

export const GRANDMA_LINES = {
  intro:
    'Help me find my email, dear. It was open in the internet thing. Don’t click anything that says it’s urgent.',
  correctClose:
    'That’s it! The little X in the corner. Never trust a big button.',
  mailDecoy:
    'That one’s been broken since 2000. Your email’s in the internet thing.',
  win: 'You did it, my dear! You found my email, and you didn’t fall for the toaster. Tell your grandfather the computer stays with me.',
} as const;

export const WINDOW_META: WindowMeta[] = [
  {
    id: 'shopping',
    title: '🔥 Bargain Barn — TODAY ONLY!!!',
    icon: `${ICONS}/world.png`,
    url: 'http://www.bargain-barn.totally-real/sale.html',
  },
  {
    id: 'inbox',
    title: '✉ Inbox (12) — Grandma’s Mail',
    icon: `${ICONS}/mail.png`,
    url: 'http://mail.grandma.example/inbox',
  },
  {
    id: 'virus',
    title: '⚠ URGENT: VIRUS DETECTED ⚠',
    icon: `${ICONS}/password_manager.png`,
    url: 'http://www.totally-a-virus.example/alert',
  },
];

export const POPUP_CONFIGS: Record<PopupId, PopupConfig> = {
  deal: {
    title: 'CONGRATULATIONS!!!',
    icon: `${ICONS}/sticky_note.png`,
    message:
      'You’re the 1,000,000th visitor! Claim your FREE toaster (shipping not included).',
    buttons: [
      { label: 'Buy', message: JOKES.buyButton },
      { label: 'Close', message: JOKES.liarClose, spawns: 2 },
    ],
  },
  full: {
    title: 'Your mailbox is FULL',
    icon: `${ICONS}/search.png`,
    message: 'Your mailbox is 99% FULL! Fix now to avoid EXPLOSION.',
    buttons: [
      { label: 'Fix now!', message: JOKES.fixNow },
      { label: 'Close', message: JOKES.liarClose, spawns: 2 },
    ],
  },
  spam: {
    title: 'YOU HAVE BEEN SELECTED',
    icon: `${ICONS}/briefcase.png`,
    message: 'Your prize is waiting! FREE mouse (animal not included).',
    buttons: [
      { label: 'Claim', message: JOKES.claimPrize },
      { label: 'Close', message: JOKES.liarClose, spawns: 2 },
    ],
  },
};

export const INITIAL_POPUPS: OpenPopup[] = [
  { key: 'shopping-deal', popupId: 'deal', windowId: 'shopping' },
  { key: 'inbox-full', popupId: 'full', windowId: 'inbox' },
];

export const MAX_POPUPS_PER_WINDOW = 5;

// Reference layout for a 1024x768 viewport; scaled to the real viewport on mount.
export const BASE_WINDOW_POSITIONS = {
  shopping: { x: 60, y: 90 },
  inbox: { x: 340, y: 210 },
  virus: { x: 430, y: 70 },
} as const;

export const BASE_VIEWPORT = { width: 1024, height: 768 } as const;

export const DESKTOP_ICONS: DesktopIconConfig[] = [
  { id: 'computer', label: 'My Computer', icon: `${ICONS}/this_computer.png` },
  {
    id: 'recycle',
    label: 'Recycle Bin',
    icon: `${ICONS}/recycle_bin_empty.png`,
  },
  {
    id: 'documents',
    label: 'My Documents',
    icon: `${ICONS}/folder_closed.png`,
  },
  { id: 'notes', label: 'Sticky Notes', icon: `${ICONS}/sticky_note.png` },
  { id: 'calculator', label: 'Calculator', icon: `${ICONS}/calculator.png` },
  {
    id: 'mail',
    label: 'Grandma’s Mail',
    icon: `${ICONS}/mail.png`,
    decoy: true,
  },
];

export const EMAILS: EmailConfig[] = [
  {
    id: 'joke',
    from: 'The Grandkids',
    subject: 'RE: RE: RE: Fwd: the joke',
    date: 'Today',
    target: true,
  },
  {
    id: 'dog',
    from: 'Your Grandson',
    subject: 'FW: FW: photos of the dog',
    date: 'Mon',
    target: false,
    joke: JOKES.emailDog,
  },
  {
    id: 'update',
    from: 'Windows Update',
    subject: 'Important!!',
    date: 'Tue',
    target: false,
    joke: JOKES.emailUpdate,
  },
];

export const PRODUCTS: ProductConfig[] = [
  {
    id: 'toaster',
    name: 'Toaster',
    price: '$4.99',
    joke: JOKES.toasterTile,
  },
  {
    id: 'toaster-plus',
    name: 'Another Toaster',
    price: '$5.99',
    joke: JOKES.toasterTile,
  },
  {
    id: 'toaster-free',
    name: 'FREE* Toaster',
    price: '$0.00*',
    joke: JOKES.toasterTile,
  },
];

export const START_ITEMS: StartMenuItem[] = [
  {
    id: 'programs',
    label: 'Programs',
    icon: `${ICONS}/program.png`,
    message: JOKES.startPrograms,
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: `${ICONS}/folder_closed.png`,
    message: JOKES.startDocuments,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: `${ICONS}/tools.png`,
    message: JOKES.startSettings,
  },
  {
    id: 'find',
    label: 'Find',
    icon: `${ICONS}/search.png`,
    message: JOKES.startFind,
  },
  {
    id: 'help',
    label: 'Help',
    icon: `${ICONS}/sticky_note.png`,
    message: JOKES.startHelp,
  },
  {
    id: 'run',
    label: 'Run…',
    icon: `${ICONS}/script_file.png`,
    message: JOKES.startRun,
  },
  {
    id: 'shutdown',
    label: 'Shut Down…',
    icon: `${ICONS}/password_manager.png`,
    message: JOKES.startShutDown,
  },
];
