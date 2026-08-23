import { describe, expect, it } from 'vitest';

import { featureEnabled } from './feature-flags';
import {
  canAccessDifficulty,
  canRunAnalysis,
  canSelectTheme,
  canUseCoachHint,
  canUseFeature,
  consumeDailyUsage,
  isPro,
  normalizeDailyUsage,
} from './premium-policy';
import type { DailyUsage, PremiumStatus } from './premium-types';

describe('premium feature flags and policies', () => {
  const freeStatus: PremiumStatus = { tier: 'free' };
  const proStatus: PremiumStatus = { tier: 'pro' };

  it('keeps the legacy free and pro feature boundaries explicit', () => {
    expect(featureEnabled('classic-theme', freeStatus)).toBe(true);
    expect(featureEnabled('all-themes', freeStatus)).toBe(false);
    expect(featureEnabled('all-themes', proStatus)).toBe(true);
  });

  describe('isPro', () => {
    it('returns false for free tier', () => {
      expect(isPro(freeStatus)).toBe(false);
    });

    it('returns true for pro tier without expiration', () => {
      expect(isPro(proStatus)).toBe(true);
    });

    it('returns true for pro tier with valid future expiration', () => {
      const futureStatus: PremiumStatus = {
        tier: 'pro',
        unlockedUntil: new Date(Date.now() + 86400000).toISOString(),
      };
      expect(isPro(futureStatus)).toBe(true);
    });

    it('returns false for pro tier with expired date', () => {
      const expiredStatus: PremiumStatus = {
        tier: 'pro',
        unlockedUntil: new Date(Date.now() - 86400000).toISOString(),
      };
      expect(isPro(expiredStatus)).toBe(false);
    });
  });

  describe('Coach Hints Quota', () => {
    it('Free tier allows 3 hints and blocks the fourth', () => {
      const usage0: DailyUsage = { date: '2026-08-13', hintsUsed: 0, analysesRun: 0, exercisesCompleted: 0 };
      expect(canUseCoachHint(usage0, freeStatus)).toBe(true);

      const usage1: DailyUsage = { ...usage0, hintsUsed: 1 };
      expect(canUseCoachHint(usage1, freeStatus)).toBe(true);

      const usage2: DailyUsage = { ...usage0, hintsUsed: 2 };
      expect(canUseCoachHint(usage2, freeStatus)).toBe(true);

      const usage3: DailyUsage = { ...usage0, hintsUsed: 3 };
      expect(canUseCoachHint(usage3, freeStatus)).toBe(false);

      const usage4: DailyUsage = { ...usage0, hintsUsed: 4 };
      expect(canUseCoachHint(usage4, freeStatus)).toBe(false);
    });

    it('Pro tier allows hints unconditionally', () => {
      const usage100: DailyUsage = { date: '2026-08-13', hintsUsed: 100, analysesRun: 50, exercisesCompleted: 200 };
      expect(canUseCoachHint(usage100, proStatus)).toBe(true);
    });
  });

  describe('Game Analysis Quota', () => {
    it('Free tier allows 1 analysis and blocks the second', () => {
      const usage0: DailyUsage = { date: '2026-08-13', hintsUsed: 0, analysesRun: 0, exercisesCompleted: 0 };
      expect(canRunAnalysis(usage0, freeStatus)).toBe(true);

      const usage1: DailyUsage = { ...usage0, analysesRun: 1 };
      expect(canRunAnalysis(usage1, freeStatus)).toBe(false);
    });

    it('Pro tier allows analysis unconditionally', () => {
      const usage10: DailyUsage = { date: '2026-08-13', hintsUsed: 0, analysesRun: 10, exercisesCompleted: 0 };
      expect(canRunAnalysis(usage10, proStatus)).toBe(true);
    });
  });

  describe('Stockfish Difficulty Access', () => {
    it('Free tier allows difficulties 1, 2, 3 and blocks 4, 5', () => {
      expect(canAccessDifficulty(1, freeStatus)).toBe(true);
      expect(canAccessDifficulty(2, freeStatus)).toBe(true);
      expect(canAccessDifficulty(3, freeStatus)).toBe(true);
      expect(canAccessDifficulty(4, freeStatus)).toBe(false);
      expect(canAccessDifficulty(5, freeStatus)).toBe(false);
    });

    it('Pro tier allows all difficulty levels (1 to 5)', () => {
      for (let level = 1; level <= 5; level += 1) {
        expect(canAccessDifficulty(level, proStatus)).toBe(true);
      }
    });
  });

  describe('Board Themes Access', () => {
    it('Free tier allows classic theme and blocks premium themes', () => {
      expect(canSelectTheme('classic', freeStatus)).toBe(true);
      expect(canSelectTheme('neon-cyber', freeStatus)).toBe(false);
      expect(canSelectTheme('royal-gold', freeStatus)).toBe(false);
    });

    it('Pro tier allows all themes', () => {
      expect(canSelectTheme('classic', proStatus)).toBe(true);
      expect(canSelectTheme('neon-cyber', proStatus)).toBe(true);
      expect(canSelectTheme('royal-gold', proStatus)).toBe(true);
    });
  });

  describe('canUseFeature helper', () => {
    it('denies premium features for free and grants them for pro', () => {
      expect(canUseFeature('unlimited-hints', freeStatus)).toBe(false);
      expect(canUseFeature('unlimited-hints', proStatus)).toBe(true);
      expect(canUseFeature('master-stockfish', freeStatus)).toBe(false);
      expect(canUseFeature('master-stockfish', proStatus)).toBe(true);
    });
  });

  describe('Daily Usage Management', () => {
    it('consumes daily usage accurately', () => {
      const initial: DailyUsage = { date: '2026-08-13', hintsUsed: 0, analysesRun: 0, exercisesCompleted: 0 };
      const afterHint = consumeDailyUsage(initial, 'hint');
      expect(afterHint.hintsUsed).toBe(1);
      expect(afterHint.analysesRun).toBe(0);

      const afterAnalysis = consumeDailyUsage(afterHint, 'analysis');
      expect(afterAnalysis.hintsUsed).toBe(1);
      expect(afterAnalysis.analysesRun).toBe(1);

      const afterExercise = consumeDailyUsage(afterAnalysis, 'exercise');
      expect(afterExercise.exercisesCompleted).toBe(1);
    });

    it('resets usage on date change', () => {
      const yesterdayUsage: DailyUsage = { date: '2026-08-12', hintsUsed: 3, analysesRun: 1, exercisesCompleted: 5 };
      const normalized = normalizeDailyUsage(yesterdayUsage, '2026-08-13');

      expect(normalized.date).toBe('2026-08-13');
      expect(normalized.hintsUsed).toBe(0);
      expect(normalized.analysesRun).toBe(0);
      expect(normalized.exercisesCompleted).toBe(0);
    });

    it('consumeDailyUsage automatically resets if a new date is provided', () => {
      const yesterdayUsage: DailyUsage = { date: '2026-08-12', hintsUsed: 3, analysesRun: 1, exercisesCompleted: 5 };
      const updated = consumeDailyUsage(yesterdayUsage, 'hint', '2026-08-13');

      expect(updated.date).toBe('2026-08-13');
      expect(updated.hintsUsed).toBe(1);
      expect(updated.analysesRun).toBe(0);
    });
  });
});
