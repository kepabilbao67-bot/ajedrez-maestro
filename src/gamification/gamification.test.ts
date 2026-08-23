import { describe, expect, it } from 'vitest';
import { ProfileStorage, type KeyValueStorage } from '../profile/profile-storage';
import { createDefaultProfile } from '../profile/profile-types';
import { XpService, levelForXp } from './xp-service';
import { XP_AWARDS, XP_LEVELS } from './xp-types';

class MemoryStorage implements KeyValueStorage {
  private readonly values = new Map<string, string>();
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void { this.values.set(key, value); }
  removeItem(key: string): void { this.values.delete(key); }
}

const TODAY = new Date('2026-08-12T12:00:00.000Z');
const serviceFor = (storage: ProfileStorage) => new XpService(storage, () => TODAY);

describe('XpService', () => {
  it('awards XP for a completed game', () => {
    const state = serviceFor(new ProfileStorage(new MemoryStorage())).award('game-completed');
    expect(state.xp).toBeGreaterThanOrEqual(10);
  });

  it('maps XP to the appropriate level', () => {
    expect(levelForXp(0)).toBe('Principiante');
    expect(levelForXp(3000)).toBe('Estratega');
  });

  it('unlocks the first victory achievement', () => {
    const memory = new MemoryStorage();
    const storage = new ProfileStorage(memory);
    const profile = createDefaultProfile();
    profile.learning = { ...profile.learning, gamesPlayed: 1, wins: 1 };
    storage.save(profile);
    const state = serviceFor(storage).recordGame('win', false);
    expect(state.unlockedAchievements.some((item) => item.id === 'first-victory')).toBe(true);
  });

  it('completes and rewards the current daily challenge', () => {
    const storage = new ProfileStorage(new MemoryStorage());
    const service = serviceFor(storage);
    const initial = service.award('game-completed');
    const state = service.award(initial.dailyChallenge!.kind);
    expect(state.dailyChallenge?.completed).toBe(true);
  });

  it('persists the gamification state in the profile', () => {
    const storage = new ProfileStorage(new MemoryStorage());
    serviceFor(storage).award('analysis-completed');
    expect(serviceFor(storage).load().xp).toBeGreaterThan(0);
  });

  it('XP_AWARDS — single source of truth for reward values', () => {
    // These values must match what the post-game UI derives from XP_AWARDS.
    // If you need to change rewards, change XP_AWARDS in xp-types.ts — not the UI.
    expect(XP_AWARDS['game-completed']).toBe(10);
    expect(XP_AWARDS['victory']).toBe(25);
    expect(XP_AWARDS['analysis-completed']).toBe(15);
    expect(XP_AWARDS['exercise-completed']).toBe(20);
    expect(XP_AWARDS['personal-improvement']).toBe(15);
    // Derived total shown in UI after a win
    expect(XP_AWARDS['game-completed'] + XP_AWARDS['victory']).toBe(35);
  });

  it('XP_LEVELS — level thresholds are defined in the central config', () => {
    const minimums = XP_LEVELS.map((def) => def.minimumXp);
    // Verify the full progression ladder is present and ordered
    expect(minimums).toEqual([0, 500, 1500, 3000, 6000]);
    // nextLevelXp computation: first threshold strictly above current XP
    const xp = 400;
    const nextThreshold = XP_LEVELS.find((def) => def.minimumXp > xp)?.minimumXp;
    expect(nextThreshold).toBe(500);
  });
});
