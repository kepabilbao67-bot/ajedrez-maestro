import type { ChessGame, MoveRecord } from '../chess';

import { difficultyDefinition } from './difficulty';
import { AiCancelledError, AiEngineError } from './errors';
import type { AiEngine } from './engine-adapter';
import { applyValidatedAiMove } from './legality-gate';
import type { AnalysisState, DifficultyLevel, PlayStyle } from './types';

interface AiTurnOptions {
  readonly game: ChessGame;
  readonly engine: AiEngine;
  readonly difficulty: DifficultyLevel;
  readonly playStyle?: PlayStyle;
  readonly signal?: AbortSignal;
  readonly onStateChange?: (state: AnalysisState) => void;
}

export async function playAiTurn({ game, engine, difficulty, playStyle, signal, onStateChange }: AiTurnOptions): Promise<MoveRecord | null> {
  if (game.status().gameOver || game.getPosition().turn !== 'b') return null;
  onStateChange?.('running');
  try {
    const result = await engine.analyze({ fen: game.fen(), difficulty, playStyle, limits: difficultyDefinition(difficulty).defaultLimits, signal });
    if (!result.bestMove) throw new AiEngineError('Stockfish no devolvió ningún movimiento');
    const record = applyValidatedAiMove(game, result.bestMove);
    onStateChange?.('completed');
    return record;
  } catch (error) {
    onStateChange?.(error instanceof AiCancelledError ? 'cancelled' : 'failed');
    throw error;
  }
}
