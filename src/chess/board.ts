import type { Color, Piece, PieceType, Square } from './types';

export const BOARD_SIZE = 64;
export const FILES = 'abcdefgh';

export function isSquare(value: number): value is Square {
  return Number.isInteger(value) && value >= 0 && value < BOARD_SIZE;
}

export function fileOf(square: Square): number {
  return square % 8;
}

export function rankOf(square: Square): number {
  return Math.floor(square / 8);
}

export function squareColor(square: Square): 0 | 1 {
  return ((fileOf(square) + rankOf(square)) % 2) as 0 | 1;
}

export function squareToAlgebraic(square: Square): string {
  if (!isSquare(square)) throw new Error(`Invalid square: ${square}`);
  return `${FILES[fileOf(square)]}${8 - rankOf(square)}`;
}

export function algebraicToSquare(value: string): Square {
  if (!/^[a-h][1-8]$/.test(value)) throw new Error(`Invalid algebraic square: ${value}`);
  return (8 - Number(value[1])) * 8 + FILES.indexOf(value[0]);
}

export function colorOf(piece: Piece): Color {
  return piece === piece.toUpperCase() ? 'w' : 'b';
}

export function typeOf(piece: Piece): PieceType {
  return piece.toLowerCase() as PieceType;
}

export function makePiece(type: PieceType, color: Color): Piece {
  return (color === 'w' ? type.toUpperCase() : type) as Piece;
}

export function opposite(color: Color): Color {
  return color === 'w' ? 'b' : 'w';
}

export function kingSquare(board: readonly (Piece | null)[], color: Color): Square {
  const square = board.indexOf(makePiece('k', color));
  if (!isSquare(square)) throw new Error(`Position has no ${color === 'w' ? 'white' : 'black'} king`);
  return square;
}
