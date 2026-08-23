import { createDefaultProfile, isPlayerProfile, type PlayerProfile } from './profile-types';

export const PROFILE_STORAGE_KEY = 'ajedrezpro.player-profile.v1';

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function getLocalStorage(): KeyValueStorage | null {
  return globalThis.localStorage ?? null;
}

/** Versioned local persistence with safe fallbacks for missing or corrupt data. */
export class ProfileStorage {
  constructor(
    private readonly storage?: KeyValueStorage,
    private readonly key = PROFILE_STORAGE_KEY,
  ) {}

  load(): PlayerProfile {
    const raw = (this.storage ?? getLocalStorage())?.getItem(this.key);
    if (!raw) return createDefaultProfile();
    try {
      const parsed: unknown = JSON.parse(raw);
      if (isPlayerProfile(parsed)) return parsed;
    } catch {
      // Invalid data is intentionally replaced with a clean profile below.
    }
    (this.storage ?? getLocalStorage())?.removeItem(this.key);
    return createDefaultProfile();
  }

  save(profile: PlayerProfile): void {
    (this.storage ?? getLocalStorage())?.setItem(this.key, JSON.stringify(profile));
  }
}
