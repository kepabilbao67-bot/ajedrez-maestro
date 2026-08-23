import { describe, expect, it } from 'vitest';
import { ChessGame, algebraicToSquare } from '../chess';
import { AiCancelledError } from './errors';
import { FallbackAiEngine } from './fallback-engine';

describe('FallbackAiEngine - Unit Tests', () => {
  it('1. Initial position: returns a legal move and valid AnalysisResult structure', async () => {
    const engine = new FallbackAiEngine();
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const game = new ChessGame(fen);

    const result = await engine.analyze({
      fen,
      difficulty: 3,
      limits: { depth: 2 },
    });

    expect(result.bestMove).not.toBeNull();
    expect(result.candidateMoves.length).toBeGreaterThan(0);
    expect(result.metadata.engineId).toBe('fallback-engine');
    expect(result.metadata.completed).toBe(true);

    const fromSquare = algebraicToSquare(result.bestMove!.from);
    const toSquare = algebraicToSquare(result.bestMove!.to);
    const legal = game.legalMoves(fromSquare).some((m) => m.to === toSquare);
    expect(legal).toBe(true);
  });

  it('2. White to move: analyzes and executes legal white moves', async () => {
    const engine = new FallbackAiEngine();
    // After 1. e4 e5
    const fen = 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2';
    const game = new ChessGame(fen);

    const result = await engine.analyze({
      fen,
      difficulty: 4,
      limits: { depth: 2 },
    });

    expect(result.bestMove).not.toBeNull();
    const fromSquare = algebraicToSquare(result.bestMove!.from);
    const toSquare = algebraicToSquare(result.bestMove!.to);
    const legal = game.legalMoves(fromSquare).some((m) => m.to === toSquare);
    expect(legal).toBe(true);

    const record = game.move({
      from: result.bestMove!.from,
      to: result.bestMove!.to,
      promotion: result.bestMove!.promotion,
    });
    expect(record).not.toBeNull();
  });

  it('3. Black to move: analyzes and executes legal black moves', async () => {
    const engine = new FallbackAiEngine();
    // After 1. e4
    const fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
    const game = new ChessGame(fen);

    const result = await engine.analyze({
      fen,
      difficulty: 3,
      limits: { depth: 2 },
    });

    expect(result.bestMove).not.toBeNull();
    const fromSquare = algebraicToSquare(result.bestMove!.from);
    const toSquare = algebraicToSquare(result.bestMove!.to);
    const legal = game.legalMoves(fromSquare).some((m) => m.to === toSquare);
    expect(legal).toBe(true);

    const record = game.move({
      from: result.bestMove!.from,
      to: result.bestMove!.to,
      promotion: result.bestMove!.promotion,
    });
    expect(record).not.toBeNull();
  });

  it('4. Capture: finds and prefers capturing a hanging high-value piece', async () => {
    const engine = new FallbackAiEngine({ maxDepth: 2 });
    // White queen on d5 attacks undefended black rook on a8, white to move
    const fen = 'r3k3/8/8/3Q4/8/8/8/4K3 w - - 0 1';
    const game = new ChessGame(fen);

    const result = await engine.analyze({
      fen,
      difficulty: 5,
      limits: { depth: 2 },
    });

    expect(result.bestMove).not.toBeNull();
    // Best move should capture the rook: Qxa8
    expect(result.bestMove?.from).toBe('d5');
    expect(result.bestMove?.to).toBe('a8');

    const record = game.move({ from: 'd5', to: 'a8' });
    expect(record).not.toBeNull();
    expect(record?.san).toMatch(/^Qxa8/);
  });

  it('5. Promotion: promotes pawn legally with promotion piece', async () => {
    const engine = new FallbackAiEngine({ maxDepth: 2, random: () => 0 });
    // White pawn on e7 with empty promotion square e8, Black king on a8
    const fen = 'k7/4P3/8/8/8/8/8/4K3 w - - 0 1';
    const game = new ChessGame(fen);

    const result = await engine.analyze({
      fen,
      difficulty: 4,
      limits: { depth: 1 },
    });

    expect(result.bestMove).not.toBeNull();
    expect(result.bestMove?.from).toBe('e7');
    expect(result.bestMove?.to).toBe('e8');
    expect(result.bestMove?.promotion).toBe('q');

    const record = game.move({
      from: result.bestMove!.from,
      to: result.bestMove!.to,
      promotion: result.bestMove!.promotion,
    });
    expect(record).not.toBeNull();
    expect(record?.move.promotion).toBe('q');
  });

  it('6. Completed / Game Over position: returns null bestMove and empty candidates', async () => {
    const engine = new FallbackAiEngine();
    // Scholar's mate checkmate position: Qxf7#
    const fen = 'r1bqkb1r/pppp1Qpp/2n5/4p3/2B1n3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4';
    const game = new ChessGame(fen);
    expect(game.status().gameOver).toBe(true);
    expect(game.status().checkmate).toBe(true);

    const result = await engine.analyze({
      fen,
      difficulty: 3,
      limits: { depth: 2 },
    });

    expect(result.bestMove).toBeNull();
    expect(result.candidateMoves).toHaveLength(0);
    expect(result.principalVariation).toHaveLength(0);
    expect(result.metadata.completed).toBe(true);
  });

  it('7. Deterministic randomness: injected random generator produces reproducible ranking', async () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

    // Mock random that always picks top move (0)
    const topEngine = new FallbackAiEngine({ random: () => 0.0 });
    const topResult = await topEngine.analyze({ fen, difficulty: 1, limits: { depth: 1 } });

    // Mock random that forces alternative candidate
    const subEngine = new FallbackAiEngine({ random: () => 0.99 });
    const subResult = await subEngine.analyze({ fen, difficulty: 1, limits: { depth: 1 } });

    expect(topResult.bestMove).toBeDefined();
    expect(subResult.bestMove).toBeDefined();
    expect(topResult.metadata.selectedCandidateRank).toBe(1);
    expect(subResult.metadata.selectedCandidateRank).toBeGreaterThan(1);
  });

  it('8. Cancellation: aborts immediately when signal is triggered', async () => {
    const engine = new FallbackAiEngine();
    const controller = new AbortController();
    controller.abort();

    await expect(
      engine.analyze({
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        difficulty: 3,
        limits: { depth: 2 },
        signal: controller.signal,
      }),
    ).rejects.toThrow(AiCancelledError);
  });
});
