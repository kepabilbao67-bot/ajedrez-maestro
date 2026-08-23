import { colorOf, fileOf, isSquare, makePiece, opposite, rankOf, typeOf } from './board';
import type { CastleSide, Color, Move, Piece, Position, PromotionPiece, Square } from './types';

const KNIGHT_STEPS = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]] as const;
const KING_STEPS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]] as const;
const BISHOP_STEPS = [[-1, -1], [-1, 1], [1, -1], [1, 1]] as const;
const ROOK_STEPS = [[-1, 0], [0, -1], [0, 1], [1, 0]] as const;
const PROMOTIONS: readonly PromotionPiece[] = ['q', 'r', 'b', 'n'];

function squareAt(rank: number, file: number): Square | null {
  const square = rank * 8 + file;
  return rank >= 0 && rank < 8 && file >= 0 && file < 8 && isSquare(square) ? square : null;
}

function canCapture(piece: Piece | null, color: Color): boolean {
  return piece !== null && colorOf(piece) !== color && typeOf(piece) !== 'k';
}

function pawnMoves(position: Position, from: Square, color: Color): Move[] {
  const moves: Move[] = [];
  const direction = color === 'w' ? -1 : 1;
  const startRank = color === 'w' ? 6 : 1;
  const promotionRank = color === 'w' ? 0 : 7;
  const rank = rankOf(from);
  const file = fileOf(from);
  const one = squareAt(rank + direction, file);
  if (one !== null && position.board[one] === null) {
    if (rankOf(one) === promotionRank) {
      for (const promotion of PROMOTIONS) moves.push({ from, to: one, promotion });
    } else {
      moves.push({ from, to: one });
      const two = squareAt(rank + direction * 2, file);
      if (rank === startRank && two !== null && position.board[two] === null) {
        moves.push({ from, to: two, doublePawn: true });
      }
    }
  }
  for (const fileDelta of [-1, 1]) {
    const to = squareAt(rank + direction, file + fileDelta);
    if (to === null) continue;
    const target = position.board[to];
    if (canCapture(target, color)) {
      if (rankOf(to) === promotionRank) {
        for (const promotion of PROMOTIONS) moves.push({ from, to, promotion, capture: true });
      } else moves.push({ from, to, capture: true });
    } else if (to === position.enPassant) {
      const capturedSquare = to + (color === 'w' ? 8 : -8);
      if (position.board[capturedSquare] === makePiece('p', opposite(color))) {
        moves.push({ from, to, capture: true, enPassant: true });
      }
    }
  }
  return moves;
}

function jumpingMoves(position: Position, from: Square, color: Color, steps: readonly (readonly [number, number])[]): Move[] {
  const moves: Move[] = [];
  for (const [rankDelta, fileDelta] of steps) {
    const to = squareAt(rankOf(from) + rankDelta, fileOf(from) + fileDelta);
    if (to === null) continue;
    const target = position.board[to];
    if (target === null) moves.push({ from, to });
    else if (canCapture(target, color)) moves.push({ from, to, capture: true });
  }
  return moves;
}

function slidingMoves(position: Position, from: Square, color: Color, steps: readonly (readonly [number, number])[]): Move[] {
  const moves: Move[] = [];
  for (const [rankDelta, fileDelta] of steps) {
    let rank = rankOf(from) + rankDelta;
    let file = fileOf(from) + fileDelta;
    while (true) {
      const to = squareAt(rank, file);
      if (to === null) break;
      const target = position.board[to];
      if (target === null) moves.push({ from, to });
      else {
        if (canCapture(target, color)) moves.push({ from, to, capture: true });
        break;
      }
      rank += rankDelta;
      file += fileDelta;
    }
  }
  return moves;
}

function castlingMoves(position: Position, from: Square, color: Color): Move[] {
  const candidates: readonly { right: CastleSide; king: Square; rook: Square; empty: readonly Square[]; to: Square }[] = color === 'w'
    ? [
        { right: 'K', king: 60, rook: 63, empty: [61, 62], to: 62 },
        { right: 'Q', king: 60, rook: 56, empty: [59, 58, 57], to: 58 },
      ]
    : [
        { right: 'k', king: 4, rook: 7, empty: [5, 6], to: 6 },
        { right: 'q', king: 4, rook: 0, empty: [3, 2, 1], to: 2 },
      ];
  return candidates
    .filter(({ right, king, rook, empty }) =>
      from === king && position.castling.includes(right) &&
      position.board[rook] === makePiece('r', color) && empty.every((square) => position.board[square] === null))
    .map(({ right, to }) => ({ from, to, castle: right }));
}

export function generatePseudoLegalMoves(position: Position, from?: Square): Move[] {
  const moves: Move[] = [];
  const first = from ?? 0;
  const last = from ?? 63;
  for (let square = first; square <= last; square += 1) {
    const piece = position.board[square];
    if (piece === null || colorOf(piece) !== position.turn) continue;
    const color = colorOf(piece);
    switch (typeOf(piece)) {
      case 'p': moves.push(...pawnMoves(position, square, color)); break;
      case 'n': moves.push(...jumpingMoves(position, square, color, KNIGHT_STEPS)); break;
      case 'b': moves.push(...slidingMoves(position, square, color, BISHOP_STEPS)); break;
      case 'r': moves.push(...slidingMoves(position, square, color, ROOK_STEPS)); break;
      case 'q': moves.push(...slidingMoves(position, square, color, [...BISHOP_STEPS, ...ROOK_STEPS])); break;
      case 'k':
        moves.push(...jumpingMoves(position, square, color, KING_STEPS));
        moves.push(...castlingMoves(position, square, color));
        break;
    }
  }
  return moves;
}

export function isSquareAttacked(position: Position, square: Square, byColor: Color): boolean {
  const board = position.board;
  const pawnSourceRank = rankOf(square) + (byColor === 'w' ? 1 : -1);
  for (const fileDelta of [-1, 1]) {
    const source = squareAt(pawnSourceRank, fileOf(square) + fileDelta);
    if (source !== null && board[source] === makePiece('p', byColor)) return true;
  }
  for (const [rankDelta, fileDelta] of KNIGHT_STEPS) {
    const source = squareAt(rankOf(square) + rankDelta, fileOf(square) + fileDelta);
    if (source !== null && board[source] === makePiece('n', byColor)) return true;
  }
  for (const [rankDelta, fileDelta] of KING_STEPS) {
    const source = squareAt(rankOf(square) + rankDelta, fileOf(square) + fileDelta);
    if (source !== null && board[source] === makePiece('k', byColor)) return true;
  }
  const attackedBySlider = (steps: readonly (readonly [number, number])[], types: readonly string[]): boolean => {
    for (const [rankDelta, fileDelta] of steps) {
      let rank = rankOf(square) + rankDelta;
      let file = fileOf(square) + fileDelta;
      while (true) {
        const source = squareAt(rank, file);
        if (source === null) break;
        const piece = board[source];
        if (piece !== null) {
          if (colorOf(piece) === byColor && types.includes(typeOf(piece))) return true;
          break;
        }
        rank += rankDelta;
        file += fileDelta;
      }
    }
    return false;
  };
  return attackedBySlider(BISHOP_STEPS, ['b', 'q']) || attackedBySlider(ROOK_STEPS, ['r', 'q']);
}

export function applyMove(position: Position, move: Move): Position {
  const board = [...position.board];
  const piece = board[move.from];
  if (piece === null) throw new Error('Cannot move from an empty square');
  const color = colorOf(piece);
  const capturedPiece = move.enPassant
    ? board[move.to + (color === 'w' ? 8 : -8)]
    : board[move.to];
  board[move.from] = null;
  board[move.to] = move.promotion ? makePiece(move.promotion, color) : piece;
  if (move.enPassant) board[move.to + (color === 'w' ? 8 : -8)] = null;
  if (move.castle) {
    const rookFrom = move.castle === 'K' ? 63 : move.castle === 'Q' ? 56 : move.castle === 'k' ? 7 : 0;
    const rookTo = move.castle === 'K' ? 61 : move.castle === 'Q' ? 59 : move.castle === 'k' ? 5 : 3;
    board[rookTo] = board[rookFrom];
    board[rookFrom] = null;
  }

  let castling = position.castling;
  if (typeOf(piece) === 'k') castling = castling.replace(color === 'w' ? /[KQ]/g : /[kq]/g, '');
  const rightsBySquare: Readonly<Record<number, CastleSide>> = { 0: 'q', 7: 'k', 56: 'Q', 63: 'K' };
  for (const square of [move.from, move.to]) {
    const right = rightsBySquare[square];
    if (right) castling = castling.replace(right, '');
  }

  return {
    board,
    turn: opposite(position.turn),
    castling,
    enPassant: move.doublePawn ? (move.from + move.to) / 2 : null,
    halfmoveClock: typeOf(piece) === 'p' || capturedPiece !== null ? 0 : position.halfmoveClock + 1,
    fullmoveNumber: position.fullmoveNumber + (position.turn === 'b' ? 1 : 0),
  };
}
