import type { GameAnalysis, LearningProfile } from './coach-types';

export const EMPTY_LEARNING_PROFILE: LearningProfile = {
  estimatedLevel: 1,
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  frequentErrors: [],
  strengths: [],
  weaknesses: [],
};

export function updateLearningProfile(profile: LearningProfile, analysis: GameAnalysis, result: 'win' | 'loss' | 'draw'): LearningProfile {
  const errors = analysis.mistakes.map((item) => item.severity);
  const weaknesses = errors.length > 0 ? ['Convertir ventajas y revisar amenazas tácticas'] : profile.weaknesses;
  const strengths = analysis.mistakes.length === 0 ? ['Buena estabilidad de evaluación'] : profile.strengths;
  return {
    ...profile,
    gamesPlayed: profile.gamesPlayed + 1,
    wins: profile.wins + (result === 'win' ? 1 : 0),
    losses: profile.losses + (result === 'loss' ? 1 : 0),
    draws: profile.draws + (result === 'draw' ? 1 : 0),
    frequentErrors: [...profile.frequentErrors, ...errors].slice(-12),
    strengths,
    weaknesses,
  };
}
