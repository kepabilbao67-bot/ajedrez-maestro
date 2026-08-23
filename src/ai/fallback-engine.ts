import { ChessGame, squareToAlgebraic, typeOf, colorOf, type Square } from '../chess';
import { difficultyDefinition } from './difficulty';
import type { AiEngine } from './engine-adapter';
import { AiCancelledError } from './errors';
import type {
  AiMove,
  AnalysisRequest,
  AnalysisResult,
  CandidateMove,
  DifficultyLevel,
  PlayStyle,
  PositionEvaluation,
} from './types';

type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

const PIECE_VALUES: Record<PieceType, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

const CENTER_SQUARES = new Set<string>(['d4', 'e4', 'd5', 'e5']);
const EXTENDED_CENTER = new Set<string>(['c4', 'c5', 'f4', 'f5', 'c3', 'c6', 'f3', 'f6']);

export interface FallbackEngineOptions {
  readonly random?: () => number;
  readonly maxDepth?: number;
}

export class FallbackAiEngine implements AiEngine {
  readonly id = 'fallback-engine';
  readonly version = '1.0.0';

  private readonly random: () => number;
  private readonly maxDepth: number;

  constructor(options: FallbackEngineOptions = {}) {
    this.random = options.random ?? Math.random;
    this.maxDepth = options.maxDepth ?? 3;
  }

  async analyze(request: AnalysisRequest): Promise<AnalysisResult> {
    if (request.signal?.aborted) throw new AiCancelledError();
    const startTime = Date.now();

    const rootGame = new ChessGame(request.fen);
    const status = rootGame.status();

    if (status.gameOver) {
      return {
        bestMove: null,
        evaluation: { kind: 'centipawns', value: 0, perspective: 'white' },
        candidateMoves: [],
        principalVariation: [],
        metadata: {
          engineId: this.id,
          engineVersion: this.version,
          depthReached: 0,
          elapsedMs: Date.now() - startTime,
          nodes: 1,
          completed: true,
          selectedCandidateRank: 0,
          difficulty: request.difficulty,
          playStyle: request.playStyle,
        },
      };
    }

    const legalMoves = rootGame.legalMoves();
    if (legalMoves.length === 0) {
      return {
        bestMove: null,
        evaluation: { kind: 'centipawns', value: 0, perspective: 'white' },
        candidateMoves: [],
        principalVariation: [],
        metadata: {
          engineId: this.id,
          engineVersion: this.version,
          depthReached: 0,
          elapsedMs: Date.now() - startTime,
          nodes: 1,
          completed: true,
          selectedCandidateRank: 0,
          difficulty: request.difficulty,
          playStyle: request.playStyle,
        },
      };
    }

    const turn = rootGame.getPosition().turn;
    const isWhite = turn === 'w';
    let nodesEvaluated = 0;

    const depth = Math.min(
      this.maxDepth,
      request.limits.depth ?? (request.difficulty <= 2 ? 1 : request.difficulty <= 4 ? 2 : 3),
    );

    const scoredCandidates: { candidate: CandidateMove; score: number }[] = [];

    for (const move of legalMoves) {
      if (request.signal?.aborted) throw new AiCancelledError();

      const nextGame = new ChessGame(rootGame.fen());
      const record = nextGame.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion,
      });

      if (!record) continue;
      nodesEvaluated++;

      const evalScore = this.minimax(nextGame, depth - 1, -Infinity, Infinity, !isWhite, request.signal);
      nodesEvaluated += evalScore.nodes;

      const aiMove: AiMove = {
        from: squareToAlgebraic(move.from),
        to: squareToAlgebraic(move.to),
        promotion: move.promotion,
      };

      const evaluation: PositionEvaluation = {
        kind: Math.abs(evalScore.score) >= 90000 ? 'mate' : 'centipawns',
        value: evalScore.score,
        perspective: 'white',
      };

      scoredCandidates.push({
        candidate: {
          move: aiMove,
          evaluation,
          principalVariation: [aiMove],
        },
        score: isWhite ? evalScore.score : -evalScore.score,
      });
    }

    if (scoredCandidates.length === 0) {
      throw new Error('No valid legal candidates found');
    }

    // Sort descending by score for the current player
    scoredCandidates.sort((a, b) => b.score - a.score);

    const candidates = scoredCandidates.map((s) => s.candidate);
    const selectedRank = this.selectRank(candidates, request.difficulty, request.playStyle, !isWhite);
    const selected = candidates[selectedRank] ?? candidates[0];
    const strongest = candidates[0];

    return {
      bestMove: selected.move,
      evaluation: strongest.evaluation,
      candidateMoves: candidates,
      principalVariation: strongest.principalVariation,
      metadata: {
        engineId: this.id,
        engineVersion: this.version,
        depthReached: depth,
        elapsedMs: Date.now() - startTime,
        nodes: nodesEvaluated,
        completed: true,
        selectedCandidateRank: selectedRank + 1,
        difficulty: request.difficulty,
        playStyle: request.playStyle,
      },
    };
  }

  dispose(): void {
    // No-op for pure in-memory engine
  }

  private minimax(
    game: ChessGame,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean,
    signal?: AbortSignal,
  ): { score: number; nodes: number } {
    if (signal?.aborted) throw new AiCancelledError();
    let nodes = 1;

    const status = game.status();
    if (status.checkmate) {
      // Mate detected: if isMaximizing (White to move), Black just delivered mate -> -100000
      return { score: isMaximizing ? -100000 - depth : 100000 + depth, nodes };
    }
    if (status.draw || status.stalemate) {
      return { score: 0, nodes };
    }
    if (depth <= 0) {
      return { score: this.evaluateStatic(game), nodes };
    }

    const moves = game.legalMoves();
    if (moves.length === 0) {
      return { score: this.evaluateStatic(game), nodes };
    }

    if (isMaximizing) {
      let maxScore = -Infinity;
      for (const move of moves) {
        const nextGame = new ChessGame(game.fen());
        nextGame.move({ from: move.from, to: move.to, promotion: move.promotion });
        const result = this.minimax(nextGame, depth - 1, alpha, beta, false, signal);
        nodes += result.nodes;
        maxScore = Math.max(maxScore, result.score);
        alpha = Math.max(alpha, maxScore);
        if (beta <= alpha) break;
      }
      return { score: maxScore, nodes };
    } else {
      let minScore = Infinity;
      for (const move of moves) {
        const nextGame = new ChessGame(game.fen());
        nextGame.move({ from: move.from, to: move.to, promotion: move.promotion });
        const result = this.minimax(nextGame, depth - 1, alpha, beta, true, signal);
        nodes += result.nodes;
        minScore = Math.min(minScore, result.score);
        beta = Math.min(beta, minScore);
        if (beta <= alpha) break;
      }
      return { score: minScore, nodes };
    }
  }

  private evaluateStatic(game: ChessGame): number {
    const position = game.getPosition();
    let score = 0;

    for (let square = 0; square < position.board.length; square++) {
      const piece = position.board[square];
      if (piece === null) continue;

      const type = typeOf(piece);
      const color = colorOf(piece);
      const val = PIECE_VALUES[type];
      const squareName = squareToAlgebraic(square as Square);

      let positional = 0;
      if (CENTER_SQUARES.has(squareName)) {
        positional += 20;
      } else if (EXTENDED_CENTER.has(squareName)) {
        positional += 10;
      }

      if (color === 'w') {
        score += val + positional;
      } else {
        score -= val + positional;
      }
    }

    return score;
  }

  private selectRank(
    candidates: CandidateMove[],
    level: DifficultyLevel,
    style?: PlayStyle,
    blackToMove?: boolean,
  ): number {
    const count = candidates.length;
    if (count <= 1) return 0;
    const profile = difficultyDefinition(level);

    if (style && style !== 'Balanced') {
      const windowSize = Math.max(1, Math.min(profile.candidateWindow, count));
      const viable = candidates.slice(0, windowSize);
      let bestRank = 0;
      let bestScore = -Infinity;

      for (let i = 0; i < viable.length; i++) {
        const move = viable[i].move;
        let styleScore = 0;

        const fromRank = parseInt(move.from[1], 10);
        const toRank = parseInt(move.to[1], 10);
        const rankDiff = blackToMove ? fromRank - toRank : toRank - fromRank;

        if (style === 'Aggressive') {
          styleScore += rankDiff * 2;
        } else if (style === 'Defensive') {
          styleScore -= rankDiff * 2;
        } else if (style === 'Tactical') {
          styleScore += Math.abs(fromRank - toRank) > 2 ? 2 : 0;
        } else if (style === 'Positional') {
          if (CENTER_SQUARES.has(move.to) || EXTENDED_CENTER.has(move.to)) {
            styleScore += 3;
          }
        }

        const totalScore = styleScore - i * 3;
        if (totalScore > bestScore) {
          bestScore = totalScore;
          bestRank = i;
        }
      }
      return bestRank;
    }

    if (this.random() < profile.bestMoveProbability) return 0;
    return 1 + Math.floor(this.random() * Math.max(1, Math.min(profile.candidateWindow, count) - 1));
  }
}
