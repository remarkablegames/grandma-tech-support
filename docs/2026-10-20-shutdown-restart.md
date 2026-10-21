# Shutdown and restart

Companion spec to [Grandma Tech Support](./2026-10-18-grandma-tech-support.md): the
`Shut Down` dialog and the black screens it leads to.

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

| Path          | What happens                                                                                                                                                                                                                                                                            |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cancel**    | the dialog closes; nothing else changes                                                                                                                                                                                                                                                 |
| **Shut down** | the `shutdown` sound plays, the theme pauses, and a full-screen black `It’s now safe to turn off your computer.` line appears — a click or keypress returns to the desktop exactly as it was (windows, pop-ups, mission intact), with the `startup` sound and the theme resuming        |
| **Restart**   | the same sound and pause, but the game resets behind the screen: the black `Starting Rainbows95...` boot line (blinking cursor) covers a full reset, then returns on its own after a beat — a click skips it — revealing the blank opening desktop, again with sound and theme restored |

Restart is the mid-game twin of the win screen's `Play again`: the same `playAgain()`
reset (blank desktop, mission back to task one, login cleared), reachable without
winning first. The win screen's own button stays instant — a boot beat belongs to the
computer, not to the celebration.

## Black screens

- One component covers the desktop at the highest layer (above every dialog) as a
  full-screen `<button>`: it takes focus on mount, so Enter or Space works as well as
  a click.
- Pure black with monospaced system text (`font-mono`, the no-web-fonts rule
  intact): the boot line is white like the DOS output it parodies, while the
  safe-off line keeps Win95's famous amber (`#ffa500`).
- The safe line waits for input indefinitely, the way 1996 did; the boot line
  auto-returns after about a second (its own timer, cleared on unmount) and a click
  skips either screen.

## Sound

Both power transitions bookend every black screen; the tracks are Kenney pack picks
listed in the [audio spec](./2026-10-18-audio-support.md):

- `shutdown` → `interface_sounds/question_004.mp3` as the screen goes black
- `startup` → `interface_sounds/confirmation_001.mp3` as the desktop comes back

The theme pauses while any black screen is up and resumes when it returns, so the
power sounds punch through the silence — one rule for both paths.

## State (`useGame`)

- `shutdownOpen` — the dialog is up. `openShutdown()` also sets grandma's protest
  line; `closeShutdown()` is Cancel.
- `blackScreen: 'safe' | 'boot' | null` — which full-screen line covers the desktop.
- `confirmShutdown(mode)` closes the dialog, plays the power sound, pauses the theme,
  then either waits on the safe screen or resets behind the boot screen.
- `returnFromBlack()` plays the return sound, resumes the theme, and clears the
  screen.
- `playAgain()` clears both flags along with the rest of the reset, so a mid-game
  restart leaves nothing of the old evening behind.

## Accessibility

- Radios are native inputs with wrapping labels; `OK` autofocuses like every other
  dialog's primary button in the game.
- The black screen is a real button named by its own message and focused on mount;
  the blinking cursor is `aria-hidden`.
- No new motion: the cursor reuses the existing `animate-blink` keyframes, which the
  game-wide `prefers-reduced-motion` query already flattens.
