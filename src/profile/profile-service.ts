import type { GameAnalysis } from '../ai/coach/coach-types';
import { updateLearningProfile } from '../ai/coach/training-profile';
import { ProfileStorage } from './profile-storage';
import type { PlayerProfile, ProfileGameResult } from './profile-types';
import type { TrainingCategory } from '../training/training-types';

function improvementScore(profile: PlayerProfile, analysis: GameAnalysis | null): number {
  const resultPoints = profile.learning.wins * 2 + profile.learning.draws;
  return Math.max(0, resultPoints - profile.learning.losses - (analysis?.mistakes.length ?? 0));
}

export class ProfileService {
  constructor(private readonly storage = new ProfileStorage()) {}

  load(): PlayerProfile { return this.storage.load(); }

  recordHint(): PlayerProfile {
    const current = this.load();
    const next = { ...current, hintsUsed: current.hintsUsed + 1, updatedAt: new Date().toISOString() };
    this.storage.save(next);
    return next;
  }

  saveAnalysis(analysis: GameAnalysis): PlayerProfile {
    const current = this.load();
    const next = { ...current, lastAnalysis: analysis, updatedAt: new Date().toISOString() };
    this.storage.save(next);
    return next;
  }

  recordExerciseAttempt(category: TrainingCategory, correct: boolean, completed: boolean): PlayerProfile {
    const current = this.load();
    const training = current.training ?? { attempted: 0, correct: 0, completed: 0, byCategory: { 'mate-in-1': 0, 'mate-in-2': 0, 'basic-tactics': 0, 'win-material': 0, 'best-move': 0, 'defend-position': 0 } };
    const next: PlayerProfile = {
      ...current,
      progress: { ...current.progress, exercisesCompleted: (current.progress.exercisesCompleted ?? 0) + (completed ? 1 : 0) },
      training: { attempted: training.attempted + 1, correct: training.correct + (correct ? 1 : 0), completed: training.completed + (completed ? 1 : 0), byCategory: { ...training.byCategory, [category]: training.byCategory[category] + (completed ? 1 : 0) } },
      learning: completed ? { ...current.learning, strengths: [...current.learning.strengths, `Entrenamiento: ${category}`].slice(-8) } : current.learning,
      updatedAt: new Date().toISOString(),
    };
    this.storage.save(next);
    return next;
  }

  recordCompletedGame(result: ProfileGameResult, analysis: GameAnalysis | null): PlayerProfile {
    const current = this.load();
    const learning = analysis
      ? updateLearningProfile(current.learning, analysis, result)
      : {
          ...current.learning,
          gamesPlayed: current.learning.gamesPlayed + 1,
          wins: current.learning.wins + (result === 'win' ? 1 : 0),
          losses: current.learning.losses + (result === 'loss' ? 1 : 0),
          draws: current.learning.draws + (result === 'draw' ? 1 : 0),
        };
    const currentNonLossStreak = result === 'loss' ? 0 : current.progress.currentNonLossStreak + 1;
    const next: PlayerProfile = {
      ...current,
      learning,
      lastAnalysis: analysis ?? current.lastAnalysis,
      progress: {
        currentNonLossStreak,
        bestNonLossStreak: Math.max(current.progress.bestNonLossStreak, currentNonLossStreak),
        improvementScore: improvementScore({ ...current, learning }, analysis),
      },
      updatedAt: new Date().toISOString(),
    };
    this.storage.save(next);
    return next;
  }
}
