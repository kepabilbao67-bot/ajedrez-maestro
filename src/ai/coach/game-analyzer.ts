import type { EvaluatedPosition, GameAnalysis, GameAnalysisInput, MoveInsight, PlayedMove } from './coach-types';
import { createMoveInsight } from './mistake-analyzer';

function whiteValue(position: EvaluatedPosition | undefined): number | null {
  if (!position || position.evaluation.kind !== 'centipawns') return null;
  return position.evaluation.value / 100;
}

function playedMove(move: PlayedMove) {
  return move.san.replace(/[+#]$/, '').replace(/^.*[a-h]x?/, '');
}

function matchesRecommendation(move: PlayedMove, recommendation: EvaluatedPosition['bestMove']): boolean {
  if (!recommendation) return false;
  const destination = recommendation.to;
  return playedMove(move).endsWith(destination);
}

export function analyzeGame(input: GameAnalysisInput): GameAnalysis {
  const byFen = new Map(input.evaluations.map((item) => [item.fen, item]));
  const insights: MoveInsight[] = [];
  const missed: MoveInsight[] = [];

  input.moves.forEach((move, index) => {
    const before = byFen.get(move.fenBefore);
    const after = byFen.get(move.fenAfter);
    const beforeValue = whiteValue(before);
    const afterValue = whiteValue(after);
    if (beforeValue === null || afterValue === null) return;
    const whiteMoved = move.fenBefore.split(/\s+/)[1] === 'w';
    const loss = whiteMoved ? beforeValue - afterValue : afterValue - beforeValue;
    const insight = createMoveInsight(index + 1, move.san, loss, before?.bestMove ?? null);
    if (!insight) return;
    insights.push(insight);
    if (!matchesRecommendation(move, before?.bestMove ?? null)) missed.push(insight);
  });

  const mistakes = insights.filter((item) => item.severity === 'blunder' || item.severity === 'mistake');
  const inaccuracies = insights.filter((item) => item.severity === 'inaccuracy');
  const criticalMoment = [...insights].sort((a, b) => Math.abs(b.evaluationChange) - Math.abs(a.evaluationChange))[0] ?? null;
  const summary = insights.length === 0
    ? 'No se detectaron cambios de evaluación relevantes en las posiciones analizadas.'
    : `Se detectaron ${insights.length} momentos de aprendizaje en ${input.moves.length} jugadas.`;

  return { mistakes, inaccuracies, missedOpportunities: missed, criticalMoment, summary };
}
