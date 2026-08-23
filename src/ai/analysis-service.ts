import type { AiEngine } from './engine-adapter';
import type { AiMove, AnalysisRequest, AnalysisResult, AnalysisState } from './types';

export type { AnalysisState } from './types';

export interface AnalysisSession {
  readonly state: AnalysisState;
  readonly result: AnalysisResult | null;
  readonly error: Error | null;
  cancel(): void;
}

/**
 * Orchestrates analysis only. It does not play moves.
 * A future UI integration must pass every proposed AiMove through a legality
 * gate backed by the current ChessGame.legalMoves() result.
 */
export interface AnalysisService {
  readonly engine: AiEngine;
  analyze(request: AnalysisRequest): AnalysisSession;
}

/** Contract for the mandatory ChessGame legality boundary used by future UI. */
export interface AiMoveLegalityGate {
  validate(move: AiMove): AiMove | null;
}
