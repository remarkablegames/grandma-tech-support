import {
  audio,
  type AudioDeps,
  AudioService,
  browserAudioDeps,
  type SfxName,
} from 'src/services/audio';

const STORAGE_KEY = 'org.remarkablegames.grandma-tech-support';

const settingsDoc = (sfx: Record<string, unknown>): string =>
  JSON.stringify({ audio: { sfx } });

interface FakePlayer {
  volume: number;
  play(): Promise<void> | void;
}

function createHarness(existingStorage?: Map<string, string>) {
  const storage = existingStorage ?? new Map<string, string>();
  const players: FakePlayer[] = [];
  const sources: string[] = [];
  const playCalls: string[] = [];
  let clock = 1000;

  const deps: AudioDeps = {
    createPlayer: (src) => {
      sources.push(src);
      const player: FakePlayer = {
        volume: 0,
        play: vi.fn(() => {
          playCalls.push(src);
          return Promise.resolve();
        }),
      };
      players.push(player);
      return player;
    },
    now: () => clock,
    storage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => {
        storage.set(key, value);
      },
    },
  };

  return {
    deps,
    storage,
    players,
    sources,
    playCalls,
    advance: (ms: number) => {
      clock += ms;
    },
  };
}

describe('AudioService', () => {
  it('plays a track at full volume on the first call', () => {
    const { deps, players, sources, playCalls } = createHarness();
    const service = new AudioService(deps);

    service.play('click');

    expect(sources).toEqual(['interface_sounds/click.mp3']);
    expect(players[0].volume).toBe(1);
    expect(playCalls).toEqual(['interface_sounds/click.mp3']);
  });

  it('maps every sound to a relative MP3 in interface_sounds', () => {
    const names: SfxName[] = ['click', 'open', 'error', 'win'];
    const { deps, sources, advance } = createHarness();
    const service = new AudioService(deps);

    names.forEach((name) => {
      service.play(name);
      advance(100);
    });

    expect(sources).toHaveLength(4);
    for (const src of sources) {
      expect(src.startsWith('interface_sounds/')).toBe(true);
      expect(src.endsWith('.mp3')).toBe(true);
    }
  });

  it('throttles repeats of one track but not other tracks', () => {
    const { deps, players, advance } = createHarness();
    const service = new AudioService(deps);

    service.play('click');
    advance(40);
    service.play('click');
    expect(players).toHaveLength(1);

    service.play('open');
    expect(players).toHaveLength(2);

    advance(100);
    service.play('click');
    expect(players).toHaveLength(3);
  });

  it('stays silent while muted and records the choice', () => {
    const { deps, players, storage } = createHarness();
    const service = new AudioService(deps);

    service.setMuted(true);
    service.play('click');

    expect(players).toHaveLength(0);
    expect(JSON.parse(storage.get(STORAGE_KEY) ?? 'null')).toEqual({
      audio: { sfx: { volume: 100, muted: true } },
    });
    expect(service.isMuted()).toBe(true);
  });

  it('unmutes again and resumes playback', () => {
    const { deps, players } = createHarness();
    const service = new AudioService(deps);

    service.setMuted(true);
    service.setMuted(false);
    service.play('click');

    expect(players).toHaveLength(1);
  });

  it('stays silent at zero volume', () => {
    const { deps, players } = createHarness();
    const service = new AudioService(deps);

    service.setVolume(0);
    service.play('click');

    expect(players).toHaveLength(0);
  });

  it('clamps volume to the 0–100 range', () => {
    const { deps } = createHarness();
    const service = new AudioService(deps);

    service.setVolume(140);
    expect(service.getVolume()).toBe(100);

    service.setVolume(-20);
    expect(service.getVolume()).toBe(0);
  });

  it('scales the slider range onto the media element volume', () => {
    const { deps, players } = createHarness();
    const service = new AudioService(deps);

    service.setVolume(40);
    service.play('open');

    expect(players[0].volume).toBe(0.4);
  });

  it('persists the whole settings document for the next session', () => {
    const first = createHarness();
    const service = new AudioService(first.deps);
    service.setVolume(35);
    service.setMuted(true);

    expect(JSON.parse(first.storage.get(STORAGE_KEY) ?? 'null')).toEqual({
      audio: { sfx: { volume: 35, muted: true } },
    });

    const next = createHarness(first.storage);
    const restored = new AudioService(next.deps);

    expect(restored.getVolume()).toBe(35);
    expect(restored.isMuted()).toBe(true);
  });

  it('defaults to full volume and unmuted', () => {
    const { deps } = createHarness();
    const service = new AudioService(deps);

    expect(service.getVolume()).toBe(100);
    expect(service.isMuted()).toBe(false);
  });

  it.each([
    [400, 100],
    [-3, 0],
    [0, 0],
  ])('clamps stored volume %s to %s on load', (volume, expected) => {
    const storage = new Map<string, string>([
      [STORAGE_KEY, settingsDoc({ volume })],
    ]);
    const { deps } = createHarness(storage);

    expect(new AudioService(deps).getVolume()).toBe(expected);
  });

  it.each([
    'null',
    '5',
    '{',
    '{}',
    '{"audio":{}}',
    '{"audio":{"sfx":{}}}',
    '{"audio":{"sfx":{"volume":"loud","muted":"yes"}}}',
  ])('heals unreadable stored settings back to defaults: %s', (raw) => {
    const storage = new Map<string, string>([[STORAGE_KEY, raw]]);
    const { deps } = createHarness(storage);
    const service = new AudioService(deps);

    expect(service.getVolume()).toBe(100);
    expect(service.isMuted()).toBe(false);
  });

  it('fills fields missing from the document with defaults', () => {
    const storage = new Map<string, string>([
      [STORAGE_KEY, settingsDoc({ muted: true })],
    ]);
    const { deps } = createHarness(storage);
    const service = new AudioService(deps);

    expect(service.getVolume()).toBe(100);
    expect(service.isMuted()).toBe(true);
  });

  it('swallows player creation failures', () => {
    const { deps } = createHarness();
    deps.createPlayer = () => {
      throw new Error('no audio device');
    };
    const service = new AudioService(deps);

    expect(() => {
      service.play('win');
    }).not.toThrow();
  });

  it('ignores autoplay rejections', () => {
    const { deps } = createHarness();
    deps.createPlayer = () => ({
      volume: 0,
      play: vi.fn(() =>
        Promise.reject(new Error('blocked by autoplay policy')),
      ),
    });
    const service = new AudioService(deps);

    expect(() => {
      service.play('win');
    }).not.toThrow();
  });

  it('tolerates engines whose play() returns nothing', () => {
    const { deps } = createHarness();
    deps.createPlayer = () => ({ volume: 0, play: () => undefined });
    const service = new AudioService(deps);

    expect(() => {
      service.play('win');
    }).not.toThrow();
  });
});

describe('browserAudioDeps', () => {
  it('creates real media elements over the clock and localStorage', () => {
    const player = browserAudioDeps.createPlayer('interface_sounds/click.mp3');

    expect(player).toBeInstanceOf(HTMLMediaElement);
    expect(typeof browserAudioDeps.now()).toBe('number');
    expect(browserAudioDeps.storage).toBe(window.localStorage);
  });
});

describe('audio singleton', () => {
  it('ships unmuted at full volume', () => {
    expect(audio).toBeInstanceOf(AudioService);
    expect(audio.getVolume()).toBe(100);
    expect(audio.isMuted()).toBe(false);
  });
});
