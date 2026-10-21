/**
 * Sparse interface SFX for Rainbows95, with zero audio libraries: a thin
 * wrapper over HTMLAudioElement plus an injectable clock/storage seam so the
 * suite can run against fakes (jsdom cannot decode or play audio).
 */

export type SfxName =
  'click' | 'open' | 'error' | 'win' | 'shutdown' | 'startup';

interface Player {
  volume: number;
  loop: boolean;
  play(): Promise<void> | void;
  pause(): void;
}

interface ChannelSettings {
  volume: number;
  muted: boolean;
}

interface AudioSettings {
  sfx: ChannelSettings;
  music: ChannelSettings;
}

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface AudioDeps {
  createPlayer: (src: string) => Player;
  now: () => number;
  storage: StorageLike;
}

const SFX_TRACKS: Record<SfxName, string> = {
  click: 'interface_sounds/click.mp3',
  open: 'interface_sounds/drop_004.mp3',
  error: 'interface_sounds/back_001.mp3',
  win: 'interface_sounds/confirmation_004.mp3',
  shutdown: 'interface_sounds/question_004.mp3',
  startup: 'interface_sounds/confirmation_001.mp3',
};

const MUSIC_TRACK = 'music/title_theme.mp3';
const THROTTLE_MS = 100;
const STORAGE_KEY = 'org.remarkablegames.grandma-tech-support';
const DEFAULT_SETTINGS: AudioSettings = {
  sfx: { volume: 100, muted: false },
  music: { volume: 75, muted: false },
};

export const browserAudioDeps: AudioDeps = {
  createPlayer: (src) => new Audio(src),
  now: () => Date.now(),
  storage: window.localStorage,
};

function clampVolume(volume: number): number {
  return Math.min(100, Math.max(0, volume));
}

function readChannel(
  channel: Partial<ChannelSettings> | undefined,
  defaults: ChannelSettings,
): ChannelSettings {
  const volume = channel?.volume;
  const muted = channel?.muted;

  return {
    volume: typeof volume === 'number' ? clampVolume(volume) : defaults.volume,
    muted: typeof muted === 'boolean' ? muted : defaults.muted,
  };
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

    const audioDoc = (
      parsed as {
        audio?: {
          sfx?: Partial<ChannelSettings>;
          music?: Partial<ChannelSettings>;
        };
      }
    ).audio;

    return {
      sfx: readChannel(audioDoc?.sfx, DEFAULT_SETTINGS.sfx),
      music: readChannel(audioDoc?.music, DEFAULT_SETTINGS.music),
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
  private musicVolume: number;
  private musicMuted: boolean;
  private musicPlayer: Player | null = null;

  constructor(deps: AudioDeps) {
    this.deps = deps;
    const settings = readSettings(deps.storage);
    this.volume = settings.sfx.volume;
    this.muted = settings.sfx.muted;
    this.musicVolume = settings.music.volume;
    this.musicMuted = settings.music.muted;
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

  getMusicVolume(): number {
    return this.musicVolume;
  }

  isMusicMuted(): boolean {
    return this.musicMuted;
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = clampVolume(volume);
    this.applyMusicVolume();
    this.persist();
  }

  setMusicMuted(muted: boolean): void {
    this.musicMuted = muted;
    this.applyMusicVolume();
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
      // Swallow creation failures (missing file, no audio device, jsdom, ...).
    }
  }

  startMusic(): void {
    try {
      if (this.musicPlayer === null) {
        const created = this.deps.createPlayer(MUSIC_TRACK);
        created.loop = true;
        this.musicPlayer = created;
      }

      const player = this.musicPlayer;
      player.volume = this.musicGain();
      const started = player.play();

      if (started) {
        started.catch(() => {
          // Autoplay policy — App retries on the first user gesture.
        });
      }
    } catch {
      // Swallow creation failures (missing file, no audio device, jsdom, ...).
    }
  }

  pauseMusic(): void {
    const player = this.musicPlayer;
    if (player !== null) {
      player.pause();
    }
  }

  private musicGain(): number {
    return this.musicMuted ? 0 : this.musicVolume / 100;
  }

  private applyMusicVolume(): void {
    const player = this.musicPlayer;
    if (player !== null) {
      player.volume = this.musicGain();
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
          music: {
            volume: this.musicVolume,
            muted: this.musicMuted,
          },
        },
      }),
    );
  }
}

export const audio = new AudioService(browserAudioDeps);
