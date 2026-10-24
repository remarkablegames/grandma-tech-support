import type {
  ContextMenuItem,
  DesktopIconConfig,
  EmailConfig,
  IconWindowConfig,
  IconWindowId,
  IconWindowRow,
  MissionFileConfig,
  ObjectiveConfig,
  PopupConfig,
  PopupId,
  PopupSpawn,
  ProductConfig,
  StartMenuItem,
  UpdateStage,
  WindowMeta,
} from 'src/types/game';
import { isConsumable } from 'src/utils/resolveIconDrop';

const ICONS = 'windows_icons_32x32';

// The bin's two faces: Win95 swaps the graphic the moment anything lands
// inside it.
export const RECYCLE_BIN_ICONS = {
  empty: `${ICONS}/recycle_bin_empty.png`,
  full: `${ICONS}/recycle_bin_full.png`,
};

export const JOKES = {
  toasterTile:
    'That’s the seventh toaster, dear. The garage is mostly toasters now.',
  toasterSecond:
    'That’s another toaster. We have enough to replace our heater now.',
  toasterFree: 'Another free toaster... I wonder how the company makes money.',
  extendedWarranty:
    'The warranty covers everything except toasters. Do read the fine print.',
  breadSamples:
    'Congratulations, you bought the bread samples. The loaf’s been expired since last week.',
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
  goForward: 'Forward is where the popups live.',
  emailDog: 'Attached: the dog. Also attached: the same dog again.',
  emailUpdate: 'That’s the update that broke the internet.',
  emailPrize: 'You’ve been selected for a free toaster!',
  emailWire:
    'That’s not your grandson, dear. Your grandson isn’t a “Nigerian prince”.',
  emailChain:
    'Forward this message or your free trial of the internet expires.',
  emailHoroscope: 'Hot things await!',
  emailVitamins:
    'One weird trick: Get your vitamins from a popup. Doctors really do hate this one.',
  emailTrial: 'Your trial expired in 1995. Please mail us a check.',
  emailCart: 'Your cart has one product in it for years.',
  mailError:
    'Cannot find the file “MAIL.EXE” (or one of its components). Make sure the path and filename are correct and that all required libraries are available.',
  buyBlocked: 'The page is buried in popups. Close them all first.',
  startPrograms: 'There are 20 programs. 19 of them are Solitaire.',
  startSettings: 'Everything’s set to “don’t touch”.',
  startFind: 'It was open in the internet thing.',
  startRun: 'That’s how the toaster got installed.',
  startMinecraft: 'Your grandfather calls it electronic Lego.',
  startSteam:
    'It’s updating again. Hundreds of games in the library and only Solitaire gets played.',
  startDiscord:
    'That’s where your cousins talk now. It used to be on the telephone.',
  startToasterSetup:
    'Setup has been installing since the day it was installed.',
  startPrinters:
    'The screen says “PC LOAD LETTER”. Nobody knows what it means.',
  startTaskbar:
    'The taskbar is set to auto-hide, but it never does. Guess it’s not great at following instructions.',
  startFindFiles: 'Last search: “the internet thing”. Zero results found.',
  startFindComputer: 'Searching the network... One computer found: this one.',
  contextArrange: 'They’re already arranged by importance.',
  contextLineUp: 'They’re as lined up as they’re going to get.',
  contextRefresh: 'Refreshed! Nothing was broken, so nothing changed.',
  contextProperties: 'It’s set to “don’t touch”. Same as everything else.',
  contextDelete: 'Task failed successfully.',
  contextIconProperties: 'The main property is that it’s not a toaster.',
  closeSticks: 'Nice try, dear! That page doesn’t close.',
  inboxProtected: 'Not that one, dear! That’s the one from your grandkids.',
  emailAlreadyRead: 'I’ve read that one twice already, dear. Leave it be.',
  diskFull:
    'Cannot run Toaster Setup: not enough free disk space on Drive C:. (4 bytes free)',
  defragStopped:
    'Defrag stopped. The drive has decided it’s had enough for today.',
  defragEarlyExit:
    'Early exit confirmed. The drive will try not to take it personally.',
  defragIdleDone:
    'Defrag complete. The drive finished rearranging the little squares.',
} as const;

export const GRANDMA_LINES = {
  intro:
    'I need to check my email, dear. I wrote my password in a note somewhere.',
  correctClose:
    'That’s it! The little X in the corner. Never trust a big button.',
  mailDecoy:
    'That one’s been broken since 2000. Your email’s in the internet thing.',
  inboxFull: 'That’s all the junk the inbox can hold, dear. Delete some!',
  shutDown: 'Don’t shut it down! There’s an unfinished task.',
  powerBack: 'It’s back! Did anything happen while it was dark?',
  frozen: 'It’s not responding! Try quitting it with the Task Manager.',
  win: 'You did it, my dear! You found my email and didn’t fall for the spam.',
  wrongPassword: 'Incorrect password.',
  saved: 'You saved it, my dear! Tell your grandfather it was a close call.',
  diskFullInstruction:
    'The drive is full! There are some big files on the desktop. We’ll need to delete them.',
  diskBinned: 'Still no space. Should we empty the bin?',
  diskFreed:
    'There’s room now! Let’s tidy up the drive with the Disk Defragmenter.',
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

// The eight-task mission chain. Each entry completes on its event; when the
// next task starts, its instruction becomes grandma's line, its `open`
// windows spring up, and its `spawn` popups land on top of those.
export const OBJECTIVES: ObjectiveConfig[] = [
  {
    instruction: GRANDMA_LINES.intro,
    doneTitle: 'Task 1 of 8 complete',
    doneMessage: 'I’m in, dear! Now find the real email, not the spam ones.',
    icon: `${ICONS}/sticky_note.png`,
    completesOn: 'logged-in',
  },
  {
    instruction:
      'That’s my mail popping open, dear! Double-click the one from the grandkids. The toaster ones are nonsense.',
    doneTitle: 'Task 2 of 8 complete',
    doneMessage: GRANDMA_LINES.win,
    icon: `${ICONS}/mail.png`,
    completesOn: 'email-opened',
    open: ['inbox'],
    spawn: [{ windowId: 'inbox', popupId: 'full', count: 1 }],
  },
  {
    instruction:
      'Junk mail keeps piling up in my inbox! Delete them for me, please.',
    doneTitle: 'Task 3 of 8 complete',
    doneMessage: 'Spotless! Now, about that toaster...',
    icon: `${ICONS}/mail.png`,
    completesOn: 'inbox-cleared',
    open: ['inbox'],
    clearPopups: true,
    inboxTopUp: 3,
  },
  {
    instruction:
      'Would you order me a toaster, dear? The burning shopping page. And don’t try to close it, it just comes back!',
    doneTitle: 'Task 4 of 8 complete',
    doneMessage:
      'Ordered! Although I may have clicked something while we waited, dear.',
    icon: `${ICONS}/world.png`,
    completesOn: 'order-placed',
    open: ['shopping'],
    clingy: ['shopping'],
  },
  {
    instruction: 'It’s auto-updating! Cancel it if it’s stuck.',
    doneTitle: 'Task 5 of 8 complete',
    doneMessage: 'New and improved! Although the toaster page broke.',
    icon: `${ICONS}/tools.png`,
    completesOn: 'update-rebooted',
    update: true,
  },
  {
    instruction:
      'The bargain page stopped responding! Use the Task Manager to end it.',
    doneTitle: 'Task 6 of 8 complete',
    doneMessage:
      'It stopped yelping! And I may have clicked one little thing while you were in there.',
    icon: `${ICONS}/program.png`,
    completesOn: 'frozen-ended',
    open: ['shopping'],
    freeze: ['shopping'],
  },
  {
    instruction:
      'The whole screen is yelling, dear! Don’t touch the urgent ones. Use the shield program to fix it.',
    doneTitle: 'Task 7 of 8 complete',
    doneMessage:
      'The popups are gone! But I may have accidentally installed something in the meantime.',
    icon: `${ICONS}/password_manager.png`,
    completesOn: 'scan-complete',
    spawn: [
      { windowId: 'shopping', popupId: 'spam', count: 3 },
      { windowId: 'inbox', popupId: 'spam', count: 3 },
      { windowId: 'virus', popupId: 'spam', count: 3 },
    ],
  },
  {
    // The finale: the toaster install filled the drive. The error dialog
    // takes over at task start, the culprits land on the desktop, and only
    // the defragmenter finishes it off.
    instruction: GRANDMA_LINES.diskFullInstruction,
    doneTitle: 'Computer saved!',
    doneMessage: GRANDMA_LINES.saved,
    icon: `${ICONS}/parsec.png`,
    completesOn: 'defrag-done',
    lowDisk: true,
  },
];

// The disk-full task's culprits: they sit at the top of the desktop's
// second column until the player drags them into the Recycle Bin, and they
// live only inside that task (the layout store never learns their ids).
export const MISSION_FILES: MissionFileConfig[] = [
  {
    id: 'toaster-8-install',
    label: 'toaster_8_install.exe',
    icon: `${ICONS}/program.png`,
    home: { col: 1, row: 0 },
  },
  {
    id: 'toasters-movie',
    label: 'toasters_the_movie.avi',
    icon: `${ICONS}/video_file.png`,
    home: { col: 1, row: 1 },
  },
];

// The first toaster click of task 4 unleashes this storm on the sale page
// alone — the deal popup plus three spam, still under the five-popup cap —
// and the page refuses to close for the first two tries.
export const BUY_STORM: PopupSpawn[] = [
  { windowId: 'shopping', popupId: 'deal', count: 1 },
  { windowId: 'shopping', popupId: 'spam', count: 3 },
];

// The inbox's window title counts its mail, live: the frame and the taskbar
// button both tick down as junk is deleted and back up as it breeds.
export const inboxTitle = (count: number): string =>
  `✉ Inbox (${String(count)}) — Grandma’s Mail`;

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
  {
    id: 'joke',
    from: 'The Grandkids',
    subject: 'RE: RE: RE: Fwd: funny picture',
    date: 'Today',
    target: true,
  },
];

// The junk that breeds: opening any decoy pushes two more of these onto
// the bottom of the inbox, hard-capped so a curious player can't make the
// list unfinishable. Four is the ceiling for the whole evening.
export const MAX_ADDED_JUNK = 4;
export const JUNK_EMAILS: EmailConfig[] = [
  {
    id: 'junk-1',
    from: 'TOASTER DEPT',
    subject: 'FW: FW: your FREE toaster (again)',
    date: 'Today',
    target: false,
    joke: JOKES.emailPrize,
  },
  {
    id: 'junk-2',
    from: 'Rainbows95',
    subject: 'Your free toaster trial has expired',
    date: 'Today',
    target: false,
    joke: JOKES.emailTrial,
  },
  {
    id: 'junk-3',
    from: 'Best Deals',
    subject: 'RE: RE: your cart (19 toasters)',
    date: 'Today',
    target: false,
    joke: JOKES.emailCart,
  },
  {
    id: 'junk-4',
    from: 'Your Grandson (?)',
    subject: 'URGENT: grandma send toasters',
    date: 'Today',
    target: false,
    joke: JOKES.emailWire,
  },
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
    title: inboxTitle(EMAILS.length),
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
    icon: RECYCLE_BIN_ICONS.empty,
    kind: 'list',
    // Win95's bin starts fresh: the list only ever shows real shortcuts
    // the player recycled, so every row in it can be restored.
    rows: [],
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
      '1. turn on the toaster',
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
    system: true,
    windowId: 'computer',
  },
  {
    id: 'recycle',
    label: 'Recycle Bin',
    icon: RECYCLE_BIN_ICONS.empty,
    container: 'recycle',
    windowId: 'recycle',
  },
  {
    id: 'documents',
    label: 'My Documents',
    icon: `${ICONS}/folder_open.png`,
    container: 'folder',
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
// the browser windows, Programs' Disk Defragmenter opens the drive tool, Help
// re-reads the current mission, Task Manager opens the task list, Shut
// Down... opens the power dialog, and the rest are grandma's joke entries.
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
    children: [
      {
        id: 'solitaire',
        label: 'Solitaire',
        icon: `${ICONS}/games.png`,
        message: JOKES.startPrograms,
      },
      {
        id: 'minecraft',
        label: 'Minecraft',
        icon: `${ICONS}/minecraft.png`,
        message: JOKES.startMinecraft,
      },
      {
        id: 'steam',
        label: 'Steam',
        icon: `${ICONS}/steam.png`,
        message: JOKES.startSteam,
      },
      {
        id: 'discord',
        label: 'Discord',
        icon: `${ICONS}/discord.png`,
        message: JOKES.startDiscord,
      },
      {
        id: 'toaster-setup',
        label: 'Toaster Setup',
        icon: `${ICONS}/script_file.png`,
        message: JOKES.startToasterSetup,
      },
      {
        // The desktop icon's twin: task 6 stays winnable even after the
        // player empties the bin on the shortcut.
        id: 'virus-shield',
        label: 'Virus Shield',
        icon: `${ICONS}/search.png`,
        iconWindowId: 'scanner',
      },
      {
        id: 'defrag',
        label: 'Disk Defragmenter',
        icon: `${ICONS}/3d_graphics_program.png`,
        action: 'defrag',
      },
    ],
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: `${ICONS}/folder_closed.png`,
    // The folder's real contents, in folder order — a drift test keeps this
    // list in step with the My Documents window below.
    children: [
      {
        id: 'my-documents',
        label: 'My Documents',
        icon: `${ICONS}/folder_closed.png`,
        iconWindowId: 'documents',
      },
      {
        id: 'doc-untitled',
        label: 'untitled',
        icon: `${ICONS}/text_file.png`,
        iconWindowId: 'untitled',
      },
      {
        id: 'doc-untitled-2',
        label: 'untitled (2)',
        icon: `${ICONS}/text_file.png`,
        iconWindowId: 'untitled-2',
      },
      {
        id: 'doc-untitled-3',
        label: 'untitled (3)',
        icon: `${ICONS}/text_file.png`,
        iconWindowId: 'untitled-3',
      },
      {
        id: 'doc-asdf',
        label: 'asdf',
        icon: `${ICONS}/text_file.png`,
        iconWindowId: 'asdf',
      },
      {
        id: 'doc-other-note',
        label: 'the_other_note.txt',
        icon: `${ICONS}/text_file.png`,
        iconWindowId: 'other-note',
      },
      {
        id: 'doc-todo',
        label: 'todo.txt',
        icon: `${ICONS}/text_file.png`,
        iconWindowId: 'todo',
      },
      {
        id: 'doc-recipe',
        label: 'recipe.txt',
        icon: `${ICONS}/text_file.png`,
        iconWindowId: 'recipe',
      },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: `${ICONS}/tools.png`,
    children: [
      {
        id: 'control-panel',
        label: 'Control Panel',
        icon: `${ICONS}/tools.png`,
        message: JOKES.startSettings,
      },
      {
        id: 'printers',
        label: 'Printers',
        icon: `${ICONS}/printer.png`,
        message: JOKES.startPrinters,
      },
      {
        id: 'taskbar',
        label: 'Taskbar...',
        icon: `${ICONS}/clock.png`,
        message: JOKES.startTaskbar,
      },
    ],
  },
  {
    id: 'find',
    label: 'Find',
    icon: `${ICONS}/search.png`,
    children: [
      {
        id: 'find-files',
        label: 'Files or Folders...',
        icon: `${ICONS}/search.png`,
        message: JOKES.startFindFiles,
      },
      {
        id: 'find-computer',
        label: 'Computer...',
        icon: `${ICONS}/this_computer.png`,
        message: JOKES.startFindComputer,
      },
      {
        id: 'find-internet',
        label: 'On the Internet...',
        icon: `${ICONS}/world.png`,
        message: JOKES.startFind,
      },
    ],
  },
  {
    id: 'help',
    label: 'Help',
    icon: `${ICONS}/contact_book.png`,
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
// path, so the broken mail shortcut still raises the MAIL.EXE error. The
// Recycle Bin gets Win95's extra entry — Empty Recycle Bin, greyed out the
// way Win95 greys it when the bin holds nothing left to empty. `Delete`
// is Win95's own for whatever the bin will take; the icons that can't go
// anywhere keep the joke, where it's literally true.
export function iconContextMenu(
  icon: DesktopIconConfig,
  canEmpty: boolean,
): ContextMenuItem[] {
  const menu: ContextMenuItem[] = [
    { id: 'open', label: 'Open', action: 'open' },
  ];

  if (icon.container === 'recycle') {
    menu.push(
      canEmpty
        ? { id: 'empty-bin', label: 'Empty Recycle Bin', effect: 'empty-bin' }
        : { id: 'empty-bin', label: 'Empty Recycle Bin', disabled: true },
    );
  }

  menu.push(
    { id: 'sep-icon', separator: true },
    isConsumable(icon)
      ? {
          id: 'delete',
          label: 'Delete',
          effect: 'recycle',
          desktopId: icon.id,
          target: icon.label,
          icon: icon.icon,
        }
      : { id: 'delete', label: 'Delete', message: JOKES.contextDelete },
    {
      id: 'icon-properties',
      label: 'Properties',
      message: JOKES.contextIconProperties,
    },
  );

  return menu;
}

// Win95 asks before emptying the bin: the classic two-button confirm, Yes
// or No, with the full bin graphic looking on.
export const CONFIRM_EMPTY_BIN = {
  title: 'Confirm Delete',
  message: 'Are you sure you want to delete these items?',
} as const;

// Win95 asks before a single file's delete too: same title, the file
// quoted in the sentence — it goes to the bin unless it's already in it.
export const CONFIRM_RECYCLE_FILE = {
  title: 'Confirm Delete',
  message: (target: string) =>
    `Are you sure you want to delete ‘${target}’ from your desktop?`,
} as const;

export const CONFIRM_PURGE_FILE = {
  title: 'Confirm Delete',
  message: (target: string) => `Are you sure you want to delete ‘${target}’?`,
} as const;

// Right-click on a row inside a list window: Win95 shows the file menu, not
// the folder menu. `Open` runs the row's own double-click path, greyed out
// when the row has nothing to open; inside the Recycle Bin it also carries
// Win95's `Restore`, right on the deleted file (folders hold nothing to
// restore). `Delete` is Win95's own wherever the file can really go — to
// the bin from a folder, for real from the bin — and the joke for scenery
// rows; Properties keeps the icon joke everywhere.
export function rowContextMenu(
  row: IconWindowRow,
  windowId: IconWindowId,
): ContextMenuItem[] {
  const restore: ContextMenuItem[] =
    windowId === 'recycle' && row.desktopId !== undefined
      ? [
          {
            id: 'row-restore',
            label: 'Restore',
            effect: 'restore',
            desktopId: row.desktopId,
          },
        ]
      : [];

  const remove: ContextMenuItem[] =
    row.desktopId === undefined
      ? [{ id: 'row-delete', label: 'Delete', message: JOKES.contextDelete }]
      : [
          {
            id: 'row-delete',
            label: 'Delete',
            effect: windowId === 'recycle' ? 'purge' : 'recycle',
            desktopId: row.desktopId,
            target: row.label,
            icon: row.icon,
          },
        ];

  return [
    row.opens === undefined && row.desktopId === undefined
      ? { id: 'row-open', label: 'Open', disabled: true }
      : { id: 'row-open', label: 'Open', action: 'open' },
    ...restore,
    { id: 'row-sep', separator: true },
    ...remove,
    {
      id: 'row-properties',
      label: 'Properties',
      message: JOKES.contextIconProperties,
    },
  ];
}
