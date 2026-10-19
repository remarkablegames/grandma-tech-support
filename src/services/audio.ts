/**
 * Sparse interface SFX for Rainbows95, with zero audio libraries: a thin
 * wrapper over HTMLAudioElement plus an injectable clock/storage seam so the
 * suite can run against fakes (jsdom cannot decode or play audio).
 */

export type SfxName = 'click' | 'open' | 'error' | 'win';

interface SfxPlayer {
  volume: number;
  play(): Promise<void> | void;
}

interface AudioSettings {
  volume: number;
  muted: boolean;
}

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface AudioDeps {
  createPlayer: (src: string) => SfxPlayer;
  now: () => number;
  storage: StorageLike;
}

const SFX_TRACKS: Record<SfxName, string> = {
  click: 'interface_sounds/click.mp3',
  open: 'interface_sounds/drop_004.mp3',
  error: 'interface_sounds/back_001.mp3',
  win: 'interface_sounds/confirmation_004.mp3',
};

const THROTTLE_MS = 100;
const STORAGE_KEY = 'org.remarkablegames.grandma-tech-support';
const DEFAULT_SETTINGS: AudioSettings = { volume: 100, muted: false };

export const browserAudioDeps: AudioDeps = {
  createPlayer: (src) => new Audio(src),
  now: () => Date.now(),
  storage: window.localStorage,
};

function clampVolume(volume: number): number {
  return Math.min(100, Math.max(0, volume));
}

function readSettings(storage: StorageLike): AudioSettings {
  const raw = storage.getItem(STORAGE_KEY);

  if (raw === null) {
    return DEFAULT_SETTINGS;
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (typeof parsed !== 'object' || parsed === null) {
      return DEFAULT_SETTINGS;
    }

    const sfx = (parsed as { audio?: { sfx?: Partial<AudioSettings> } }).audio
      ?.sfx;
    const volume = sfx?.volume;
    const muted = sfx?.muted;

    return {
      volume:
        typeof volume === 'number'
          ? clampVolume(volume)
          : DEFAULT_SETTINGS.volume,
      muted: typeof muted === 'boolean' ? muted : DEFAULT_SETTINGS.muted,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export class AudioService {
  private readonly deps: AudioDeps;
  private readonly lastPlayed = new Map<string, number>();
  private volume: number;
  private muted: boolean;

  constructor(deps: AudioDeps) {
    this.deps = deps;
    const settings = readSettings(deps.storage);
    this.volume = settings.volume;
    this.muted = settings.muted;
  }

  getVolume(): number {
    return this.volume;
  }

  isMuted(): boolean {
    return this.muted;
  }

  setVolume(volume: number): void {
    this.volume = clampVolume(volume);
    this.persist();
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    this.persist();
  }

  play(name: SfxName): void {
    if (this.muted || this.volume === 0) {
      return;
    }

    const src = SFX_TRACKS[name];
    const now = this.deps.now();
    const last = this.lastPlayed.get(src);

    if (last !== undefined && now - last < THROTTLE_MS) {
      return;
    }
    this.lastPlayed.set(src, now);

    try {
      const player = this.deps.createPlayer(src);
      player.volume = this.volume / 100;
      const started = player.play();

      if (started) {
        started.catch(() => {
          // Autoplay policy or a decode hiccup — never worth a console error.
        });
      }
    } catch {
      // Swallow creation failures (missing file, no audio device, jsdom, …).
    }
  }

  private persist(): void {
    this.deps.storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        audio: {
          sfx: {
            volume: this.volume,
            muted: this.muted,
          },
        },
      }),
    );
  }
}

export const audio = new AudioService(browserAudioDeps);
