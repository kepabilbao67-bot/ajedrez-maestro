import type { AiMove, CandidateMove, PositionEvaluation } from '../types';

export type CoachHintLevel = 1 | 2 | 3;
export type MistakeSeverity = 'inaccuracy' | 'mistake' | 'blunder';

export interface EvaluatedPosition {
  readonly fen: string;
  readonly evaluation: PositionEvaluation;
  readonly bestMove: AiMove | null;
  readonly candidateMoves: readonly CandidateMove[];
}

export interface PlayedMove {
  readonly san: string;
  readonly fenBefore: string;
  readonly fenAfter: string;
}

export interface GameAnalysisInput {
  readonly moves: readonly PlayedMove[];
  readonly evaluations: readonly EvaluatedPosition[];
  readonly result: 'white-win' | 'black-win' | 'draw' | 'unfinished';
}

export interface MoveInsight {
  readonly moveNumber: number;
  readonly san: string;
  readonly severity: MistakeSeverity;
  readonly evaluationChange: number;
  readonly recommendedMove: AiMove | null;
  readonly explanation: string;
}

export interface GameAnalysis {
  readonly mistakes: readonly MoveInsight[];
  readonly inaccuracies: readonly MoveInsight[];
  readonly missedOpportunities: readonly MoveInsight[];
  readonly criticalMoment: MoveInsight | null;
  readonly summary: string;
}

export interface CoachHint {
  readonly level: CoachHintLevel;
  readonly available: boolean;
  readonly message: string;
  readonly recommendedMove: AiMove | null;
}

export interface LearningProfile {
  readonly estimatedLevel: number;
  readonly gamesPlayed: number;
  readonly wins: number;
  readonly losses: number;
  readonly draws: number;
  readonly frequentErrors: readonly MistakeSeverity[];
  readonly strengths: readonly string[];
  readonly weaknesses: readonly string[];
}
