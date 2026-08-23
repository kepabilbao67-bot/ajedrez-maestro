import { unlockAchievements } from './achievements';
import { calendarDate, createDailyChallenge, progressDailyChallenge } from './daily-challenges';
import { ProfileStorage } from '../profile/profile-storage';
import type { PlayerProfile, ProfileGameResult } from '../profile/profile-types';
import { DEFAULT_GAMIFICATION_STATE, XP_AWARDS, XP_LEVELS, type GamificationState, type PlayerLevel, type XpEvent } from './xp-types';

function cloneDefaultState(): GamificationState {
  return { ...DEFAULT_GAMIFICATION_STATE, unlockedAchievements: [] };
}

export function levelForXp(xp: number): PlayerLevel {
  return [...XP_LEVELS].reverse().find((definition) => xp >= definition.minimumXp)!.level;
}

function previousDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  parsed.setUTCDate(parsed.getUTCDate() - 1);
  return calendarDate(parsed);
}

export class XpService {
  constructor(private readonly storage = new ProfileStorage(), private readonly now: () => Date = () => new Date()) {}

  load(): GamificationState {
    return this.storage.load().gamification ?? cloneDefaultState();
  }

  private save(profile: PlayerProfile, state: GamificationState): GamificationState {
    this.storage.save({ ...profile, gamification: state, updatedAt: new Date().toISOString() });
    return state;
  }

  private activate(state: GamificationState, date: string): GamificationState {
    if (state.lastActiveDate === date) return state;
    const dailyStreak = state.lastActiveDate === previousDate(date) ? state.dailyStreak + 1 : 1;
    return { ...state, dailyStreak, lastActiveDate: date };
  }

  award(event: XpEvent): GamificationState {
    const profile = this.storage.load();
    const date = calendarDate(this.now());
    const base = this.activate(profile.gamification ?? cloneDefaultState(), date);
    const challenge = base.dailyChallenge?.date === date ? base.dailyChallenge : createDailyChallenge(date);
    const progressed = event === 'game-completed' || event === 'analysis-completed' || event === 'exercise-completed'
      ? progressDailyChallenge(challenge, event)
      : challenge;
    const reward = progressed.completed && !challenge.completed ? progressed.rewardXp : 0;
    const state = { ...base, xp: base.xp + XP_AWARDS[event] + reward, dailyChallenge: progressed };
    const context = {
      wins: profile.learning.wins,
      gamesPlayed: profile.learning.gamesPlayed,
      estimatedLevel: profile.learning.estimatedLevel,
      exercisesCompleted: profile.progress.exercisesCompleted ?? 0,
    };
    return this.save(profile, unlockAchievements(state, context, this.now().toISOString()));
  }

  recordGame(result: ProfileGameResult, checkmate: boolean): GamificationState {
    let state = this.award('game-completed');
    if (result === 'win') state = this.award('victory');
    if (!checkmate) return state;
    const profile = this.storage.load();
    const next = { ...state, checkmates: state.checkmates + 1 };
    const context = {
      wins: profile.learning.wins,
      gamesPlayed: profile.learning.gamesPlayed,
      estimatedLevel: profile.learning.estimatedLevel,
      exercisesCompleted: profile.progress.exercisesCompleted ?? 0,
    };
    return this.save(profile, unlockAchievements(next, context, this.now().toISOString()));
  }

  recordAnalysis(): GamificationState { return this.award('analysis-completed'); }
  recordExercise(): GamificationState { return this.award('exercise-completed'); }
  recordPersonalImprovement(): GamificationState { return this.award('personal-improvement'); }
}
