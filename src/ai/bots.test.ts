import { describe, expect, it } from 'vitest';
import { AI_BOTS } from './bots';

describe('AI Bots', () => {
  it('should define at least 3 predefined bots', () => {
    expect(AI_BOTS.length).toBeGreaterThanOrEqual(3);
  });

  it('should have unique ids and valid configurations', () => {
    const ids = new Set<string>();
    for (const bot of AI_BOTS) {
      expect(ids.has(bot.id)).toBe(false);
      ids.add(bot.id);
      expect(bot.difficulty).toBeGreaterThanOrEqual(1);
      expect(bot.difficulty).toBeLessThanOrEqual(8);
      expect(bot.playStyle).toBeDefined();
    }
  });
});
