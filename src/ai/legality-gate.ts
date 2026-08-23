import { ChessGame, algebraicToSquare, type Move, type MoveRecord } from '../chess';

import { AiIllegalMoveError } from './errors';
import type { AiMove } from './types';

export function resolveLegalAiMove(game: ChessGame, proposal: AiMove): Move | null {
  try {
    const from = algebraicToSquare(proposal.from);
    const to = algebraicToSquare(proposal.to);
    return game.legalMoves(from).find((move) =>
      move.to === to && move.promotion === proposal.promotion) ?? null;
  } catch {
    return null;
  }
}

export function applyValidatedAiMove(game: ChessGame, proposal: AiMove): MoveRecord {
  const legal = resolveLegalAiMove(game, proposal);
  if (!legal) throw new AiIllegalMoveError();
  const record = game.move({ from: legal.from, to: legal.to, promotion: legal.promotion });
  if (!record) throw new AiIllegalMoveError('ChessGame rechazó la propuesta previamente validada');
  return record;
}
