import { XpService } from '../gamification/xp-service';
import { ProfileService } from '../profile/profile-service';
import { PuzzleEngine } from './puzzle-engine';
import type { PuzzleAttempt, PuzzleMove, TrainingPuzzle } from './training-types';

export class TrainingService {
  constructor(private readonly profileService = new ProfileService(), private readonly xpService = new XpService()) {}

  createSession(puzzle: TrainingPuzzle): PuzzleEngine { return new PuzzleEngine(puzzle); }

  submit(engine: PuzzleEngine, puzzle: TrainingPuzzle, move: PuzzleMove): PuzzleAttempt {
    const result = engine.attempt(move);
    this.profileService.recordExerciseAttempt(puzzle.category, result.correct, result.completed);
    if (result.completed) {
      this.xpService.recordExercise();
    }
    return result;
  }
}
