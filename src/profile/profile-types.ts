import type { GameAnalysis, LearningProfile, MistakeSeverity } from '../ai/coach/coach-types';
import { isGamificationState, type GamificationState } from '../gamification/xp-types';
import type { TrainingCategory } from '../training/training-types';

export const PROFILE_SCHEMA_VERSION = 1 as const;
export type ProfileGameResult = 'win' | 'loss' | 'draw';

export interface PlayerProgress {
  currentNonLossStreak: number;
  bestNonLossStreak: number;
  improvementScore: number;
  exercisesCompleted?: number;
}

export interface TrainingProgress {
  readonly attempted: number;
  readonly correct: number;
  readonly completed: number;
  readonly byCategory: Readonly<Record<TrainingCategory, number>>;
}

export interface PlayerProfile {
  version: typeof PROFILE_SCHEMA_VERSION;
  learning: LearningProfile;
  hintsUsed: number;
  lastAnalysis: GameAnalysis | null;
  progress: PlayerProgress;
  /** Optional to migrate Sprint 6 profiles safely on their first gamification save. */
  gamification?: GamificationState;
  training?: TrainingProgress;
  updatedAt: string | null;
}

export const DEFAULT_PROFILE: PlayerProfile = {
  version: PROFILE_SCHEMA_VERSION,
  learning: {
    estimatedLevel: 1,
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    frequentErrors: [],
    strengths: [],
    weaknesses: [],
  },
  hintsUsed: 0,
  lastAnalysis: null,
  progress: { currentNonLossStreak: 0, bestNonLossStreak: 0, improvementScore: 0, exercisesCompleted: 0 },
  training: { attempted: 0, correct: 0, completed: 0, byCategory: { 'mate-in-1': 0, 'mate-in-2': 0, 'basic-tactics': 0, 'win-material': 0, 'best-move': 0, 'defend-position': 0 } },
  updatedAt: null,
};

export function createDefaultProfile(): PlayerProfile {
  return {
    ...DEFAULT_PROFILE,
    learning: { ...DEFAULT_PROFILE.learning, frequentErrors: [], strengths: [], weaknesses: [] },
    progress: { ...DEFAULT_PROFILE.progress },
  };
}

const MISTAKE_SEVERITIES: readonly MistakeSeverity[] = ['inaccuracy', 'mistake', 'blunder'];
const isNonNegativeNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;
const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

/** Reject malformed persisted JSON before it can influence the UI. */
export function isPlayerProfile(value: unknown): value is PlayerProfile {
  if (!value || typeof value !== 'object') return false;
  const profile = value as Partial<PlayerProfile>;
  const learning = profile.learning as Partial<LearningProfile> | undefined;
  const progress = profile.progress as Partial<PlayerProgress> | undefined;
  return (
    profile.version === PROFILE_SCHEMA_VERSION &&
    !!learning &&
    isNonNegativeNumber(learning.estimatedLevel) &&
    isNonNegativeNumber(learning.gamesPlayed) &&
    isNonNegativeNumber(learning.wins) &&
    isNonNegativeNumber(learning.losses) &&
    isNonNegativeNumber(learning.draws) &&
    Array.isArray(learning.frequentErrors) &&
    learning.frequentErrors.every((error) => MISTAKE_SEVERITIES.includes(error)) &&
    isStringArray(learning.strengths) &&
    isStringArray(learning.weaknesses) &&
    isNonNegativeNumber(profile.hintsUsed) &&
    (profile.lastAnalysis === null || (typeof profile.lastAnalysis === 'object' && profile.lastAnalysis !== null)) &&
    !!progress &&
    isNonNegativeNumber(progress.currentNonLossStreak) &&
    isNonNegativeNumber(progress.bestNonLossStreak) &&
    isNonNegativeNumber(progress.improvementScore) &&
    (progress.exercisesCompleted === undefined || isNonNegativeNumber(progress.exercisesCompleted)) &&
    (profile.gamification === undefined || isGamificationState(profile.gamification)) &&
    (profile.updatedAt === null || typeof profile.updatedAt === 'string')
  );
}
