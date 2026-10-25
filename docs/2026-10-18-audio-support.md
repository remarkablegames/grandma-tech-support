# Audio support

Companion spec to [Grandma Tech Support](./2026-10-18-grandma-tech-support.md):
how sound works in Rainbow59.

9 interface sounds — MP3s from [Kenney's Interface Sounds](https://kenney.nl/assets/interface-sounds)
pack (CC0) — plus a looped background theme (`music/title_theme.mp3`).

| Event                                                                                                                                                                                                                               | SFX key    | File                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | --------------------------------------- |
| Plain button tick — window raise (left pointer-down, safe × included), taskbar switch, Start, Start menu items, desktop icon press (keyboard Enter ticks it too), tray speaker, joke-dialog OK, Shut Down `OK`/`Cancel`, Play again | `click`    | `interface_sounds/click.mp3`            |
| Icon drop lands — on a free cell, into the bin, into My Documents, or from a menu’s `Delete`                                                                                                                                        | `drop`     | `interface_sounds/drop_002.mp3`         |
| Right-click menu opens — desktop, icon, row, or folder background; the Start menu stays quiet                                                                                                                                       | `menu`     | `interface_sounds/click_003.mp3`        |
| Liar “Close” opens extra spam pop-ups                                                                                                                                                                                               | `open`     | `interface_sounds/drop_004.mp3`         |
| Misleading pop-up button (“Fix now!”, “Buy”, “Claim”)                                                                                                                                                                               | `error`    | `interface_sounds/back_001.mp3`         |
| Win — email found                                                                                                                                                                                                                   | `win`      | `interface_sounds/confirmation_004.mp3` |
| Recycle Bin or junk email from Inbox deleted                                                                                                                                                                                        | `delete`   | `interface_sounds/scratch_003.mp3`      |
| Shut Down confirmed — any screen powering down to black                                                                                                                                                                             | `shutdown` | `interface_sounds/question_004.mp3`     |
| Return from a black screen — wake or boot line done                                                                                                                                                                                 | `startup`  | `interface_sounds/confirmation_001.mp3` |

Win95 named both moments itself: Control Panel > Sounds shipped an “Empty
Recycle Bin” entry (its own `flush.wav`) and listed `MenuPopup` among the
standard events. The stock scheme still left menu opens quiet — this table is
Rainbow59’s own scheme, already richer than stock (the `drop` landing has
no Win95 event behind it).

The safe little × plays no sound of its own — its pointer-down bubbles to the window’s
`click` tick.

Icon gestures sound only their moments: the press ticks `click`, the ride is silent
the Win95 way, and the landing answers with `drop` — one tick whether the icon lands
on a free cell, in the bin, or in My Documents. A menu’s `Delete` rides the same
landing on its way to the bin; a refused drop (a system icon, or the
containers themselves) keeps the `error` ding.

- **Zero audio libraries.** `src/services/audio.ts` drives `HTMLAudioElement` directly:
  one fresh element per play (overlap-safe), a ~100 ms per-track throttle (tracks
  throttle independently, so a press tick never eats the landing tick that follows;
  it also absorbs React StrictMode's double effects), swallowed autoplay rejections.
  The player
  factory, clock, and storage are injectable, so the suite runs against fakes — jsdom
  cannot decode or play audio.
- **Background music.** `music/title_theme.mp3` loops for the whole session — one
  long-lived element with `loop = true`, created and preloaded when App mounts, with
  playback starting on the first user gesture (browsers gate autoplay: the mount
  attempt plus a gesture retry, both rejections swallowed). Hiding the tab pauses the
  loop and returning resumes it from the same spot. A black power screen (shutdown or
  restart) does the same, so the `shutdown`/`startup` sounds punch through the
  silence — see [shutdown](./2026-10-20-shutdown-restart.md). Music is its own
  channel, fully
  independent of Sounds — mute sets its gain to 0 so the loop keeps its position, like
  a real mixer. If the MP3 loop point ever sounds like a seam (encoder delay), upgrade
  to a Web Audio buffer loop.
- **Volume Control popup.** The tray speaker icon (`windows_icons_32x32/sounds.png`)
  opens a mini Win95-style “Volume Control” panel above the tray with two side-by-side
  strips — Sounds and Music — each with a vertical fader (native `<input type="range">`
  made vertical with CSS `writing-mode: vertical-rl` and `direction: rtl`), its own
  Mute checkbox, and a decorative 100/50/0 tick scale. Click-outside or Escape closes
  it; the tray icon dims whenever either channel is muted.
- **Persistence.** Both channels live in the app's single `localStorage` document —
  key `org.remarkablegames.grandma-tech-support`, one JSON value at the root holding a
  section per feature (`{"audio":{"sfx":{"volume":100,"muted":false},"music":{"volume":100,"muted":false}}, ...}`):
  one atomic read/write for the whole settings picture, trivial to inspect, reset, or
  export. Saves merge their section into the current document, so the desktop icon
  layout (`icons`) and any future sibling survive every volume change. Both channels
  default to 100, unmuted. Missing or corrupt data falls back to defaults and
  self-heals on the next change.
- All ~120 pack files ship until the playtest; afterward unused ones get pruned and this
  table locks to the final picks and levels.
