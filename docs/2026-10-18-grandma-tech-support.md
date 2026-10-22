# Grandma Tech Support

## Overview

A short, funny browser game about being Grandma’s tech support. The player lands on a
playful, **fictional** Windows 95-style desktop (an homage, not a copy of a real OS) and
works through a chain of six silly tasks (log in, find the email, order a toaster, sit
through a botched update, end-task a frozen page, defuse a pop-up storm) while dodging
fake warnings and misleading buttons.

- **Genre:** comedy point-and-click / puzzle vignette
- **Session length:** 10–12 minutes for the full six-task chain
- **Tone:** warm, silly, grandma-flavored; nothing scary, nothing real
- **Lose state:** none. Wrong clicks produce jokes and the player retries.
- **Win condition:** complete all six tasks — log in, open the email, order the
  toaster, reboot through the update, end-task the frozen page, run the scanner. Each
  task ends in a Win95 dialog; the sixth ends in the final screen. See
  [missions](./2026-10-19-missions.md).

## Core loop

1. Rainbows95 boots through the clouds splash (the `logo.svg` flag over
   `backgrounds/clouds.jpg`), and as the clouds lift the desktop opens blank —
   desktop icons, taskbar, and Grandma’s instruction, the current task, in her own
   words:
   > I need to check my email, dear. It should be in the Start menu.
   > I wrote my password in a note somewhere.
2. The player launches the Inbox from the Start menu, digs through desktop icon windows
   for clues (the password lives on "the other note" in My Documents), and logs in.
3. Logging in springs the whole desktop back open: Shopping, Virus, and Inbox pile up
   with pop-ups whose big misleading buttons (`Buy`, `Fix now!`, `Close`) are traps.
   Only the tiny `×` in the pop-up’s title bar is safe.
4. Clicking a misleading button opens a Win95-style joke dialog. After clicking `OK`
   everything resets for another try (pop-up stays open; liar `Close` spawns extras).
5. Each completed task opens a `Next task` dialog with a line from Grandma; the tasks
   escalate into a pop-up storm that the scanner program sweeps away. The last task
   ends in the final screen and `Play again`, which resets the whole evening back to
   the blank desktop.

## Desktop contents

### Windows (all three are browser windows: title bar + back/forward/URL chrome)

| Window         | Title                             | Icon                   | Launch                         | Pop-up storm            |
| -------------- | --------------------------------- | ---------------------- | ------------------------------ | ----------------------- |
| Shopping       | `🔥 Bargain Barn — TODAY ONLY!!!` | `world.png`            | Start → Internet; task 2       | tasks 3, 6; frozen in 5 |
| Inbox (target) | `✉ Inbox (12) — Grandma’s Mail`   | `mail.png`             | Start → Inbox; task 2          | tasks 3, 6              |
| Fake warning   | `⚠ URGENT: VIRUS DETECTED ⚠`      | `password_manager.png` | task 2 (spring-back with spam) | tasks 3, 6              |

All three windows start **closed** — the desktop opens blank, and the stacked z-order
above applies once they're open (virus on top, tempting).

- Open windows start at fixed, pairwise-overlapping positions (scaled to the viewport
  on mount) and can be **dragged by the title bar** with a pointer (mouse/touch/pen).
- Clicking anywhere on a window raises it (`z-order` re-stack).
- Title-bar window controls: minimize (`–`) hides the window, maximize (`□`) fills the
  desktop above the taskbar (drag is disabled while maximized and the button becomes a
  restore `▣`), and close (`×`) closes for real: frame and taskbar button disappear,
  and the window's pop-ups go down with it. Back/forward buttons joke. The URL bar
  shows a fake address.
- Taskbar: `Start` button (toggles the Start menu), one button per **open** window
  (restores a minimized window or else raises it, pressed style for the focused
  window), tray with a live clock showing the current time in the player's locale.
- Start menu: `Inbox` and `Internet` launch the two browser windows;
  `Programs`, `Documents`, `Settings`, and `Find` cascade into flyouts whose
  leaves are joke dialogs. Programs is a time capsule: `Solitaire` keeps the
  old “20 programs, 19 Solitaires” line beside `Minecraft`, `Steam`,
  `Discord`, and `Toaster Setup`. Documents mixes a working `My Documents`
  launcher among identically named recent files; Settings offers
  `Control Panel`, `Printers`, and `Taskbar...`; Find offers
  `Files or Folders...`, `Computer...`, and `On the Internet...`. Flyouts
  open on hover or tap, follow the pointer between parents, and peel away on
  Escape before the menu itself closes; an outside press takes only the
  flyout. `Run...` closes the menu and shows a joke dialog, `Help` re-reads
  the current mission, `Task Manager` opens the task list dialog (Win95's
  Close Program under its NT-era name), and `Shut Down...` opens Win95's
  power dialog — see [shutdown](./2026-10-20-shutdown-restart.md). Its
  vertical side stripe brands the fictional OS as **Rainbows95**.
- Desktop icons (single click selects, Win95 style): `My Computer`, `Recycle Bin`,
  `My Documents`, `Sticky Notes`, `Calculator`, `Virus Shield`, `The Internet`, and the
  decoy `Inbox`. Double-clicking six of the icons opens floating mini-windows — see
  [icon-windows](./2026-10-19-desktop-icon-windows.md). `The Internet` opens Bargain
  Barn, the same window as Start → Internet. Double-clicking the decoy fails the way
  Win95 fails: a “Cannot find the file MAIL.EXE” system error (red X, error ding), and
  Grandma points the player back to “the internet thing”.

### Pop-ups

Each pop-up is a small dialog layered over its window body with a translucent backdrop
that blocks the content underneath. Every pop-up has:

- Big **misleading buttons** (joke dialog on click, pop-up stays open)
- A liar **`Close`** button: joke dialog **plus two extra spam pop-ups** (spam pop-ups
  also contain a liar `Close`; capped at 5 pop-ups per window)
- A tiny real dismiss **`×`** in the title bar (the only safe way out)

| Popup  | Window    | Message                                                                            | Buttons             |
| ------ | --------- | ---------------------------------------------------------------------------------- | ------------------- |
| `deal` | Shopping  | "You’re the 1,000,000th visitor! Claim your FREE toaster (shipping not included)." | `Buy`, `Close`      |
| `full` | Inbox     | "Your mailbox is 99% FULL! Fix now to avoid EXPLOSION."                            | `Fix now!`, `Close` |
| `spam` | (spawned) | "Your prize is waiting! FREE mouse (animal not included)."                         | `Claim`, `Close`    |

### Fake virus warning

Not a pop-up — a full window with a blinking red alert and two buttons:

- `CLEAN MY COMPUTER NOW!` → "Your computer is now 400% more infected. Just kidding,
  someone made this in Paint."
- `Maybe later` → "It’ll still be urgent later."

### Inbox

Toolbar pixels are decorative (not interactive). Email list:

| From           | Subject                     | Result      |
| -------------- | --------------------------- | ----------- |
| The Grandkids  | `RE: RE: RE: Fwd: the joke` | **Win**     |
| Your Grandson  | `FW: FW: photos of the dog` | Joke dialog |
| Windows Update | `Important!!`               | Joke dialog |

### Task and win screens

Every task ends in the same Win95 dialog, dressed with the task's title, message, and
icon: `Next task` for tasks 1–5, `Computer saved!` and `Play again` for the sixth.
Each one plays the `win` jingle. The final screen's closing line from Grandma:

> "You saved it, my dear! The computer stays with me. Tell your grandfather it was a
> close call."

`Play again` fully resets the game, including the log-on gate.

## Visual spec

- **Fictional Win95 pastiche:** teal `#008080` desktop, `#c0c0c0` faces with 3D
  outset/inset borders, navy→blue gradient title bars (gray gradient when inactive),
  raised buttons that press when active, gray taskbar, blinking sale banner.
- **Typography:** system Tahoma/Verdana stack (no web fonts, offline friendly);
  the black power screens use the system monospace stack in VGA text-mode spirit.
- **Icons:** `public/windows_icons_32x32/` (Windows 95 ~Calming~ Icon Pack, credited in
  the README). Shown at their native 32px where they fit (desktop icons, pop-ups) and
  scaled to 16–48px elsewhere, always with `image-rendering: pixelated` to stay crisp.
  Every asset path is **relative** (never a leading `/`) so subpath deploys (GitHub
  Pages, itch.io) resolve correctly.
- **App icon:** `public/logo.svg` — the waving four-pane flag with its pixel-dissolve
  trail, silhouette-adapted from the Windows 95 logo (a deliberate parody homage) but
  wearing its own rainbow quadrant palette — pink, yellow, violet, cyan, not
  Microsoft's red, green, blue, yellow. Flag-only, no wordmark, so it stays legible at
  favicon sizes.
- **Motion:** CSS `@keyframes` only — popup scale-in, dialog wobble, win-screen pop,
  start-menu slide, ad blink. A new grandma line replays a bubble pop plus a wiggle from
  the emoji, keyed on the line change so unchanged text never re-animates. Honors
  `prefers-reduced-motion`.
- **Responsive:** windows use viewport-scaled initial positions and
  `min(92vw, 440px)` widths; drag clamping keeps title bars reachable; the layout is
  usable down to ~360px.

## Interaction spec

- **Raise:** click/pointerdown anywhere on a window (or its taskbar button).
- **Drag:** pointer events on the title bar, 1:1 tracking, no inertia (authentic to the
  era). Clamped to `[0, innerWidth - 150] × [0, innerHeight - 60]` so windows can never
  escape the desktop. Listeners attach to `window` for the duration of the drag.
- **Keyboard:** all interactive elements are real `<button>`s; window titles can be
  tabbed to and activated to raise; openable file rows activate the same way; dialogs
  autofocus their primary button.
- **Feedback:** wrong clicks open a modal `System Message` dialog ( `role="alertdialog"`,
  `OK` dismisses), dressed by its variant: 😅 joke face (default), red ❌ plus the
  error ding, or the silent ℹ️ info face for mission re-reads. Grandma’s speech
  bubble (`role="status"`) changes contextually.
- **Mission recall.** Reactions overwrite Grandma’s line, so clicking her speech
  bubble puts the current task back (the bubble is a real button with an `sr-only`
  hint); Start → `Help` shows the same instruction as a dialog instead.
- **Shut Down.** Start → `Shut Down...` closes the menu, puts Grandma’s protest
  (“Don’t shut it down! I’m expecting an email.”) in her speech bubble, and opens
  the plain Win95 `Shut Down` dialog (no backdrop): `Are you sure you want to:` with
  `Shut down the computer?` (default) / `Restart the computer?` radios and an
  autofocused `OK` beside `Cancel`. Cancel just closes it. Shutting down and
  restarting both pause the theme and go full-screen black — the amber safe-off line
  or the `Starting Rainbows95...` boot line — and both hand off to the clouds
  splash: the safe wake back to an untouched desktop (grandma trading the protest
  for her wake line), the restart to the reset one,
  each beat skippable by click. Each transition plays its power sound, and the
  desktop's return resumes the theme. The splash also opens the game itself. Full
  spec: [shutdown](./2026-10-20-shutdown-restart.md).
- **Right-click.** The browser’s own context menu is suppressed everywhere. The
  bare desktop opens Win95’s menu — Arrange Icons, Line up Icons, greyed-out
  Paste and Paste Shortcut, Refresh, Properties — every live entry a grandma
  joke. An icon opens its own menu: `Open` runs the icon’s double-click path
  (the decoy still raises its MAIL.EXE error) plus joke `Delete` and
  `Properties` entries. Browser windows and the taskbar swallow the click with
  no replacement menu; the list windows (`My Computer`, `My Documents`,
  `Recycle Bin`) open the same folder menu Win95 gives their backgrounds, and a
  right-clicked row gets the file menu instead — `Open` runs the row's own open
  path (greyed out when the row has nothing to open) beside joke `Delete` and
  `Properties` entries — while notes, Calculator, and Virus Shield just swallow.
  Opening a menu closes the Start
  menu; the menu is clamped inside the viewport, focuses its first enabled
  entry, and dismisses on an outside press or Escape.

## Accessibility

- Semantic buttons everywhere; fake window chrome buttons carry real labels
  (`Minimize <title>`, `Maximize <title>`, `Close <title>`).
- Pop-up dismiss buttons are named `Close popup`, distinct from the liar `Close`.
- Decorative pixels (backdrop, icon glyphs) are `aria-hidden` or `alt=""`.
- Reduced-motion media query disables animations.

## Technical design

- **Stack:** React 19, TypeScript 6 (strict), Tailwind CSS 4, Vite 8, Vitest 4,
  React Compiler enabled (no `useMemo`/`useCallback`).
- **Zero runtime dependencies** beyond React/Tailwind: dragging is hand-rolled pointer
  events; animations are CSS. (Motion was considered and rejected — its spring physics
  fight the Win95 feel, it would weaken drag-clamp testability in jsdom, and the game’s
  animation surface is tiny.)

### Structure (concern-based)

```
src/
├── components/
│   ├── App/             composition root, owns all game state via useGame
│   ├── ContextMenu/     right-click menu (desktop + icons), edge-clamped
│   ├── DesktopIcon/     32px icon + label, selectable, double-click opens
│   ├── IconWindow/      floating mini-window (list/note/calculator/scanner bodies)
│   ├── BrowserWindow/   window chrome + raise + drag + browser toolbar
│   ├── Popups/          filters pop-ups for a window, renders backdrop + stack
│   ├── Popup/           single pop-up dialog (liar buttons + real ×)
│   ├── MessageDialog/   Win95 joke dialog (OK)
│   ├── ShutdownDialog/  Win95 power dialog (shutdown vs restart radios)
│   ├── PowerScreen/     clouds splash + safe-off / boot beats over everything
│   ├── ShoppingWindow/  ad-crusted sale page (joke tiles)
│   ├── InboxWindow/     log-on gate + toolbar pixels + email list
│   ├── VirusWindow/     blinking red alert + two joke buttons
│   ├── GrandmaSpeech/   speech bubble, context-aware
│   ├── Taskbar/         Start button + window buttons + tray (clock, volume)
│   ├── VolumeControl/   tray speaker → Win95 vertical-fader volume popup
│   ├── StartMenu/       launchers (Inbox, Internet) + joke menu items
│   └── WinScreen/       prop-driven task/win overlay
├── hooks/useDoubleClickOpen.ts shared double-click/Enter open gesture
├── hooks/useGame.ts     z-order, positions, pop-ups, dialogs, mission chain, menu state, power screens
├── utils/createWindowDrag.ts shared title-bar pointer-drag for both window kinds
├── services/audio.ts    SFX over HTMLAudioElement, volume/mute + localStorage
├── data/gameContent.ts  every title, URL, joke, popup config, email, menu item, objective
├── types/game.ts        WindowId, PopupId, configs, phases, mission types (excluded from coverage)
└── style.css            Win95 @theme tokens, outset/inset utilities, keyframes
```

### State model (`useGame`)

- `zOrder: WindowId[]` — last = focused/front; `raise(id)` re-stacks.
- `open: Record<WindowId, boolean>` — every browser window starts closed, so the
  desktop opens blank. `openWindow(id)` (Start menu, task spring-back, storm) shows,
  un-minimizes, and raises; `closeWindow(id)` closes and drops that window's pop-ups.
  `focusedId` only considers open, un-minimized windows.
- `positions: Record<WindowId, WindowPosition>` — viewport-scaled on mount; `moveWindow`
  applies pointer deltas (clamping lives in `BrowserWindow`, branchless `Math.min/max`).
- `openPopups: OpenPopup[]` — `{ key, popupId, windowId }`; starts empty, task spawns
  and liar `Close` append entries via a `useRef` counter for unique keys, capped at 5
  per window.
- `message: string | null` — System Message contents; `messageVariant` picks grandma’s
  joke face (default), the red X plus an error ding, or the silent ℹ️ info face
  (mission recall). `repeatObjective()` puts the current task back in
  `grandmaLine`; the Start menu’s `Help` shows it as a dialog instead.
- `grandmaLine: string` — intro → task instructions → "little X" line on safe
  dismiss → decoy-mail line → the Shut Down protest (her bubble gets the last
  word, not the dialog) → the wake line once the machine is back on, plus the
  frozen-window diagnosis whenever a dead page gets poked.
- `selectedIcon`, `startOpen` — desktop/menu state. The right-click context menu
  lives in App (not `useGame`): desktop vs. icon menu, coordinates, and the
  icon’s stored open action.
- `shutdownOpen`, `powerScreen: 'safe' | 'boot' | 'splash' | null` — the power
  dialog and the full-screen beats above every other layer. `powerScreen` starts
  as `'splash'`: the game boots through the clouds screen, which holds the whole
  desktop back until it lifts. `confirmShutdown(mode)` closes the dialog, plays
  the power sound, and pauses the theme; only restart also runs `playAgain()`
  behind the screens. `leavePowerScreen()` walks either black line → splash →
  desktop, where the return sound and theme wait, and `playAgain()` clears both
  flags. See
  [shutdown](./2026-10-20-shutdown-restart.md).
- `updateStage: 'installing' | 'restored' | 'failed' | null`, `frozen:
Record<WindowId, boolean>`, `closeProgramOpen`, and the queued `pendingEvent` —
  tasks 4 and 5: the UpdateDialog's click-driven stage, which windows are dead
  to every input, the Task Manager dialog (`Start → Task Manager`, plus the
  secret Ctrl+Alt+Del chord where the browser delivers it), and the
  `update-rebooted` completion waiting behind the clouds. The update's
  `Restart now` reboots without `playAgain()`, and `End Task` thaws and closes
  the frozen window for real. See
  [missions](./2026-10-19-missions.md).
- `openIconWindows`, `iconWindowPositions`, `iconZOrder`, `iconMinimized` — desktop
  mini-windows; `openIconWindow` cascades the default position per open window,
  `iconFocusedId` is the top visible one, and `playAgain` closes them all.
- **Taskbar toggle:** clicking a taskbar button for the active window (browser or icon)
  minimizes it; any other button restores and activates.
- `phase: 'playing' | 'taskDone' | 'won'` — set by completing the current task;
  `objectiveIndex` tracks the chain, `loggedIn` gates the inbox, `stormTriggered`
  remembers the task-3 ad storm, and `playAgain()` resets all of it.

## Sound

Interface sound design — the SFX event table (button ticks, joke dings, the win
jingle, the power transitions), the tray Volume Control popup, and the BGM plan —
lives in [audio-support](./2026-10-18-audio-support.md).

## Out of scope

- Real network requests, real e-mail, real OS behavior
- Save games, difficulty modes, scoring/lose states
- Mobile-first layout (playable, but designed for desktop browsers)
