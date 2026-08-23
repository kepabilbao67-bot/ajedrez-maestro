import { describe, expect, it, vi } from 'vitest';

import { ChessGame } from '../chess';

import { playAiTurn } from './ai-opponent';
import { AiCancelledError, AiIllegalMoveError, AiTimeoutError } from './errors';
import type { AiEngine } from './engine-adapter';
import { resolveLegalAiMove } from './legality-gate';
import { StockfishEngine, type WorkerPort } from './stockfish-engine';
import type { AiMove, AnalysisRequest, AnalysisResult, AnalysisState, DifficultyLevel } from './types';

class FakeStockfishWorker implements WorkerPort {
  onmessage: ((event: { readonly data: unknown }) => void) | null = null;
  onerror: ((event: { readonly message?: string }) => void) | null = null;
  readonly commands: string[] = [];
  terminated = false;

  constructor(private readonly answerSearch = true) {}

  postMessage(message: string): void {
    this.commands.push(message);
    if (message === 'uci') queueMicrotask(() => this.onmessage?.({ data: 'uciok' }));
    if (message.startsWith('go ') && this.answerSearch) {
      queueMicrotask(() => {
        this.onmessage?.({ data: 'info depth 8 multipv 1 score cp 24 nodes 1200 time 12 pv e7e5 g1f3' });
        this.onmessage?.({ data: 'info depth 8 multipv 2 score cp 18 nodes 1100 time 12 pv c7c5 g1f3' });
        this.onmessage?.({ data: 'info depth 8 multipv 3 score cp 10 nodes 1000 time 12 pv e7e6 d2d4' });
        this.onmessage?.({ data: 'bestmove e7e5' });
      });
    }
  }

  terminate(): void {
    this.terminated = true;
  }
}

function result(bestMove: AiMove | null, difficulty: DifficultyLevel = 3): AnalysisResult {
  return {
    bestMove,
    evaluation: { kind: 'centipawns', value: 0, perspective: 'white' },
    candidateMoves: [],
    principalVariation: bestMove ? [bestMove] : [],
    metadata: { engineId: 'fake', elapsedMs: 0, completed: true, selectedCandidateRank: 1, difficulty },
  };
}

function fakeEngine(analyze: (request: AnalysisRequest) => Promise<AnalysisResult>): AiEngine {
  return { id: 'fake', analyze };
}

describe('StockfishEngine', () => {
  it('returns a real UCI candidate and varies Beginner away from the best move', async () => {
    const worker = new FakeStockfishWorker();
    const engine = new StockfishEngine({ workerFactory: () => worker, random: () => 0.99 });
    const analysis = await engine.analyze({
      fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
      difficulty: 1,
      limits: { timeMs: 50, depth: 2 },
    });
    expect(analysis.bestMove).toEqual({ from: 'e7', to: 'e6' });
    expect(analysis.candidateMoves).toHaveLength(3);
    expect(analysis.metadata.selectedCandidateRank).toBe(3);
  });

  it('uses the configured depth for a changed difficulty', async () => {
    const worker = new FakeStockfishWorker();
    const engine = new StockfishEngine({ workerFactory: () => worker, random: () => 0 });
    await engine.analyze({ fen: ChessGame.initial().fen(), difficulty: 7, limits: { timeMs: 30, depth: 18 } });
    expect(worker.commands).toContain('setoption name MultiPV value 3');
    expect(worker.commands).toContain('go movetime 30 depth 18');
  });

  it('supports cancellation and terminates the contaminated worker', async () => {
    const worker = new FakeStockfishWorker(false);
    const engine = new StockfishEngine({ workerFactory: () => worker, timeoutGraceMs: 5_000 });
    const controller = new AbortController();
    const pending = engine.analyze({ fen: ChessGame.initial().fen(), difficulty: 3, limits: { timeMs: 100 }, signal: controller.signal });
    await new Promise((resolve) => setTimeout(resolve, 0));
    controller.abort();
    await expect(pending).rejects.toBeInstanceOf(AiCancelledError);
    expect(worker.terminated).toBe(true);
  });

  it('rejects a search timeout with a controlled error', async () => {
    const worker = new FakeStockfishWorker(false);
    const engine = new StockfishEngine({ workerFactory: () => worker, timeoutGraceMs: 0 });
    await expect(engine.analyze({ fen: ChessGame.initial().fen(), difficulty: 1, limits: { timeMs: 5 } }))
      .rejects.toBeInstanceOf(AiTimeoutError);
  });
});

describe('AI legality and turn orchestration', () => {
  it('plays a legal engine response only through ChessGame', async () => {
    const game = ChessGame.initial();
    game.move({ from: 'e2', to: 'e4' });
    const record = await playAiTurn({
      game,
      difficulty: 3,
      engine: fakeEngine(async () => result({ from: 'e7', to: 'e5' })),
    });
    expect(record?.san).toBe('e5');
    expect(game.history()).toHaveLength(2);
  });

  it('rejects an illegal proposal from the engine', async () => {
    const game = ChessGame.initial();
    game.move({ from: 'e2', to: 'e4' });
    expect(resolveLegalAiMove(game, { from: 'a1', to: 'a8' })).toBeNull();
    await expect(playAiTurn({
      game,
      difficulty: 3,
      engine: fakeEngine(async () => result({ from: 'a1', to: 'a8' })),
    })).rejects.toBeInstanceOf(AiIllegalMoveError);
    expect(game.history()).toHaveLength(1);
  });

  it('reports running state and skips analysis after game over', async () => {
    let release: ((value: AnalysisResult) => void) | undefined;
    const deferred = new Promise<AnalysisResult>((resolve) => { release = resolve; });
    const states: AnalysisState[] = [];
    const game = ChessGame.initial();
    game.move({ from: 'e2', to: 'e4' });
    const pending = playAiTurn({ game, difficulty: 3, engine: fakeEngine(() => deferred), onStateChange: (state) => states.push(state) });
    expect(states).toEqual(['running']);
    release?.(result({ from: 'e7', to: 'e5' }));
    await pending;
    expect(states).toEqual(['running', 'completed']);

    const mate = new ChessGame('7k/6Q1/6K1/8/8/8/8/8 b - - 0 1');
    const analyze = vi.fn(async () => result(null));
    expect(await playAiTurn({ game: mate, difficulty: 3, engine: fakeEngine(analyze) })).toBeNull();
    expect(analyze).not.toHaveBeenCalled();
  });
});
