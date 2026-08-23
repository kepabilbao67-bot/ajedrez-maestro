import { BOARD_SIZE, algebraicToSquare, isSquare, squareToAlgebraic } from './board';
import type { Color, Piece, Position } from './types';

export const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const PIECES = /^[prnbqkPRNBQK]$/;

export function parseFen(fen: string): Position {
  const fields = fen.trim().split(/\s+/);
  if (fields.length !== 6) throw new Error('FEN must contain six fields');
  const [placement, turnField, castlingField, enPassantField, halfmoveField, fullmoveField] = fields;
  const ranks = placement.split('/');
  if (ranks.length !== 8) throw new Error('FEN must contain eight ranks');

  const board: (Piece | null)[] = [];
  for (const rank of ranks) {
    let width = 0;
    for (const character of rank) {
      if (/^[1-8]$/.test(character)) {
        const empty = Number(character);
        width += empty;
        board.push(...Array<null>(empty).fill(null));
      } else if (PIECES.test(character)) {
        width += 1;
        board.push(character as Piece);
      } else {
        throw new Error(`Invalid FEN piece: ${character}`);
      }
    }
    if (width !== 8) throw new Error('Every FEN rank must contain eight squares');
  }
  if (board.length !== BOARD_SIZE) throw new Error('FEN board must contain 64 squares');
  if (board.filter((piece) => piece === 'K').length !== 1 || board.filter((piece) => piece === 'k').length !== 1) {
    throw new Error('FEN must contain exactly one king of each color');
  }

  if (turnField !== 'w' && turnField !== 'b') throw new Error('Invalid active color');
  const castling = castlingField === '-' ? '' : castlingField;
  if (!/^(K?Q?k?q?)$/.test(castling)) throw new Error('Invalid castling rights');
  const enPassant = enPassantField === '-' ? null : algebraicToSquare(enPassantField);
  if (enPassant !== null && ![2, 5].includes(Math.floor(enPassant / 8))) {
    throw new Error('Invalid en passant target rank');
  }
  const halfmoveClock = Number(halfmoveField);
  const fullmoveNumber = Number(fullmoveField);
  if (!Number.isInteger(halfmoveClock) || halfmoveClock < 0) throw new Error('Invalid halfmove clock');
  if (!Number.isInteger(fullmoveNumber) || fullmoveNumber < 1) throw new Error('Invalid fullmove number');

  return {
    board,
    turn: turnField as Color,
    castling,
    enPassant,
    halfmoveClock,
    fullmoveNumber,
  };
}

export function toFen(position: Position): string {
  if (position.board.length !== BOARD_SIZE) throw new Error('Position board must contain 64 squares');
  const ranks: string[] = [];
  for (let rank = 0; rank < 8; rank += 1) {
    let output = '';
    let empty = 0;
    for (let file = 0; file < 8; file += 1) {
      const piece = position.board[rank * 8 + file];
      if (piece === null) empty += 1;
      else {
        if (empty > 0) output += String(empty);
        empty = 0;
        output += piece;
      }
    }
    if (empty > 0) output += String(empty);
    ranks.push(output);
  }
  const enPassant = position.enPassant !== null && isSquare(position.enPassant)
    ? squareToAlgebraic(position.enPassant)
    : '-';
  return `${ranks.join('/')} ${position.turn} ${position.castling || '-'} ${enPassant} ${position.halfmoveClock} ${position.fullmoveNumber}`;
}
