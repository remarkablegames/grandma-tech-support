import type {
  ContextMenuItem,
  DesktopIconConfig,
  EmailConfig,
  IconWindowConfig,
  IconWindowRow,
  ObjectiveConfig,
  PopupConfig,
  PopupId,
  PopupSpawn,
  ProductConfig,
  StartMenuItem,
  UpdateStage,
  WindowMeta,
} from 'src/types/game';

const ICONS = 'windows_icons_32x32';

export const JOKES = {
  toasterTile:
    'That’s the seventh toaster, dear. The garage is mostly toasters now.',
  toasterSecond:
    'That’s another toaster. We have enough to replace our heater now.',
  toasterFree: 'Another free toaster... I wonder how the company makes money.',
  extendedWarranty:
    'The warranty covers everything except toasters. Do read the fine print.',
  breadSamples:
    'Samples are for sampling. You bought the entire sample pantry.',
  moreRam: 'It’s a sticky note that says “RAM”.',
  buyButton:
    'You’ve spent $4.99 you don’t have. Luckily, the payment didn’t go through.',
  liarClose:
    'That “Close” button was reporting to the ads. Now there are twice as many.',
  fixNow:
    'We “fixed” it by deleting nothing. It wasn’t broken in the first place.',
  claimPrize:
    'Congratulations: you’ve won a FREE mouse. The live one got away.',
  cleanNow:
    'Your computer is now 400% more infected. Just kidding, someone made this in Paint.',
  maybeLater: 'It’ll still be urgent later.',
  updateLater: '“Later” has always meant “now” to Windows Update.',
  endTaskAlive: 'That one’s running fine. End Task is only for the frozen one.',
  goBack: 'There’s nowhere to go back to. The internet only goes forward.',
  goForward: 'Forward is where the pop-ups live.',
  emailDog: 'Eleven pictures of the same dog.',
  emailUpdate: 'That’s the update that broke the internet in year 2000.',
  emailPrize: 'You’ve been selected for a free toaster!',
  emailWire:
    'That’s not your grandson, dear. Your grandson can’t spell “wire”.',
  emailChain:
    'Forward it to ten friends, or the modem gets grumpy. I don’t make the rules.',
  emailHoroscope:
    'It predicted this toaster. The stars are finally doing their job.',
  emailVitamins:
    'One weird trick: vitamins from a popup. The doctors really do hate this one.',
  emailTrial:
    'Your trial expired in 1995. It looks like they’re still waiting on the payment.',
  emailCart:
    'Your cart has one thing in it. It’s been that one thing for years.',
  mailError:
    'Cannot find the file “MAIL.EXE” (or one of its components). Make sure the path and filename are correct and that all required libraries are available.',
  buyBlocked: 'The page is buried in pop-ups. Close them all first.',
  startPrograms: 'There are 20 programs. 19 of them are Solitaire.',
  startDocuments: 'They’re all called “untitled_final_v2”.',
  startSettings: 'Everything’s set to “don’t touch”.',
  startFind: 'It was open in the internet thing.',
  startRun: 'That’s how the toaster got installed.',
  contextArrange: 'They’re already arranged by importance.',
  contextLineUp: 'They’re as lined up as they’re going to get.',
  contextRefresh: 'Refreshed! Nothing was broken, so nothing changed.',
  contextProperties: 'It’s set to “don’t touch”. Same as everything else.',
  contextDelete: 'You can’t delete that.',
  contextIconProperties: 'The main property is that it’s not a toaster.',
} as const;

export const GRANDMA_LINES = {
  intro:
    'I need to check my email, dear. It should be in the Start menu. I wrote my password in a note somewhere.',
  correctClose:
    'That’s it! The little X in the corner. Never trust a big button.',
  mailDecoy:
    'That one’s been broken since 2000. Your email’s in the internet thing.',
  shutDown: 'Don’t shut it down! I’m expecting an email.',
  powerBack: 'It’s back! Did anything happen while it was dark?',
  frozen: 'It’s not responding! Try quitting it with the Task Manager.',
  win: 'You did it, my dear! You found my email, and you didn’t fall for the toaster. Tell your grandfather the computer stays with me.',
  wrongPassword: 'Incorrect password.',
  saved:
    'You saved it, my dear! The computer stays with me. Tell your grandfather it was a close call.',
} as const;

// The two text power lines: Win95's safe-off toast verbatim, and Rainbows95
// booting back up (which gets a blinking cursor). The clouds splash wears
// the logo and wordmark instead of a message.
export const POWER_MESSAGES: Record<'safe' | 'boot', string> = {
  safe: 'It’s now safe to turn off your computer.',
  boot: 'Starting Rainbows95...',
};

// Copy for the three click-driven stages of task 4's Windows Update dialog.
export const UPDATE_MESSAGES: Record<UpdateStage, string> = {
  installing:
    'Installing important updates... 99% complete. Preparing file 3 of 1.',
  restored:
    'Something went wrong. Restoring previous settings... nothing was saved, so nothing was restored.',
  failed:
    'Windows could not complete the update. Restart your computer to try again.',
};

// The password the mail log-on form expects — it lives on the other note.
export const MAIL_PASSWORD = 'password';

// The six-task mission chain. Each entry completes on its event; when the
// next task starts, its instruction becomes grandma's line, its `open`
// windows spring up, and its `spawn` pop-ups land on top of those.
export const OBJECTIVES: ObjectiveConfig[] = [
  {
    instruction: GRANDMA_LINES.intro,
    doneTitle: 'Task 1 of 6 complete',
    doneMessage:
      'That’s it, dear! I’m in. Now find the real email, not the ones offering you toasters.',
    icon: `${ICONS}/sticky_note.png`,
    completesOn: 'logged-in',
  },
  {
    instruction:
      'That’s my mail popping open, dear! Find the one from the grandkids. The toaster ones are nonsense.',
    doneTitle: 'Task 2 of 6 complete',
    doneMessage: GRANDMA_LINES.win,
    icon: `${ICONS}/mail.png`,
    completesOn: 'email-opened',
    open: ['shopping', 'virus', 'inbox'],
    spawn: [
      { windowId: 'shopping', popupId: 'deal', count: 1 },
      { windowId: 'shopping', popupId: 'spam', count: 2 },
      { windowId: 'inbox', popupId: 'full', count: 1 },
    ],
  },
  {
    instruction:
      'Would you order me a toaster, dear? The burning shopping page.',
    doneTitle: 'Task 3 of 6 complete',
    doneMessage:
      'Ordered! ...though I may have clicked something while we waited, dear.',
    icon: `${ICONS}/world.png`,
    completesOn: 'order-placed',
  },
  {
    instruction: 'It’s auto-updating! When it gives up, click Restart now.',
    doneTitle: 'Task 4 of 6 complete',
    doneMessage: 'New and improved! Although the toaster page broke.',
    icon: `${ICONS}/tools.png`,
    completesOn: 'update-rebooted',
    update: true,
  },
  {
    instruction:
      'The bargain page stopped responding! Use the Task Manager to end it.',
    doneTitle: 'Task 5 of 6 complete',
    doneMessage:
      'It stopped yelping! And I may have clicked one little thing while you were in there.',
    icon: `${ICONS}/program.png`,
    completesOn: 'frozen-ended',
    open: ['shopping'],
    freeze: ['shopping'],
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

// The first toaster click of task 3 unleashes this storm; the windows spring
// back open in this order, so the sale page ends up on top of the pile.
export const BUY_STORM: PopupSpawn[] = [
  { windowId: 'virus', popupId: 'spam', count: 3 },
  { windowId: 'inbox', popupId: 'spam', count: 3 },
  { windowId: 'shopping', popupId: 'spam', count: 3 },
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
      {
        icon: `${ICONS}/flop_drive.png`,
        label: '3½ Floppy (A:)',
        hint: 'cupholder',
      },
      {
        icon: `${ICONS}/drive.png`,
        label: 'Hard disk (C:)',
        hint: 'mostly toasters',
      },
      { icon: `${ICONS}/cd_drive.png`, label: 'CD-ROM (D:)', hint: '1 song' },
      {
        icon: `${ICONS}/cd_drive.png`,
        label: 'CD-RW (E:)',
        hint: 'still burning',
      },
      {
        icon: `${ICONS}/printer.png`,
        label: 'Printer (LPT1:)',
        hint: 'jammed',
      },
      {
        icon: `${ICONS}/folder_closed.png`,
        label: 'Network (N:)',
        hint: 'the neighbors’ stuff',
      },
      {
        icon: `${ICONS}/games.png`,
        label: 'Games (G:)',
        hint: 'Solitaire, mostly',
      },
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
      { icon: `${ICONS}/text_file_2.png`, label: 'final_final_v3.doc' },
      { icon: `${ICONS}/program.png`, label: 'totally_not_a_virus.exe' },
    ],
  },
  {
    id: 'documents',
    title: 'My Documents',
    icon: `${ICONS}/folder_closed.png`,
    kind: 'list',
    // Every file opens in its own Notepad window, password note included.
    rows: [
      { icon: `${ICONS}/text_file.png`, label: 'untitled', opens: 'untitled' },
      {
        icon: `${ICONS}/text_file.png`,
        label: 'untitled (2)',
        opens: 'untitled-2',
      },
      {
        icon: `${ICONS}/text_file.png`,
        label: 'untitled (3)',
        opens: 'untitled-3',
      },
      { icon: `${ICONS}/text_file.png`, label: 'asdf', opens: 'asdf' },
      {
        icon: `${ICONS}/text_file.png`,
        label: 'the_other_note.txt',
        opens: 'other-note',
      },
      { icon: `${ICONS}/text_file.png`, label: 'todo.txt', opens: 'todo' },
      { icon: `${ICONS}/text_file.png`, label: 'recipe.txt', opens: 'recipe' },
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
    id: 'untitled',
    title: 'untitled — Notepad',
    icon: `${ICONS}/text_file.png`,
    kind: 'note',
    lines: [
      'GROCERY LIST',
      'whole wheat bread',
      'salted butter',
      'call the grandchildren',
    ],
  },
  {
    id: 'untitled-2',
    title: 'untitled (2) — Notepad',
    icon: `${ICONS}/text_file.png`,
    kind: 'note',
    lines: [
      'GROCERY LIST (v2)',
      'bread (any bread at this point)',
      'butter (unsalted is fine)',
      'STOP RENAMING FILES',
    ],
  },
  {
    id: 'untitled-3',
    title: 'untitled (3) — Notepad',
    icon: `${ICONS}/text_file.png`,
    kind: 'note',
    lines: [
      'GROCERY LIST (FINAL)',
      'bread',
      'bread?',
      'who keeps copying these',
      'DELETE ME',
    ],
  },
  {
    id: 'asdf',
    title: 'asdf — Notepad',
    icon: `${ICONS}/text_file.png`,
    kind: 'note',
    lines: ['asdfghjkl'],
  },
  {
    id: 'todo',
    title: 'todo.txt — Notepad',
    icon: `${ICONS}/text_file.png`,
    kind: 'note',
    lines: [
      'TODO:',
      '1. find the password note',
      '2. reply to the grandkids',
      '3. don’t click the toaster',
    ],
  },
  {
    id: 'recipe',
    title: 'recipe.txt — Notepad',
    icon: `${ICONS}/text_file.png`,
    kind: 'note',
    lines: [
      'GRANDMA’S FAMOUS TOAST',
      'INGREDIENTS: bread',
      '1. turn on toaster',
      '2. toast the bread',
      '3. spread the butter',
    ],
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
    // Deliberately targets nothing: the broken shortcut is the joke.
    id: 'mail',
    label: 'Inbox',
    icon: `${ICONS}/mail.png`,
  },
  {
    id: 'scanner',
    label: 'Virus Shield',
    icon: `${ICONS}/search.png`,
    windowId: 'scanner',
  },
  {
    // Desktop twin of Start → Internet: both open Bargain Barn.
    id: 'internet',
    label: 'The Internet',
    icon: `${ICONS}/world.png`,
    browserWindowId: 'shopping',
  },
];

// The real email hides mid-list, between the joke decoys.
export const EMAILS: EmailConfig[] = [
  {
    id: 'dog',
    from: 'Your Grandson',
    subject: 'FW: FW: photos of the dog',
    date: 'Mon',
    target: false,
    joke: JOKES.emailDog,
  },
  {
    id: 'chain',
    from: 'Your Sister-in-Law',
    subject: 'FW: FW: FW: (no subject)',
    date: 'Mon',
    target: false,
    joke: JOKES.emailChain,
  },
  {
    id: 'joke',
    from: 'The Grandkids',
    subject: 'RE: RE: RE: Fwd: the joke',
    date: 'Today',
    target: true,
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
    id: 'horoscope',
    from: 'Daily Horoscope',
    subject: 'Scorpio: your week is toasty',
    date: 'Tue',
    target: false,
    joke: JOKES.emailHoroscope,
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
    id: 'vitamins',
    from: 'TOTAL HEALTH',
    subject: 'Doctors hate this one weird trick',
    date: 'Wed',
    target: false,
    joke: JOKES.emailVitamins,
  },
  {
    id: 'trial',
    from: 'Rainbows95',
    subject: 'Your free trial has expired',
    date: 'Today',
    target: false,
    joke: JOKES.emailTrial,
  },
  {
    id: 'cart',
    from: 'Best Deals',
    subject: 'RE: RE: your cart (1,000 toasters)',
    date: 'Today',
    target: false,
    joke: JOKES.emailCart,
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
    emoji: '🍞',
    joke: JOKES.toasterTile,
  },
  {
    id: 'toaster-plus',
    name: 'Another Toaster',
    price: '$5.99',
    emoji: '🍞',
    joke: JOKES.toasterSecond,
  },
  {
    id: 'toaster-free',
    name: 'FREE* Toaster',
    price: '$0.00*',
    emoji: '🍞',
    joke: JOKES.toasterFree,
  },
  {
    id: 'warranty',
    name: 'Extended Warranty',
    price: '$19.99',
    emoji: '🛡️',
    joke: JOKES.extendedWarranty,
  },
  {
    id: 'samples',
    name: 'Bread Samples',
    price: '$3.50',
    emoji: '🥖',
    joke: JOKES.breadSamples,
  },
  {
    id: 'ram',
    name: 'More RAM',
    price: '$12.99',
    emoji: '📝',
    joke: JOKES.moreRam,
  },
];

// The Start menu doubles as the desktop's launcher: the first two items open
// the browser windows, Help re-reads the current mission, Task Manager opens
// the task list, Shut Down... opens the power dialog, and the
// rest are grandma's joke entries.
export const START_ITEMS: StartMenuItem[] = [
  {
    id: 'inbox',
    label: 'Inbox',
    icon: `${ICONS}/mail.png`,
    windowId: 'inbox',
  },
  {
    id: 'internet',
    label: 'Internet',
    icon: `${ICONS}/world.png`,
    windowId: 'shopping',
  },
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
    action: 'show-mission',
  },
  {
    id: 'run',
    label: 'Run...',
    icon: `${ICONS}/script_file.png`,
    message: JOKES.startRun,
  },
  {
    id: 'task-manager',
    label: 'Task Manager',
    icon: `${ICONS}/program.png`,
    action: 'task-manager',
  },
  {
    id: 'shutdown',
    label: 'Shut Down...',
    icon: `${ICONS}/password_manager.png`,
    action: 'shutdown',
  },
];

// Right-click on the bare desktop — and, Win95-style, inside the list icon
// windows, whose folder menus are nearly identical. Paste and Paste Shortcut
// stay greyed out the way Win95 leaves them when the clipboard is empty.
export const DESKTOP_CONTEXT_MENU: ContextMenuItem[] = [
  { id: 'arrange', label: 'Arrange Icons', message: JOKES.contextArrange },
  { id: 'line-up', label: 'Line up Icons', message: JOKES.contextLineUp },
  { id: 'sep-desktop', separator: true },
  { id: 'paste', label: 'Paste', disabled: true },
  { id: 'paste-shortcut', label: 'Paste Shortcut', disabled: true },
  { id: 'sep-desktop-2', separator: true },
  { id: 'refresh', label: 'Refresh', message: JOKES.contextRefresh },
  { id: 'sep-desktop-3', separator: true },
  { id: 'properties', label: 'Properties', message: JOKES.contextProperties },
];

// Right-click on a desktop icon: `open` runs the icon's own double-click
// path, so the broken mail shortcut still raises the MAIL.EXE error.
export const ICON_CONTEXT_MENU: ContextMenuItem[] = [
  { id: 'open', label: 'Open', action: 'open' },
  { id: 'sep-icon', separator: true },
  { id: 'delete', label: 'Delete', message: JOKES.contextDelete },
  {
    id: 'icon-properties',
    label: 'Properties',
    message: JOKES.contextIconProperties,
  },
];

// Right-click on a row inside a list window: Win95 shows the file menu, not
// the folder menu. `Open` runs the row's own double-click path, greyed out
// when the row has nothing to open; Delete and Properties share the icon
// jokes.
export function rowContextMenu(row: IconWindowRow): ContextMenuItem[] {
  return [
    row.opens === undefined
      ? { id: 'row-open', label: 'Open', disabled: true }
      : { id: 'row-open', label: 'Open', action: 'open' },
    { id: 'row-sep', separator: true },
    { id: 'row-delete', label: 'Delete', message: JOKES.contextDelete },
    {
      id: 'row-properties',
      label: 'Properties',
      message: JOKES.contextIconProperties,
    },
  ];
}
