import type { GameAnalysis, MoveInsight } from './coach-types';

export interface CoachExplanation {
  readonly kind: 'opening' | 'error' | 'threat' | 'improvement';
  readonly message: string;
}

export function explainOpening(moveCount: number): CoachExplanation {
  return { kind: 'opening', message: moveCount < 8 ? 'En la apertura, desarrolla piezas y protege a tu rey antes de atacar.' : 'La apertura ya avanza: conecta tus torres y revisa el control del centro.' };
}

export function explainError(insight: MoveInsight | null): CoachExplanation {
  return { kind: 'error', message: insight ? `En la jugada ${insight.moveNumber}, ${insight.explanation}` : 'No hay un error crítico marcado en este momento.' };
}

export function explainThreat(inCheck: boolean): CoachExplanation {
  return { kind: 'threat', message: inCheck ? 'Tu rey está expuesto: responde al jaque antes de continuar tu plan.' : 'Antes de mover, revisa piezas sin defender y posibles amenazas dobles.' };
}

export function recommendImprovement(analysis: GameAnalysis): CoachExplanation {
  const focus = analysis.criticalMoment?.explanation ?? 'mantener tus piezas coordinadas y revisar amenazas rivales';
  return { kind: 'improvement', message: `Siguiente mejora: ${focus}` };
}

/** Local conversation shape reserved for a future external chat transport. */
export interface CoachConversationMessage {
  readonly role: 'coach' | 'player';
  readonly content: string;
  readonly createdAt: string;
}
