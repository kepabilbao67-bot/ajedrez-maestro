import type { AnalysisRequest, AnalysisResult } from './types';

/**
 * Boundary implemented by a future local engine adapter.
 *
 * Implementations may analyse positions, but they must never mutate ChessGame.
 * Consumers must validate bestMove against ChessGame.legalMoves() before calling
 * ChessGame.move().
 */
export interface AiEngine {
  readonly id: string;
  readonly version?: string;

  analyze(request: AnalysisRequest): Promise<AnalysisResult>;
  dispose?(): Promise<void> | void;
}
