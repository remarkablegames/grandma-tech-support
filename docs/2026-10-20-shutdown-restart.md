# Shutdown and restart

Companion spec to [Grandma Tech Support](./2026-10-18-grandma-tech-support.md): the
`Shut Down` dialog, the power screens it leads to, and the clouds splash the game
itself boots through.

Start → `Shut Down...` is a real Win95 power prompt instead of a joke dialog. The menu
closes, grandma protests in her speech bubble, and a two-radio dialog asks what kind of
exit this is: a full reset (restart) or the amber "safe to turn off" screen (shut
down). Neither path is a lose state — nothing is lost unless the player asks for it.

## The dialog

A plain Win95 dialog with no dimmed backdrop (the desktop stays visible behind it,
the way Win95 leaves it):

- Title `Shut Down`, lead-in `Are you sure you want to:`
- Radios `Shut down the computer?` (selected by default) and `Restart the computer?`
- `OK` (autofocused, confirms whichever radio is selected) and `Cancel`

The joke lives outside the dialog: picking the menu item puts grandma's protest

> Don’t shut it down! I’m expecting an email.

in her speech bubble (`role="status"`), so the dialog itself stays authentically
boring. `Cancel` closes the dialog while the protest stays up, and clicking the bubble
still repeats the current mission.

## Exit paths

| Path          | What happens                                                                                                                                                                                                                                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Cancel**    | the dialog closes; nothing else changes                                                                                                                                                                                                                                                                            |
| **Shut down** | the `shutdown` sound plays, the theme pauses, and a full-screen black `It’s now safe to turn off your computer.` line appears — a click or keypress returns to the desktop exactly as it was (windows, pop-ups, mission intact), with the `startup` sound and the theme resuming                                   |
| **Restart**   | the same sound and pause, but the game resets behind the screens: the black `Starting Rainbows95...` boot line (blinking cursor) hands off to the clouds splash on its own, and the splash lifts to the blank opening desktop — each beat a click to skip, the `startup` sound and theme arriving with the desktop |

Restart is the mid-game twin of the win screen's `Play again`: the same `playAgain()`
reset (blank desktop, mission back to task one, login cleared), reachable without
winning first. The win screen's own button stays instant — a boot beat belongs to the
computer, not to the celebration.

## Power screens

One component covers the desktop at the highest layer (above every dialog) as a
full-screen `<button>` per beat: each takes focus on mount, so Enter or Space works
as well as a click, and a click skips every beat.

- **Safe-off line** — pure black with Win95's famous amber (`#ffa500`) message in
  monospaced system text (`font-mono`, the no-web-fonts rule intact). It waits for
  input indefinitely, the way 1996 did.
- **Boot line** — same black, white DOS-style text and a blinking cursor
  (`aria-hidden`), auto-advancing after about a second (its own timer, cleared on
  unmount).
- **Clouds splash** — the Win95 splash beat: `backgrounds/clouds.jpg` behind the
  `logo.svg` flag and a bold white `Rainbows95` wordmark, auto-lifting after about
  a second and a half. The style URL is inline and page-relative so the clouds
  survive subpath deploys. The splash is not only restart's third beat — it also
  opens the game itself: page load starts on the splash, and the desktop mounts as
  the clouds lift, so grandma's intro bubble pops on the reveal.

## Sound

Both power sounds bookend the screens; the tracks are Kenney pack picks listed in
the [audio spec](./2026-10-18-audio-support.md):

- `shutdown` → `interface_sounds/question_004.mp3` as the first screen goes black
- `startup` → `interface_sounds/confirmation_001.mp3` as the desktop comes back

The chime deliberately waits for the desktop rather than the splash (browsers would
silence it mid-sequence anyway: no gesture, no audio). The theme pauses while any
power screen is up and resumes when the desktop returns — one rule for every path.

## State (`useGame`)

- `shutdownOpen` — the dialog is up. `openShutdown()` also sets grandma's protest
  line; `closeShutdown()` is Cancel.
- `powerScreen: 'safe' | 'boot' | 'splash' | null` — which full-screen beat covers
  the desktop. Its initial value is `'splash'`: the game boots like the machine it
  parodies.
- `confirmShutdown(mode)` closes the dialog, plays the power sound, pauses the theme,
  then either waits on the safe screen or resets behind the boot line.
- `leavePowerScreen()` — the boot line advances to the splash; every other screen
  plays the return sound, resumes the theme, and clears. While the splash is up the
  desktop stays unmounted.
- `playAgain()` clears both flags along with the rest of the reset, so a mid-game
  restart leaves nothing of the old evening behind.

## Accessibility

- Radios are native inputs with wrapping labels; `OK` autofocuses like every other
  dialog's primary button in the game.
- Every power screen is a real button focused on mount: the text beats are named by
  their own message (the blinking cursor is `aria-hidden`), the splash by its
  `Rainbows95` wordmark.
- Nothing sits behind the splash while it is up — the desktop mounts on the reveal,
  so keyboard and screen-reader users meet the game, not a hidden layer.
- No new motion: the cursor reuses the existing `animate-blink` keyframes, which the
  game-wide `prefers-reduced-motion` query already flattens; the splash itself is
  static.
