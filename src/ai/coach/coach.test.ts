import { describe, expect, it } from 'vitest';

import { ChessGame } from '../../chess';
import { analyzeGame } from './game-analyzer';
import { generateHint } from './hint-generator';
import type { EvaluatedPosition, GameAnalysisInput } from './coach-types';

const FEN_BEFORE = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const FEN_AFTER = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';

function point(fen: string, value: number, bestMove = { from: 'e2', to: 'e4' }): EvaluatedPosition {
  return {
    fen,
    evaluation: { kind: 'centipawns', value, perspective: 'white' },
    bestMove,
    candidateMoves: [],
  };
}

function input(before: number, after: number): GameAnalysisInput {
  return {
    moves: [{ san: 'e4', fenBefore: FEN_BEFORE, fenAfter: FEN_AFTER }],
    evaluations: [point(FEN_BEFORE, before), point(FEN_AFTER, after)],
    result: 'unfinished',
  };
}

describe('coach game analysis', () => {
  it('creates a stable analysis for a correct move', () => {
    const analysis = analyzeGame(input(0, 25));
    expect(analysis.mistakes).toHaveLength(0);
    expect(analysis.inaccuracies).toHaveLength(0);
    expect(analysis.criticalMoment).toBeNull();
  });

  it('detects a severe evaluation loss and its critical moment', () => {
    const analysis = analyzeGame(input(150, -60));
    expect(analysis.mistakes).toHaveLength(1);
    expect(analysis.mistakes[0]).toMatchObject({ severity: 'blunder', evaluationChange: -2.1 });
    expect(analysis.criticalMoment?.moveNumber).toBe(1);
    expect(analysis.missedOpportunities).toHaveLength(1);
  });
});

describe('coach hints', () => {
  it('generates three increasingly explicit hints only for a legal move', () => {
    const game = ChessGame.initial();
    expect(generateHint(game, 1, { from: 'e2', to: 'e4' })).toMatchObject({ available: true, recommendedMove: null });
    expect(generateHint(game, 2, { from: 'e2', to: 'e4' }).message).toContain('e4');
    expect(generateHint(game, 3, { from: 'e2', to: 'e4' })).toMatchObject({ available: true, recommendedMove: { from: 'e2', to: 'e4' } });
    expect(generateHint(game, 3, { from: 'a1', to: 'a8' }).available).toBe(false);
  });

  it('blocks hints when the game has ended', () => {
    const game = new ChessGame('7k/6Q1/6K1/8/8/8/8/8 b - - 0 1');
    expect(game.status().gameOver).toBe(true);
    expect(generateHint(game, 1, { from: 'h8', to: 'g8' })).toMatchObject({ available: false, recommendedMove: null });
  });
});
