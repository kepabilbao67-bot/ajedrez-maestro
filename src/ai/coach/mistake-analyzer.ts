import type { AiMove } from '../types';
import type { MistakeSeverity, MoveInsight } from './coach-types';

export function classifyEvaluationLoss(loss: number): MistakeSeverity | null {
  if (loss >= 1.5) return 'blunder';
  if (loss >= 0.45) return 'mistake';
  if (loss >= 0.15) return 'inaccuracy';
  return null;
}

export function createMoveInsight(moveNumber: number, san: string, loss: number, recommendedMove: AiMove | null): MoveInsight | null {
  const severity = classifyEvaluationLoss(loss);
  if (!severity) return null;
  const label = severity === 'blunder' ? 'error grave' : severity === 'mistake' ? 'error' : 'imprecisión';
  const recommendation = recommendedMove ? ` La alternativa recomendada era ${recommendedMove.from}-${recommendedMove.to}.` : '';
  return {
    moveNumber,
    san,
    severity,
    evaluationChange: -loss,
    recommendedMove,
    explanation: `Movimiento ${moveNumber}: ${label}. La evaluación cambió ${loss.toFixed(1)} puntos en tu contra.${recommendation}`,
  };
}
