import type { GameAnalysis } from './coach-types';

export interface PostGameSummary { bestMove: string; worstError: string; learning: string; accuracy: number; totalMoves: number; blunders: number; }
export function createPostGameSummary(analysis: GameAnalysis, totalMoves: number = 20): PostGameSummary {
  const critical = analysis.criticalMoment;
  const blunders = analysis.mistakes.length;
  const inaccuracies = analysis.inaccuracies.length;
  // A simple heuristic for accuracy: 100 - (blunders * 10) - (inaccuracies * 3)
  const accuracy = Math.max(10, 100 - (blunders * 10) - (inaccuracies * 3));
  
  return {
    bestMove: analysis.missedOpportunities[0]?.recommendedMove ? 'Había una jugada más precisa disponible.' : 'Tus jugadas mantuvieron el plan de la posición.',
    worstError: critical ? critical.explanation : 'No se detectó un error crítico.',
    learning: critical ? 'Antes de atacar, desarrolla tus piezas y revisa amenazas rivales.' : 'Mantén la coordinación de tus piezas y consolida tus ventajas.',
    accuracy,
    totalMoves,
    blunders,
  };
}
