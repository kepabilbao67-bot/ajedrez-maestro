import { describe, expect, it } from 'vitest';
import type { GameAnalysis } from '../ai/coach/coach-types';
import { ProfileService } from './profile-service';
import { ProfileStorage, type KeyValueStorage } from './profile-storage';
import { createDefaultProfile } from './profile-types';

class MemoryStorage implements KeyValueStorage {
  private readonly entries = new Map<string, string>();
  getItem(key: string): string | null { return this.entries.get(key) ?? null; }
  setItem(key: string, value: string): void { this.entries.set(key, value); }
  removeItem(key: string): void { this.entries.delete(key); }
}

const analysis: GameAnalysis = { mistakes: [], inaccuracies: [], missedOpportunities: [], criticalMoment: null, summary: 'Partida estable.' };

describe('ProfileStorage', () => {
  it('is safe to construct during server rendering without localStorage', () => {
    expect(new ProfileStorage().load()).toEqual(createDefaultProfile());
  });

  it('creates safe defaults for a new user', () => {
    expect(new ProfileStorage(new MemoryStorage()).load()).toEqual(createDefaultProfile());
  });

  it('saves and recovers a profile', () => {
    const storage = new ProfileStorage(new MemoryStorage());
    const profile = createDefaultProfile();
    profile.hintsUsed = 2;
    storage.save(profile);
    expect(storage.load().hintsUsed).toBe(2);
  });

  it('updates statistics after a completed game', () => {
    const profile = new ProfileService(new ProfileStorage(new MemoryStorage())).recordCompletedGame('win', analysis);
    expect(profile.learning.gamesPlayed).toBe(1);
    expect(profile.learning.wins).toBe(1);
    expect(profile.progress.improvementScore).toBe(2);
  });

  it('records hint use and preserves the latest analysis', () => {
    const service = new ProfileService(new ProfileStorage(new MemoryStorage()));
    service.recordHint();
    const profile = service.saveAnalysis(analysis);
    expect(profile.hintsUsed).toBe(1);
    expect(profile.lastAnalysis?.summary).toBe('Partida estable.');
  });

  it('discards corrupt persisted data', () => {
    const memory = new MemoryStorage();
    memory.setItem('ajedrezpro.player-profile.v1', '{malformed');
    expect(new ProfileStorage(memory).load()).toEqual(createDefaultProfile());
    expect(memory.getItem('ajedrezpro.player-profile.v1')).toBeNull();
  });
});
