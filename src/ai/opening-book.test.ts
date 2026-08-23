import { describe, expect, it } from 'vitest';
import { ChessGame, type MoveInput, type PromotionPiece } from '../chess';
import { getOpeningMove, OPENING_BOOK } from './opening-book';

function parseUciMove(uci: string): MoveInput {
  return {
    from: uci.slice(0, 2),
    to: uci.slice(2, 4),
    promotion: uci.length > 4 ? (uci[4] as PromotionPiece) : undefined,
  };
}

describe('Opening Book - Core API', () => {
  it('should return a valid move for the initial position', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const move = getOpeningMove(fen);
    expect(move).toBeDefined();
    expect(typeof move).toBe('string');
    expect(OPENING_BOOK[fen]).toContain(move);
  });

  it('should return null for an unknown position', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RN1QKBNR w KQkq - 0 1';
    const move = getOpeningMove(fen);
    expect(move).toBeNull();
  });
});

describe('Opening Book - Exhaustive Legal Move Validation in ChessGame', () => {
  it('every position and every move in OPENING_BOOK must be accepted as legal by ChessGame', () => {
    for (const [fen, moves] of Object.entries(OPENING_BOOK)) {
      expect(moves.length).toBeGreaterThan(0);
      for (const uciMove of moves) {
        const game = new ChessGame(fen);
        const moveInput = parseUciMove(uciMove);
        const record = game.move(moveInput);

        expect(record, `Expected move ${uciMove} in position "${fen}" to be legal`).not.toBeNull();
        expect(record?.fenBefore).toBe(fen);
        expect(record?.move).toBeDefined();
      }
    }
  });
});

describe('Opening Book - Representative Line Integrations with Real Move Sequence', () => {
  it('Position 1: Initial position', () => {
    const game = new ChessGame();
    const fen = game.fen();
    const move = getOpeningMove(fen);
    expect(move).not.toBeNull();
    expect(OPENING_BOOK[fen]).toContain(move);

    const record = game.move(parseUciMove(move!));
    expect(record).not.toBeNull();
  });

  it('Position 2: 1. e4', () => {
    const game = new ChessGame();
    game.move({ from: 'e2', to: 'e4' });
    const fen = game.fen();
    const move = getOpeningMove(fen);
    expect(move).not.toBeNull();
    expect(OPENING_BOOK[fen]).toContain(move);

    const record = game.move(parseUciMove(move!));
    expect(record).not.toBeNull();
  });

  it('Position 3: 1. d4', () => {
    const game = new ChessGame();
    game.move({ from: 'd2', to: 'd4' });
    const fen = game.fen();
    const move = getOpeningMove(fen);
    expect(move).not.toBeNull();
    expect(OPENING_BOOK[fen]).toContain(move);

    const record = game.move(parseUciMove(move!));
    expect(record).not.toBeNull();
  });

  it('Position 4: 1. e4 e5', () => {
    const game = new ChessGame();
    game.move({ from: 'e2', to: 'e4' });
    game.move({ from: 'e7', to: 'e5' });
    const fen = game.fen();
    const move = getOpeningMove(fen);
    expect(move).not.toBeNull();
    expect(OPENING_BOOK[fen]).toContain(move);

    const record = game.move(parseUciMove(move!));
    expect(record).not.toBeNull();
  });

  it('Position 5: 1. e4 c5', () => {
    const game = new ChessGame();
    game.move({ from: 'e2', to: 'e4' });
    game.move({ from: 'c7', to: 'c5' });
    const fen = game.fen();
    const move = getOpeningMove(fen);
    expect(move).not.toBeNull();
    expect(OPENING_BOOK[fen]).toContain(move);

    const record = game.move(parseUciMove(move!));
    expect(record).not.toBeNull();
  });

  it('Position 6: 1. d4 d5', () => {
    const game = new ChessGame();
    game.move({ from: 'd2', to: 'd4' });
    game.move({ from: 'd7', to: 'd5' });
    const fen = game.fen();
    const move = getOpeningMove(fen);
    expect(move).not.toBeNull();
    expect(OPENING_BOOK[fen]).toContain(move);

    const record = game.move(parseUciMove(move!));
    expect(record).not.toBeNull();
  });

  it('Position 7: 1. d4 Nf6', () => {
    const game = new ChessGame();
    game.move({ from: 'd2', to: 'd4' });
    game.move({ from: 'g8', to: 'f6' });
    const fen = game.fen();
    const move = getOpeningMove(fen);
    expect(move).not.toBeNull();
    expect(OPENING_BOOK[fen]).toContain(move);

    const record = game.move(parseUciMove(move!));
    expect(record).not.toBeNull();
  });

  it('Position 8: 1. e4 e5 2. Nf3', () => {
    const game = new ChessGame();
    game.move({ from: 'e2', to: 'e4' });
    game.move({ from: 'e7', to: 'e5' });
    game.move({ from: 'g1', to: 'f3' });
    const fen = game.fen();
    const move = getOpeningMove(fen);
    expect(move).not.toBeNull();
    expect(OPENING_BOOK[fen]).toContain(move);

    const record = game.move(parseUciMove(move!));
    expect(record).not.toBeNull();
  });

  it('Position 9: 1. e4 e5 2. Nf3 Nc6', () => {
    const game = new ChessGame();
    game.move({ from: 'e2', to: 'e4' });
    game.move({ from: 'e7', to: 'e5' });
    game.move({ from: 'g1', to: 'f3' });
    game.move({ from: 'b8', to: 'c6' });
    const fen = game.fen();
    const move = getOpeningMove(fen);
    expect(move).not.toBeNull();
    expect(OPENING_BOOK[fen]).toContain(move);

    const record = game.move(parseUciMove(move!));
    expect(record).not.toBeNull();
  });
});
