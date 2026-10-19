# Desktop icon windows

Companion spec to [Grandma Tech Support](./2026-10-18-grandma-tech-support.md): what
double-clicking the desktop opens in Rainbows95.

Single click on a desktop icon selects it — the Win95 idiom documented in the main spec.
This companion covers the other half of that idiom: **double-click opens**. Five of the
six desktop icons open a floating mini-window; the decoy `Grandma’s Mail` stays
deliberately broken — double-clicking it opens nothing (that's the joke), backed by
Grandma's "broken since 2000" redirect line.

| Icon           | Window contents                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------------------ |
| `My Computer`  | drive list: `3½ Floppy (A:)`, `Hard disk (C:)` — hint "mostly toasters", `CD-ROM (D:)` — hint "1 song" |
| `Recycle Bin`  | "deleted" files: `untitled_final_v2.doc`, `toaster_7_install.exe`, `do_not_open.jpg`                   |
| `My Documents` | folder residue: `untitled`, `untitled (2)`, `untitled (3)`, `asdf`                                     |
| `Sticky Notes` | the note itself: "THE PASSWORD" — "(it's on the other note)"                                           |
| `Calculator`   | clickable keypad; the display accepts digits, but every `=` shows **47**                               |

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
  unchanged.
- **Sound.** No new SFX: the double-click's two ticks collapse into one audible `click`
  through the audio service's ~100 ms per-track throttle, and window interactions tick
  like every other plain button. The calculator keys tick too — they're plain buttons.
- **Accessibility.** Icon windows are labelled regions (`aria-label` = title); the
  title-bar buttons are named `Minimize <title>` and `Close <title>`; the calculator
  display is a `role="status"` live region so screen readers hear the punchline.
- **Reset.** `Play again` closes every icon window (minimized or not) and returns
  positions to defaults.
- **Out of scope.** Genuinely working programs — the joke is that these are barely
  functional Win95 programs — plus maximize (the windows are already small) and
  inactive-titlebar graying within the icon stack.
