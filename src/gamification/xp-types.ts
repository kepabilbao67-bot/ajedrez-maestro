export type XpEvent = 'game-completed' | 'victory' | 'analysis-completed' | 'exercise-completed' | 'personal-improvement';
export type PlayerLevel = 'Principiante' | 'Aprendiz' | 'Jugador' | 'Estratega' | 'Maestro';
export type AchievementId = 'first-victory' | 'first-checkmate' | 'ten-games' | 'hundred-games' | 'daily-streak' | 'weekly-streak' | 'level-improvement' | 'tactics-expert';
export type DailyChallengeKind = 'game-completed' | 'analysis-completed' | 'exercise-completed';

export interface AchievementProgress {
  readonly id: AchievementId;
  readonly unlockedAt: string;
}

export interface DailyChallenge {
  readonly id: string;
  readonly date: string;
  readonly title: string;
  readonly rewardXp: number;
  readonly kind: DailyChallengeKind;
  readonly target: number;
  readonly progress: number;
  readonly completed: boolean;
}

export interface GamificationState {
  readonly xp: number;
  readonly unlockedAchievements: readonly AchievementProgress[];
  readonly checkmates: number;
  readonly dailyStreak: number;
  readonly lastActiveDate: string | null;
  readonly dailyChallenge: DailyChallenge | null;
}

export interface XpAward {
  readonly event: XpEvent;
  readonly amount: number;
}

export const XP_AWARDS: Readonly<Record<XpEvent, number>> = {
  'game-completed': 10,
  victory: 25,
  'analysis-completed': 15,
  'exercise-completed': 20,
  'personal-improvement': 15,
};

export const DEFAULT_GAMIFICATION_STATE: GamificationState = {
  xp: 0,
  unlockedAchievements: [],
  checkmates: 0,
  dailyStreak: 0,
  lastActiveDate: null,
  dailyChallenge: null,
};

const isNonNegativeNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;

/** Runtime validation for data restored from the local profile. */
export function isGamificationState(value: unknown): value is GamificationState {
  if (!value || typeof value !== 'object') return false;
  const state = value as Partial<GamificationState>;
  const challenge = state.dailyChallenge;
  return (
    isNonNegativeNumber(state.xp) &&
    isNonNegativeNumber(state.checkmates) &&
    isNonNegativeNumber(state.dailyStreak) &&
    (state.lastActiveDate === null || typeof state.lastActiveDate === 'string') &&
    Array.isArray(state.unlockedAchievements) &&
    state.unlockedAchievements.every((achievement) =>
      achievement && typeof achievement.id === 'string' && typeof achievement.unlockedAt === 'string') &&
    (challenge === null || (
      typeof challenge === 'object' &&
      typeof challenge.id === 'string' &&
      typeof challenge.date === 'string' &&
      typeof challenge.title === 'string' &&
      isNonNegativeNumber(challenge.rewardXp) &&
      isNonNegativeNumber(challenge.target) &&
      isNonNegativeNumber(challenge.progress) &&
      typeof challenge.completed === 'boolean' &&
      (challenge.kind === 'game-completed' || challenge.kind === 'analysis-completed' || challenge.kind === 'exercise-completed')
    ))
  );
}

export interface XpLevelDefinition {
  readonly level: PlayerLevel;
  readonly minimumXp: number;
}

export const XP_LEVELS: readonly XpLevelDefinition[] = [
  { level: 'Principiante', minimumXp: 0 },
  { level: 'Aprendiz', minimumXp: 500 },
  { level: 'Jugador', minimumXp: 1500 },
  { level: 'Estratega', minimumXp: 3000 },
  { level: 'Maestro', minimumXp: 6000 },
];
