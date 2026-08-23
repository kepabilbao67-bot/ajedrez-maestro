import type { TrainingDifficulty } from './training-types';

export function recommendedDifficulty(attempted: number, correct: number, current: TrainingDifficulty = 1): TrainingDifficulty {
  if (attempted < 3) return current;
  const accuracy = correct / attempted;
  if (accuracy < 0.5) return Math.max(1, current - 1) as TrainingDifficulty;
  if (accuracy >= 0.8) return Math.min(5, current + 1) as TrainingDifficulty;
  return current;
}
