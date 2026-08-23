export type PremiumTier = 'free' | 'pro';

export interface PremiumStatus {
  readonly tier: PremiumTier;
  readonly unlockedUntil?: string | null;
  readonly isLifetime?: boolean;
}

export type PremiumFeature =
  | 'unlimited-hints'
  | 'unlimited-analysis'
  | 'master-stockfish'
  | 'all-themes'
  | 'all-piece-sets'
  | 'unlimited-puzzles'
  | 'advanced-statistics'
  | 'ad-free';

export interface DailyUsage {
  readonly date: string; // ISO date 'YYYY-MM-DD'
  readonly hintsUsed: number;
  readonly analysesRun: number;
  readonly exercisesCompleted: number;
}

export const FREE_DAILY_LIMITS = {
  maxHintsPerDay: 3,
  maxAnalysesPerDay: 1,
  maxStockfishDifficulty: 3,
  maxDailyExercises: 5,
  allowedThemeIds: ['classic'] as const,
} as const;

export const DEFAULT_DAILY_USAGE: DailyUsage = {
  date: new Date().toISOString().split('T')[0],
  hintsUsed: 0,
  analysesRun: 0,
  exercisesCompleted: 0,
};
