# Grandma Tech Support

## Overview

A short, funny browser game about being Grandma's tech support. The player lands on a
playful, **fictional** Windows 95-style desktop (an homage, not a copy of a real OS) and
must find Grandma's email among three overlapping browser windows — without falling for a
fake virus warning or the misleading buttons on pop-ups.

- **Genre:** comedy point-and-click / puzzle vignette
- **Session length:** 2–5 minutes
- **Tone:** warm, silly, grandma-flavored; nothing scary, nothing real
- **Lose state:** none. Wrong clicks produce jokes and the player retries.
- **Win condition:** open Grandma's inbox, dismiss its pop-up safely, open the email.

## Core loop

1. The desktop opens with three overlapping browser windows and Grandma's instruction:
   > "Help me find my email, dear. It was open in the internet thing. Don't click
   > anything that says it's urgent."
2. The player clicks windows to raise them to the front and inspects titles/contents.
3. Pop-ups inside the shopping and inbox windows offer big misleading buttons
   (`Buy`, `Fix now!`, `Close`). Only the tiny `×` in the pop-up's title bar is safe.
4. Clicking a misleading button opens a Win95-style joke dialog. After clicking `OK`
   everything resets for another try (pop-up stays open; liar `Close` spawns extras).
5. The player finds the inbox, dismisses its pop-up with the `×`, clicks the email, and
   wins. Grandma delivers a short, amused thank-you.

## Desktop contents

### Windows (all three are browser windows: title bar + back/forward/URL chrome)

| Window         | Title                             | Icon                   | Initial z-order | Popup        |
| -------------- | --------------------------------- | ---------------------- | --------------- | ------------ |
| Shopping       | `🔥 Bargain Barn — TODAY ONLY!!!` | `world.png`            | middle          | Yes (`deal`) |
| Inbox (target) | `✉ Inbox (12) — Grandma's Mail`   | `mail.png`             | bottom          | Yes (`full`) |
| Fake warning   | `⚠ URGENT: VIRUS DETECTED ⚠`      | `password_manager.png` | top (tempting)  | No           |

- Windows start at fixed, pairwise-overlapping positions (scaled to the viewport on
  mount) and can be **dragged by the title bar** with a pointer (mouse/touch/pen).
- Clicking anywhere on a window raises it (`z-order` re-stack).
- Title-bar window controls (`_`, `□`, `×`) are decorative and each tells a joke when
  clicked. Back/forward buttons joke too. The URL bar shows a fake address.
- Taskbar: `Start` button (toggles the Start menu), one button per window (raises it,
  pressed style for the focused window), tray with a clock reading `3:47 PM`.
- Start menu: `Programs`, `Documents`, `Settings`, `Find`, `Help`, `Run...`,
  `Shut Down...` — each closes the menu and shows a joke dialog. Its vertical side
  stripe brands the fictional OS as **Rainbows95**.
- Desktop icons (single click selects, Win95 style): `My Computer`, `Recycle Bin`,
  `My Documents`, `Sticky Notes`, `Calculator`, and the decoy `Grandma's Mail`. Selecting
  the decoy makes Grandma point the player back to "the internet thing".

### Pop-ups

Each pop-up is a small dialog layered over its window body with a translucent backdrop
that blocks the content underneath. Every pop-up has:

- Big **misleading buttons** (joke dialog on click, pop-up stays open)
- A liar **`Close`** button: joke dialog **plus two extra spam pop-ups** (spam pop-ups
  also contain a liar `Close`; capped at 5 pop-ups per window)
- A tiny real dismiss **`×`** in the title bar (the only safe way out)

| Popup  | Window    | Message                                                     | Buttons             |
| ------ | --------- | ----------------------------------------------------------- | ------------------- |
| `deal` | Shopping  | "You are the 1,000,000th visitor! Claim your FREE toaster…" | `Buy`, `Close`      |
| `full` | Inbox     | "Your mailbox is 99% FULL! Fix now to avoid EXPLOSION."     | `Fix now!`, `Close` |
| `spam` | (spawned) | "Your prize is waiting! FREE mouse (animal not included)."  | `Claim`, `Close`    |

### Fake virus warning

Not a pop-up — a full window with a blinking red alert and two buttons:

- `CLEAN MY COMPUTER NOW!` → "Your computer is now 400% more infected. Kidding — someone
  just made this window in Paint."
- `Maybe later` → "It'll still be urgent later, dear. It's very patient."

### Inbox

Toolbar pixels are decorative (not interactive). Email list:

| From           | Subject                     | Result      |
| -------------- | --------------------------- | ----------- |
| The Grandkids  | `RE: RE: RE: Fwd: the joke` | **Win**     |
| Your Grandson  | `FW: FW: photos of the dog` | Joke dialog |
| Windows Update | `Important!!`               | Joke dialog |

### Win screen

Amused thank-you from Grandma:

> "You did it, dear! You found my email, and you didn't fall for the toaster. Tell your
> grandfather the computer stays with me."

Plus a `Play again` button that fully resets the game.

## Visual spec

- **Fictional Win95 pastiche:** teal `#008080` desktop, `#c0c0c0` faces with 3D
  outset/inset borders, navy→blue gradient title bars (gray gradient when inactive),
  raised buttons that press when active, gray taskbar, blinking sale banner.
- **Typography:** system Tahoma/Verdana stack (no web fonts, offline friendly).
- **Icons:** `public/windows_icons_32x32/` (Windows 95 ~Calming~ Icon Pack, credited in
  the README). Shown at their native 32px where they fit (desktop icons, pop-ups) and
  scaled to 16–48px elsewhere, always with `image-rendering: pixelated` to stay crisp.
  Every asset path is **relative** (never a leading `/`) so subpath deploys (GitHub
  Pages, itch.io) resolve correctly.
- **App icon:** `public/logo.svg` — the waving four-pane flag with its pixel-dissolve
  trail, adapted from the Windows 95 logo (a deliberate parody homage; the game's own
  brand lives in the OS name "Rainbows95"). Flag-only, no wordmark, so it stays
  legible at favicon sizes.
- **Motion:** CSS `@keyframes` only — popup scale-in, dialog wobble, win-screen pop,
  start-menu slide, ad blink. Honors `prefers-reduced-motion`.
- **Responsive:** windows use viewport-scaled initial positions and
  `min(92vw, 440px)` widths; drag clamping keeps title bars reachable; the layout is
  usable down to ~360px.

## Interaction spec

- **Raise:** click/pointerdown anywhere on a window (or its taskbar button).
- **Drag:** pointer events on the title bar, 1:1 tracking, no inertia (authentic to the
  era). Clamped to `[0, innerWidth - 150] × [0, innerHeight - 60]` so windows can never
  escape the desktop. Listeners attach to `window` for the duration of the drag.
- **Keyboard:** all interactive elements are real `<button>`s; window titles can be
  tabbed to and activated to raise; dialogs autofocus their primary button.
- **Feedback:** wrong clicks open a modal `System Message` dialog ( `role="alertdialog"`,
  `OK` dismisses); Grandma's speech bubble (`role="status"`) changes contextually.

## Accessibility

- Semantic buttons everywhere; fake window chrome buttons carry real labels
  (`Minimize …`, `Maximize …`, `Close …`).
- Pop-up dismiss buttons are named `Close popup`, distinct from the liar `Close`.
- Decorative pixels (backdrop, icon glyphs) are `aria-hidden` or `alt=""`.
- Reduced-motion media query disables animations.

## Technical design

- **Stack:** React 19, TypeScript 6 (strict), Tailwind CSS 4, Vite 8, Vitest 4,
  React Compiler enabled (no `useMemo`/`useCallback`).
- **Zero runtime dependencies** beyond React/Tailwind: dragging is hand-rolled pointer
  events; animations are CSS. (Motion was considered and rejected — its spring physics
  fight the Win95 feel, it would weaken drag-clamp testability in jsdom, and the game's
  animation surface is tiny.)

### Structure (concern-based)

```
src/
├── components/
│   ├── App/             composition root, owns all game state via useGame
│   ├── DesktopIcon/     32px icon + label, selectable
│   ├── BrowserWindow/   window chrome + raise + drag + browser toolbar
│   ├── Popups/          filters pop-ups for a window, renders backdrop + stack
│   ├── Popup/           single pop-up dialog (liar buttons + real ×)
│   ├── MessageDialog/   Win95 joke dialog (OK)
│   ├── ShoppingWindow/  ad-crusted sale page (joke tiles)
│   ├── InboxWindow/     toolbar pixels + email list
│   ├── VirusWindow/     blinking red alert + two joke buttons
│   ├── GrandmaSpeech/   speech bubble, context-aware
│   ├── Taskbar/         Start button + window buttons + tray clock
│   ├── StartMenu/       joke menu items
│   └── WinScreen/       victory overlay + Play again
├── hooks/useGame.ts     z-order, positions, pop-ups, dialogs, phase, menu state
├── data/gameContent.ts  every title, URL, joke, popup config, email, menu item
├── types/game.ts        WindowId, PopupId, configs, phases (excluded from coverage)
└── style.css            Win95 @theme tokens, outset/inset utilities, keyframes
```

### State model (`useGame`)

- `zOrder: WindowId[]` — last = focused/front; `raise(id)` re-stacks.
- `positions: Record<WindowId, WindowPosition>` — viewport-scaled on mount; `moveWindow`
  applies pointer deltas (clamping lives in `BrowserWindow`, branchless `Math.min/max`).
- `openPopups: OpenPopup[]` — `{ key, popupId, windowId }`; liar `Close` appends
  `spam` entries via a `useRef` counter for unique keys, capped at 5 per window.
- `message: string | null` — joke dialog contents.
- `grandmaLine: string` — intro → "little X" line on safe dismiss → decoy-mail line.
- `selectedIcon`, `startOpen` — desktop/menu state.
- `phase: 'playing' | 'won'` — set by opening the target email; `playAgain()` resets all.

## Out of scope

- Real network requests, real e-mail, real OS behavior
- Sound, save games, difficulty modes, scoring/lose states
- Mobile-first layout (playable, but designed for desktop browsers)
