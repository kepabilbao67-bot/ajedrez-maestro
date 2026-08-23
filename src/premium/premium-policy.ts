import type { DailyUsage, PremiumFeature, PremiumStatus } from './premium-types';
import { FREE_DAILY_LIMITS } from './premium-types';

/** Pure check for active Pro status, accounting for lifetime and expiration. */
export function isPro(status: PremiumStatus): boolean {
  if (status.tier === 'pro') {
    if (status.isLifetime) return true;
    if (status.unlockedUntil) {
      return new Date(status.unlockedUntil).getTime() > Date.now();
    }
    return true;
  }
  return false;
}

/** Check if a specific premium feature is unlocked for the user. */
export function canUseFeature(feature: PremiumFeature, status: PremiumStatus): boolean {
  return isPro(status);
}

/** Check if a Stockfish difficulty level is allowed (Free allows 1-3, Pro allows 1-5). */
export function canAccessDifficulty(level: number, status: PremiumStatus): boolean {
  if (isPro(status)) return true;
  return level <= FREE_DAILY_LIMITS.maxStockfishDifficulty;
}

/** Check if coach hints can be used under daily quotas (Free: max 3/day, Pro: unlimited). */
export function canUseCoachHint(usage: DailyUsage, status: PremiumStatus): boolean {
  if (isPro(status)) return true;
  return usage.hintsUsed < FREE_DAILY_LIMITS.maxHintsPerDay;
}

/** Check if game analysis can be executed under daily quotas (Free: max 1/day, Pro: unlimited). */
export function canRunAnalysis(usage: DailyUsage, status: PremiumStatus): boolean {
  if (isPro(status)) return true;
  return usage.analysesRun < FREE_DAILY_LIMITS.maxAnalysesPerDay;
}

/** Check if a board theme can be selected (Free: classic, Pro: all themes). */
export function canSelectTheme(themeId: string, status: PremiumStatus): boolean {
  if (isPro(status)) return true;
  return (FREE_DAILY_LIMITS.allowedThemeIds as readonly string[]).includes(themeId);
}

/** Normalizes daily usage, resetting counters if the current date has changed. */
export function normalizeDailyUsage(usage: DailyUsage | null | undefined, currentDate: string): DailyUsage {
  if (!usage || usage.date !== currentDate) {
    return {
      date: currentDate,
      hintsUsed: 0,
      analysesRun: 0,
      exercisesCompleted: 0,
    };
  }
  return usage;
}

/** Purely consumes an action against the daily usage state. */
export function consumeDailyUsage(
  usage: DailyUsage,
  action: 'hint' | 'analysis' | 'exercise',
  currentDate?: string,
): DailyUsage {
  const date = currentDate ?? usage.date;
  const current = normalizeDailyUsage(usage, date);

  return {
    ...current,
    hintsUsed: action === 'hint' ? current.hintsUsed + 1 : current.hintsUsed,
    analysesRun: action === 'analysis' ? current.analysesRun + 1 : current.analysesRun,
    exercisesCompleted: action === 'exercise' ? current.exercisesCompleted + 1 : current.exercisesCompleted,
  };
}
