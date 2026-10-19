import type {
  DesktopIconConfig,
  EmailConfig,
  IconWindowConfig,
  ObjectiveConfig,
  OpenPopup,
  PopupConfig,
  PopupId,
  PopupSpawn,
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
  emailPrize: 'You’ve been selected for a free toaster. Everyone has, dear.',
  emailWire:
    'That’s not your grandson, dear. Your grandson can’t spell “wire”.',
  buyBlocked: 'The page is buried in pop-ups, dear. Close them all first.',
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
    'I need to check my email, dear. The internet thing wants a password first. I wrote it on a note somewhere. Don’t click anything that says it’s urgent.',
  correctClose:
    'That’s it! The little X in the corner. Never trust a big button.',
  mailDecoy:
    'That one’s been broken since 2000. Your email’s in the internet thing.',
  win: 'You did it, my dear! You found my email, and you didn’t fall for the toaster. Tell your grandfather the computer stays with me.',
  wrongPassword: 'Incorrect password.',
  saved:
    'You saved it, my dear! The computer stays with me. Tell your grandfather it was a close call.',
} as const;

// The password the mail log-on form expects — it lives on the other note.
export const MAIL_PASSWORD = 'password';

// The four-task mission chain. Each entry completes on its event; when the
// next task starts, its instruction becomes grandma's line and its `spawn`
// pop-ups land on top of whatever is already open.
export const OBJECTIVES: ObjectiveConfig[] = [
  {
    instruction: GRANDMA_LINES.intro,
    doneTitle: 'Task 1 of 4 complete',
    doneMessage:
      'That’s it, dear! I’m in. Now find the real email, not the ones offering you toasters.',
    icon: `${ICONS}/sticky_note.png`,
    completesOn: 'logged-in',
  },
  {
    instruction:
      'Open my mail, dear, the one from the grandkids. The other ones are nonsense.',
    doneTitle: 'Task 2 of 4 complete',
    doneMessage: GRANDMA_LINES.win,
    icon: `${ICONS}/mail.png`,
    completesOn: 'email-opened',
    spawn: [{ windowId: 'shopping', popupId: 'spam', count: 2 }],
  },
  {
    instruction:
      'Would you order me a toaster, dear? The burning shopping page.',
    doneTitle: 'Task 3 of 4 complete',
    doneMessage:
      'Ordered! ...though I may have clicked something while we waited, dear.',
    icon: `${ICONS}/world.png`,
    completesOn: 'order-placed',
  },
  {
    instruction:
      'The whole screen is yelling, dear! Don’t touch the urgent ones. Use the shield program on the desktop!',
    doneTitle: 'Computer saved!',
    doneMessage: GRANDMA_LINES.saved,
    icon: `${ICONS}/password_manager.png`,
    completesOn: 'scan-complete',
    spawn: [
      { windowId: 'shopping', popupId: 'spam', count: 3 },
      { windowId: 'inbox', popupId: 'spam', count: 3 },
      { windowId: 'virus', popupId: 'spam', count: 3 },
    ],
  },
];

// The first toaster click of task 3 unleashes this storm.
export const BUY_STORM: PopupSpawn[] = [
  { windowId: 'shopping', popupId: 'spam', count: 3 },
  { windowId: 'inbox', popupId: 'spam', count: 3 },
  { windowId: 'virus', popupId: 'spam', count: 3 },
];

export const WINDOW_META: WindowMeta[] = [
  {
    id: 'shopping',
    title: '🔥 Bargain Barn — TODAY ONLY!!!',
    icon: `${ICONS}/world.png`,
    url: 'http://www.bargain-barn.totally-real.com/sale.html',
  },
  {
    id: 'inbox',
    title: '✉ Inbox (12) — Grandma’s Mail',
    icon: `${ICONS}/mail.png`,
    url: 'http://mail.grandma.com/inbox',
  },
  {
    id: 'virus',
    title: '⚠ URGENT: VIRUS DETECTED ⚠',
    icon: `${ICONS}/password_manager.png`,
    url: 'http://www.totally-a-virus.com/alert',
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

// Every desktop icon window opens here; each additional window cascades from it.
export const ICON_WINDOW_BASE_POSITION = { x: 150, y: 100 } as const;

export const ICON_WINDOWS: IconWindowConfig[] = [
  {
    id: 'computer',
    title: 'My Computer',
    icon: `${ICONS}/this_computer.png`,
    kind: 'list',
    rows: [
      { icon: `${ICONS}/flop_drive.png`, label: '3½ Floppy (A:)' },
      {
        icon: `${ICONS}/drive.png`,
        label: 'Hard disk (C:)',
        hint: 'mostly toasters',
      },
      { icon: `${ICONS}/cd_drive.png`, label: 'CD-ROM (D:)', hint: '1 song' },
    ],
  },
  {
    id: 'recycle',
    title: 'Recycle Bin',
    icon: `${ICONS}/recycle_bin_empty.png`,
    kind: 'list',
    rows: [
      { icon: `${ICONS}/text_file.png`, label: 'untitled_final_v2.doc' },
      { icon: `${ICONS}/program.png`, label: 'toaster_7_install.exe' },
      { icon: `${ICONS}/image_file.png`, label: 'do_not_open.jpg' },
    ],
  },
  {
    id: 'documents',
    title: 'My Documents',
    icon: `${ICONS}/folder_closed.png`,
    kind: 'list',
    rows: [
      { icon: `${ICONS}/text_file.png`, label: 'untitled' },
      { icon: `${ICONS}/text_file.png`, label: 'untitled (2)' },
      { icon: `${ICONS}/text_file.png`, label: 'untitled (3)' },
      { icon: `${ICONS}/text_file.png`, label: 'asdf' },
      {
        icon: `${ICONS}/text_file.png`,
        label: 'the_other_note.txt',
        opens: 'other-note',
      },
    ],
  },
  {
    id: 'notes',
    title: 'Sticky Notes',
    icon: `${ICONS}/sticky_note.png`,
    kind: 'note',
    lines: ['THE PASSWORD', '(it’s on the other note)'],
  },
  {
    id: 'other-note',
    title: 'the_other_note.txt — Notepad',
    icon: `${ICONS}/text_file.png`,
    kind: 'note',
    lines: ['THE OTHER NOTE', 'the password is “password”.'],
  },
  {
    id: 'calculator',
    title: 'Calculator',
    icon: `${ICONS}/calculator.png`,
    kind: 'calculator',
  },
  {
    id: 'scanner',
    title: 'Virus Shield',
    icon: `${ICONS}/search.png`,
    kind: 'scanner',
  },
];

export const DESKTOP_ICONS: DesktopIconConfig[] = [
  {
    id: 'computer',
    label: 'My Computer',
    icon: `${ICONS}/this_computer.png`,
    windowId: 'computer',
  },
  {
    id: 'recycle',
    label: 'Recycle Bin',
    icon: `${ICONS}/recycle_bin_empty.png`,
    windowId: 'recycle',
  },
  {
    id: 'documents',
    label: 'My Documents',
    icon: `${ICONS}/folder_closed.png`,
    windowId: 'documents',
  },
  {
    id: 'notes',
    label: 'Sticky Notes',
    icon: `${ICONS}/sticky_note.png`,
    windowId: 'notes',
  },
  {
    id: 'calculator',
    label: 'Calculator',
    icon: `${ICONS}/calculator.png`,
    windowId: 'calculator',
  },
  {
    id: 'mail',
    label: 'Grandma’s Mail',
    icon: `${ICONS}/mail.png`,
    decoy: true,
  },
  {
    id: 'scanner',
    label: 'Virus Shield',
    icon: `${ICONS}/search.png`,
    windowId: 'scanner',
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
  {
    id: 'prize',
    from: 'PRIZE DEPARTMENT',
    subject: 'FINAL NOTICE: your toaster awaits',
    date: 'Today',
    target: false,
    joke: JOKES.emailPrize,
  },
  {
    id: 'wire',
    from: 'Your Grandson (?)',
    subject: 'URGENT: grandma send $500',
    date: 'Today',
    target: false,
    joke: JOKES.emailWire,
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
    label: 'Run...',
    icon: `${ICONS}/script_file.png`,
    message: JOKES.startRun,
  },
  {
    id: 'shutdown',
    label: 'Shut Down...',
    icon: `${ICONS}/password_manager.png`,
    message: JOKES.startShutDown,
  },
];
