import { ChessGame, squareToAlgebraic } from '../chess';
import type { PuzzleAttempt, PuzzleMove, TrainingPuzzle } from './training-types';

const sameMove = (expected: PuzzleMove, actual: PuzzleMove): boolean =>
  expected.from === actual.from && expected.to === actual.to && expected.promotion === actual.promotion;

/** Validates both the proposed move and the puzzle answer through the certified core. */
export class PuzzleEngine {
  private readonly game: ChessGame;
  private step = 0;

  constructor(private readonly puzzle: TrainingPuzzle) {
    this.game = new ChessGame(puzzle.fen);
  }

  attempt(move: PuzzleMove): PuzzleAttempt {
    const legal = this.game.legalMoves().some((candidate) =>
      squareToAlgebraic(candidate.from) === move.from && squareToAlgebraic(candidate.to) === move.to && candidate.promotion === move.promotion);
    if (!legal) return { correct: false, legal: false, completed: false, nextStep: this.step, message: 'Ese movimiento no es legal en esta posición.', explanation: this.puzzle.explanation, alternative: this.puzzle.alternative, learning: this.puzzle.objective };
    if (!sameMove(this.puzzle.solution[this.step], move)) {
      return { correct: false, legal: true, completed: false, nextStep: this.step, message: 'Esta jugada pierde ventaja porque no cumple el objetivo táctico.', explanation: this.puzzle.explanation, alternative: this.puzzle.alternative, learning: this.puzzle.objective };
    }
    this.game.move(move);
    this.step += 1;
    const completed = this.step === this.puzzle.solution.length;
    return { correct: true, legal: true, completed, nextStep: this.step, message: completed ? 'Excelente. Has encontrado la idea táctica.' : 'Correcto. Continúa con la siguiente jugada.', explanation: this.puzzle.explanation, alternative: this.puzzle.alternative, learning: this.puzzle.objective };
  }
}
