import { describe, expect, it } from 'vitest';
import { XpService } from '../gamification/xp-service';
import { ProfileService } from '../profile/profile-service';
import { ProfileStorage, type KeyValueStorage } from '../profile/profile-storage';
import { PUZZLE_LIBRARY } from './puzzle-library';
import { TrainingService } from './training-service';
import { ChessGame, squareToAlgebraic } from '../chess';
import { recommendedDifficulty } from './adaptive-training';

class MemoryStorage implements KeyValueStorage {
  private readonly values = new Map<string, string>();
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void { this.values.set(key, value); }
  removeItem(key: string): void { this.values.delete(key); }
}

function serviceWithMemory() {
  const storage = new ProfileStorage(new MemoryStorage());
  return { storage, service: new TrainingService(new ProfileService(storage), new XpService(storage)) };
}

describe('TrainingService', () => {
  const puzzle = PUZZLE_LIBRARY[0];

  it('accepts the certified correct exercise move', () => {
    const { service } = serviceWithMemory();
    const result = service.submit(service.createSession(puzzle), puzzle, puzzle.solution[0]);
    expect(result).toMatchObject({ correct: true, legal: true, completed: true });
  });

  it('rejects an incorrect legal exercise move', () => {
    const { service } = serviceWithMemory();
    const result = service.submit(service.createSession(puzzle), puzzle, { from: 'g6', to: 'g5' });
    expect(result).toMatchObject({ correct: false, legal: true, completed: false });
  });

  it('awards XP and updates the profile on completion', () => {
    const { storage, service } = serviceWithMemory();
    service.submit(service.createSession(puzzle), puzzle, puzzle.solution[0]);
    const profile = storage.load();
    expect(profile.gamification?.xp).toBeGreaterThan(0);
    expect(profile.progress.exercisesCompleted).toBe(1);
    expect(profile.training).toMatchObject({ attempted: 1, correct: 1, completed: 1 });
  });

  it('loads fifty-five categorized exercises with legal core-validated solutions', () => {
    expect(PUZZLE_LIBRARY).toHaveLength(55);
    expect(new Set(PUZZLE_LIBRARY.map((item) => item.category))).toEqual(new Set(['mate-in-1', 'basic-tactics', 'win-material', 'defend-position', 'best-move']));
    for (const puzzle of PUZZLE_LIBRARY) {
      const game = new ChessGame(puzzle.fen);
      const solution = puzzle.solution[0];
      expect(game.legalMoves().some((move) => squareToAlgebraic(move.from) === solution.from && squareToAlgebraic(move.to) === solution.to && move.promotion === solution.promotion)).toBe(true);
      if (puzzle.category === 'mate-in-1') {
        game.move(solution);
        expect(game.status().checkmate).toBe(true);
      }
    }
  });

  it('adapts difficulty to the player accuracy', () => {
    expect(recommendedDifficulty(5, 1, 3)).toBe(2);
    expect(recommendedDifficulty(5, 5, 3)).toBe(4);
  });
});
