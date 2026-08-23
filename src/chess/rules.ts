import { colorOf, kingSquare, opposite, squareColor, typeOf } from './board';
import { applyMove, generatePseudoLegalMoves, isSquareAttacked } from './moves';
import type { Color, Move, Position, Square } from './types';

export function isInCheck(position: Position, color: Color = position.turn): boolean {
  return isSquareAttacked(position, kingSquare(position.board, color), opposite(color));
}

function castleTransitSquares(move: Move): readonly Square[] {
  if (move.castle === 'K') return [60, 61, 62];
  if (move.castle === 'Q') return [60, 59, 58];
  if (move.castle === 'k') return [4, 5, 6];
  if (move.castle === 'q') return [4, 3, 2];
  return [];
}

export function generateLegalMoves(position: Position, from?: Square): Move[] {
  const color = position.turn;
  const enemy = opposite(color);
  return generatePseudoLegalMoves(position, from).filter((move) => {
    if (move.castle && castleTransitSquares(move).some((square) => isSquareAttacked(position, square, enemy))) {
      return false;
    }
    const next = applyMove(position, move);
    return !isSquareAttacked(next, kingSquare(next.board, color), enemy);
  });
}

export function isCheckmate(position: Position): boolean {
  return isInCheck(position) && generateLegalMoves(position).length === 0;
}

export function isStalemate(position: Position): boolean {
  return !isInCheck(position) && generateLegalMoves(position).length === 0;
}

export function isInsufficientMaterial(position: Position): boolean {
  const nonKings = position.board
    .map((piece, square) => ({ piece, square }))
    .filter(({ piece }) => piece !== null && typeOf(piece) !== 'k');
  if (nonKings.length === 0) return true;
  if (nonKings.length === 1) {
    const piece = nonKings[0].piece;
    return piece !== null && (typeOf(piece) === 'b' || typeOf(piece) === 'n');
  }
  if (nonKings.every(({ piece }) => piece !== null && typeOf(piece) === 'b')) {
    return new Set(nonKings.map(({ square }) => squareColor(square))).size === 1;
  }
  return false;
}

export function perft(position: Position, depth: number): number {
  if (!Number.isInteger(depth) || depth < 0) throw new Error('Perft depth must be a non-negative integer');
  if (depth === 0) return 1;
  let nodes = 0;
  for (const move of generateLegalMoves(position)) nodes += perft(applyMove(position, move), depth - 1);
  return nodes;
}

export function materialByColor(position: Position, color: Color): readonly string[] {
  return position.board.filter((piece) => piece !== null && colorOf(piece) === color).map((piece) => typeOf(piece!));
}
