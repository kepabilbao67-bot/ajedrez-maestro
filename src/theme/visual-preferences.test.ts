import { describe, expect, it } from 'vitest';
import { DEFAULT_VISUAL_PREFERENCES, VISUAL_PREFERENCES_KEY, VisualPreferencesService, type PreferenceStorage } from './visual-preferences';

class MemoryStorage implements PreferenceStorage {
  private readonly data = new Map<string, string>();
  getItem(key: string): string | null { return this.data.get(key) ?? null; }
  setItem(key: string, value: string): void { this.data.set(key, value); }
  removeItem(key: string): void { this.data.delete(key); }
}

describe('VisualPreferencesService', () => {
  it('uses defaults safely when localStorage is unavailable during SSR', () => {
    expect(new VisualPreferencesService().load()).toEqual(DEFAULT_VISUAL_PREFERENCES);
  });

  it('provides Classic defaults for a new user', () => {
    expect(new VisualPreferencesService(new MemoryStorage()).load()).toEqual(DEFAULT_VISUAL_PREFERENCES);
  });

  it('changes and persists board and piece selections', () => {
    const storage = new MemoryStorage();
    const service = new VisualPreferencesService(storage);
    service.update({ boardTheme: 'neon-cyber', pieceSet: 'modern', soundsEnabled: true });
    expect(new VisualPreferencesService(storage).load()).toMatchObject({ boardTheme: 'neon-cyber', pieceSet: 'modern', soundsEnabled: true });
  });

  it('recovers safely from corrupt preferences', () => {
    const storage = new MemoryStorage();
    storage.setItem(VISUAL_PREFERENCES_KEY, '{invalid');
    expect(new VisualPreferencesService(storage).load()).toEqual(DEFAULT_VISUAL_PREFERENCES);
    expect(storage.getItem(VISUAL_PREFERENCES_KEY)).toBeNull();
  });
});
