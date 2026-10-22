/**
 * The app's single localStorage store: one reverse-DNS key holding one JSON
 * value at the root, with a section per feature (`audio`, `icons`, whatever
 * lands next). Features never touch getItem/setItem themselves: loads pull
 * their own root section, saves merge it into whatever is already stored,
 * so a write in one feature never wipes out another.
 */

// The storage seam both features share: localStorage satisfies it, and so
// does the audio suite's Map-backed stand-in (see audio.test.ts).
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const STORAGE_KEY = 'org.remarkablegames.grandma-tech-support';

// Tolerant parse: absent, corrupt, or unparseable values come back null
// instead of taking the caller down.
function parseStoredJson(raw: string | null): unknown {
  if (raw === null) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

// A feature's own slice of the store: undefined when the stored document or
// the section is missing, corrupt, or unreadable, so callers can fall back
// to their defaults.
export function loadSection(storage: StorageLike, section: string): unknown {
  const stored = parseStoredJson(storage.getItem(STORAGE_KEY));

  return isJsonObject(stored) ? stored[section] : undefined;
}

// The only way features write: their section is swapped in, every sibling
// section carried through untouched.
export function saveSection(
  storage: StorageLike,
  section: string,
  value: unknown,
): void {
  const stored = parseStoredJson(storage.getItem(STORAGE_KEY));

  storage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...(isJsonObject(stored) ? stored : {}),
      [section]: value,
    }),
  );
}
