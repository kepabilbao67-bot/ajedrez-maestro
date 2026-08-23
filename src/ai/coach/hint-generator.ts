import { ChessGame, squareToAlgebraic } from '../../chess';
import { resolveLegalAiMove } from '../legality-gate';
import type { AiMove } from '../types';
import type { CoachHint, CoachHintLevel } from './coach-types';

export function generateHint(game: ChessGame, level: CoachHintLevel, recommendation: AiMove | null): CoachHint {
  if (game.status().gameOver) {
    return { level, available: false, message: 'La partida ha terminado. Inicia una nueva para pedir una pista.', recommendedMove: null };
  }
  const legalMove = recommendation ? resolveLegalAiMove(game, recommendation) : null;
  if (!legalMove) {
    return { level, available: false, message: 'Todavía no hay una recomendación legal disponible.', recommendedMove: null };
  }
  if (level === 1) {
    return { level, available: true, message: 'Busca una pieza activa y revisa qué amenazas puedes crear antes de mover.', recommendedMove: null };
  }
  if (level === 2) {
    return { level, available: true, message: `El plan es mejorar la actividad hacia ${squareToAlgebraic(legalMove.to)} sin descuidar tu rey.`, recommendedMove: null };
  }
  const validatedRecommendation: AiMove = {
    from: squareToAlgebraic(legalMove.from),
    to: squareToAlgebraic(legalMove.to),
    ...(legalMove.promotion ? { promotion: legalMove.promotion } : {}),
  };
  return { level, available: true, message: `Jugada recomendada: ${validatedRecommendation.from}-${validatedRecommendation.to}.`, recommendedMove: validatedRecommendation };
}
