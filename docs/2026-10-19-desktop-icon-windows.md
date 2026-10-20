# Desktop icon windows

Companion spec to [Grandma Tech Support](./2026-10-18-grandma-tech-support.md): what
double-clicking the desktop opens in Rainbows95.

Single click on a desktop icon selects it — the Win95 idiom documented in the main spec.
This companion covers the other half of that idiom: **double-click opens**. Six of the
seven desktop icons open a floating mini-window; the decoy `Grandma’s Mail` stays
deliberately broken — double-clicking it opens a “Cannot find the file” system error
(red X, error ding) instead, backed by Grandma’s “broken since 2000” redirect line.

| Icon           | Window contents                                                                                                                                                                                                                                                                          |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `My Computer`  | drive list: `3½ Floppy (A:)` — hint "cupholder", `Hard disk (C:)` — hint "mostly toasters", `CD-ROM (D:)` — hint "1 song", `CD-RW (E:)` — hint "still burning", `Printer (LPT1:)` — hint "jammed", `Network (N:)` — hint "the neighbors’ stuff", `Games (G:)` — hint "Solitaire, mostly" |
| `Recycle Bin`  | "deleted" files: `untitled_final_v2.doc`, `toaster_7_install.exe`, `do_not_open.jpg`, `final_final_v3.doc`, `totally_not_a_virus.exe`                                                                                                                                                    |
| `My Documents` | every file opens its own Notepad window: `untitled`, `untitled (2)`, `untitled (3)`, `asdf`, `the_other_note.txt` (the password), `todo.txt`, `recipe.txt`                                                                                                                               |
| `Sticky Notes` | the note itself: "THE PASSWORD" — "(it's on the other note)"                                                                                                                                                                                                                             |
| `Calculator`   | clickable keypad; the display accepts digits, but every `=` shows **42**                                                                                                                                                                                                                 |
| `Virus Shield` | task 4’s scanner: idle → `Scanning C:\` → “1 threat quarantined: toaster_7_install.exe”; one scan sweeps the whole pop-up storm                                                                                                                                                          |

- **Window behavior.** Mini-chrome: navy titlebar, title, and **working** `–` (minimize)
  and `×` (close) buttons — unlike the browser chrome's decorative close, these are our
  windows and they really work (a clutter trap with no way out would be bad design).
  Windows are draggable by the title bar (the same pointer-drag logic as the browser
  windows, extracted into a shared `createWindowDrag` helper), raise on pointerdown, and
  cascade their default position as more of them open, so stacked windows stay
  distinguishable. They live above the browser windows but below the taskbar and dialogs.
  No maximize — the windows are already tiny.
- **Taskbar.** Full Win95 parity: every open icon window gets a taskbar button (icon +
  title), ordered by raise order so the active window sits rightmost, next to the tray.
  The buttons follow the Win95 toggle rule along with the browser windows': clicking the
  active window's button minimizes it, any other button restores and activates.
  Minimized windows keep their buttons; double-clicking the desktop icon also restores a
  minimized window.
- **Input.** Mouse double-click opens; keyboard activation (`Enter`/`Space` on the
  focused icon — keyboard clicks carry `detail === 0`) opens directly, matching Windows'
  "select then Enter"; two taps inside ~400 ms cover touch. Single click keeps selecting,
  unchanged. Folder rows follow the same idiom: a single click highlights the row (navy
  fill, `aria-pressed`, hint text flips to white), and openable rows (`opens` in the row
  config) open on the same double-click gesture, shared through the `useDoubleClickOpen`
  hook. Plain rows only select, nothing opens.
- **Sound.** No new SFX: the double-click's two ticks collapse into one audible `click`
  through the audio service's ~100 ms per-track throttle, and window interactions tick
  like every other plain button. The calculator keys and the scanner's scan button tick
  too — they're plain buttons.
- **Accessibility.** Icon windows are labelled regions (`aria-label` = title); the
  title-bar buttons are named `Minimize <title>` and `Close <title>`; the calculator
  display is a `role="status"` live region so screen readers hear the punchline, and the
  scanner's progress/result area is an `aria-live="polite"` region.
- **Reset.** `Play again` closes every icon window (minimized or not) and returns
  positions to defaults.
- **Out of scope.** Genuinely working programs — the joke is that these are barely
  functional Win95 programs — plus maximize (the windows are already small) and
  inactive-titlebar graying within the icon stack.
