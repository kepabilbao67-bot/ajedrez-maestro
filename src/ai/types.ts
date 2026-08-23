export type DifficultyLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type DifficultyName = 'Novice' | 'Beginner' | 'Easy' | 'Medium' | 'Hard' | 'Expert' | 'Master' | 'Grandmaster';

export type PlayStyle = 'Balanced' | 'Aggressive' | 'Defensive' | 'Tactical' | 'Positional';

export type AnalysisState = 'idle' | 'running' | 'completed' | 'cancelled' | 'failed';

export interface SearchLimits {
  readonly timeMs?: number;
  readonly depth?: number;
}

export type AlgebraicSquare = string;
export type AiPromotionPiece = 'q' | 'r' | 'b' | 'n';

/** A proposed move. It is not legal until ChessGame.legalMoves() confirms it. */
export interface AiMove {
  readonly from: AlgebraicSquare;
  readonly to: AlgebraicSquare;
  readonly promotion?: AiPromotionPiece;
}

export interface PositionEvaluation {
  readonly kind: 'centipawns' | 'mate';
  readonly value: number;
  readonly perspective: 'white';
}

export interface CandidateMove {
  readonly move: AiMove;
  readonly evaluation: PositionEvaluation;
  readonly principalVariation: readonly AiMove[];
}

export interface AnalysisMetadata {
  readonly engineId: string;
  readonly engineVersion?: string;
  readonly depthReached?: number;
  readonly elapsedMs: number;
  readonly nodes?: number;
  readonly completed: boolean;
  readonly selectedCandidateRank: number;
  readonly difficulty: DifficultyLevel;
  readonly playStyle?: PlayStyle;
}

export interface AnalysisRequest {
  readonly fen: string;
  readonly difficulty: DifficultyLevel;
  readonly playStyle?: PlayStyle;
  readonly limits: SearchLimits;
  readonly signal?: AbortSignal;
}

export interface AnalysisResult {
  readonly bestMove: AiMove | null;
  readonly evaluation: PositionEvaluation;
  readonly candidateMoves: readonly CandidateMove[];
  readonly principalVariation: readonly AiMove[];
  readonly metadata: AnalysisMetadata;
}
