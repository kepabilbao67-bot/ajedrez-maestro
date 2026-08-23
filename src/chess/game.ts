import { algebraicToSquare, fileOf, squareToAlgebraic, typeOf } from './board';
import { parseFen, START_FEN, toFen } from './fen';
import { applyMove } from './moves';
import { generateLegalMoves, isCheckmate, isInCheck, isInsufficientMaterial, isStalemate } from './rules';
import type { DrawReason, GameStatus, Move, MoveInput, MoveRecord, Position, Square } from './types';

function repetitionKey(position: Position): string {
  const [placement, turn, castling] = toFen(position).split(' ');
  const hasLegalEnPassant = position.enPassant !== null && generateLegalMoves(position).some((move) => move.enPassant);
  const enPassant = hasLegalEnPassant ? squareToAlgebraic(position.enPassant!) : '-';
  return `${placement} ${turn} ${castling} ${enPassant}`;
}

function moveToSan(position: Position, move: Move): string {
  if (move.castle === 'K' || move.castle === 'k') return withCheckSuffix(position, move, 'O-O');
  if (move.castle === 'Q' || move.castle === 'q') return withCheckSuffix(position, move, 'O-O-O');
  const piece = position.board[move.from];
  if (piece === null) throw new Error('Cannot format a move from an empty square');
  const type = typeOf(piece);
  let san = '';
  if (type === 'p') {
    if (move.capture) san += `${'abcdefgh'[fileOf(move.from)]}x`;
  } else {
    san += type.toUpperCase();
    const alternatives = generateLegalMoves(position).filter((candidate) =>
      candidate.from !== move.from && candidate.to === move.to &&
      position.board[candidate.from] !== null && typeOf(position.board[candidate.from]!) === type);
    if (alternatives.length > 0) {
      const sameFile = alternatives.some((candidate) => fileOf(candidate.from) === fileOf(move.from));
      const sameRank = alternatives.some((candidate) => Math.floor(candidate.from / 8) === Math.floor(move.from / 8));
      san += !sameFile ? 'abcdefgh'[fileOf(move.from)] : !sameRank ? String(8 - Math.floor(move.from / 8)) : squareToAlgebraic(move.from);
    }
    if (move.capture) san += 'x';
  }
  san += squareToAlgebraic(move.to);
  if (move.promotion) san += `=${move.promotion.toUpperCase()}`;
  return withCheckSuffix(position, move, san);
}

function withCheckSuffix(position: Position, move: Move, san: string): string {
  const next = applyMove(position, move);
  if (!isInCheck(next)) return san;
  return `${san}${isCheckmate(next) ? '#' : '+'}`;
}

function inputSquare(value: Square | string): Square {
  return typeof value === 'string' ? algebraicToSquare(value) : value;
}

export class ChessGame {
  private position: Position;
  private readonly records: MoveRecord[] = [];
  private readonly repetitions = new Map<string, number>();

  constructor(fen: string = START_FEN) {
    this.position = parseFen(fen);
    this.recordPosition();
  }

  static initial(): ChessGame {
    return new ChessGame();
  }

  getPosition(): Position {
    return { ...this.position, board: [...this.position.board] };
  }

  fen(): string {
    return toFen(this.position);
  }

  history(): readonly MoveRecord[] {
    return this.records.map((record) => ({ ...record, move: { ...record.move } }));
  }

  legalMoves(from?: Square | string): readonly Move[] {
    const square = from === undefined ? undefined : inputSquare(from);
    return generateLegalMoves(this.position, square);
  }

  move(input: MoveInput): MoveRecord | null {
    if (this.status().gameOver) return null;
    const from = inputSquare(input.from);
    const to = inputSquare(input.to);
    const move = generateLegalMoves(this.position, from).find((candidate) =>
      candidate.to === to && (input.promotion ? candidate.promotion === input.promotion : candidate.promotion === undefined || candidate.promotion === 'q'));
    if (!move) return null;
    const fenBefore = this.fen();
    const san = moveToSan(this.position, move);
    this.position = applyMove(this.position, move);
    const record = { move, san, fenBefore, fenAfter: this.fen() };
    this.records.push(record);
    this.recordPosition();
    return { ...record, move: { ...record.move } };
  }

  status(): GameStatus {
    const check = isInCheck(this.position);
    const checkmate = check && isCheckmate(this.position);
    const stalemate = !check && isStalemate(this.position);
    let drawReason: DrawReason | null = null;
    if (stalemate) drawReason = 'stalemate';
    else if (this.position.halfmoveClock >= 100) drawReason = 'fifty-move';
    else if ((this.repetitions.get(repetitionKey(this.position)) ?? 0) >= 3) drawReason = 'threefold-repetition';
    else if (isInsufficientMaterial(this.position)) drawReason = 'insufficient-material';
    const draw = drawReason !== null;
    return {
      check,
      checkmate,
      stalemate,
      draw,
      drawReason,
      gameOver: checkmate || draw,
      winner: checkmate ? (this.position.turn === 'w' ? 'b' : 'w') : null,
    };
  }

  private recordPosition(): void {
    const key = repetitionKey(this.position);
    this.repetitions.set(key, (this.repetitions.get(key) ?? 0) + 1);
  }
}
