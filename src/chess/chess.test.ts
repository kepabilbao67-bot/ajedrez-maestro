import { describe, expect, it } from 'vitest';

import { ChessGame, START_FEN, algebraicToSquare, applyMove, generateLegalMoves, isInCheck, isInsufficientMaterial, parseFen, perft, toFen } from './index';

describe('chess core', () => {
  it('creates the initial position with 20 legal moves', () => {
    const game = ChessGame.initial();
    expect(game.fen()).toBe(START_FEN);
    expect(game.legalMoves()).toHaveLength(20);
    expect(game.legalMoves('e2')).toHaveLength(2);
  });

  it('executes legal moves, alternates turns, and records SAN history', () => {
    const game = ChessGame.initial();
    expect(game.move({ from: 'e2', to: 'e4' })?.san).toBe('e4');
    expect(game.move({ from: 'e7', to: 'e5' })?.san).toBe('e5');
    expect(game.history()).toHaveLength(2);
    expect(game.getPosition().turn).toBe('w');
  });

  it('rejects blocked and out-of-turn moves', () => {
    const game = ChessGame.initial();
    expect(game.move({ from: 'a1', to: 'a3' })).toBeNull();
    expect(game.move({ from: 'e7', to: 'e5' })).toBeNull();
    expect(game.fen()).toBe(START_FEN);
  });

  it('detects check and forbids leaving the king in check', () => {
    const game = new ChessGame('4k3/8/8/8/8/8/4r3/4K2R w K - 0 1');
    expect(game.status().check).toBe(true);
    expect(game.move({ from: 'h1', to: 'h2' })).toBeNull();
    expect(isInCheck(game.getPosition())).toBe(true);
  });

  it('detects checkmate and SAN mate suffix', () => {
    const game = ChessGame.initial();
    game.move({ from: 'f2', to: 'f3' });
    game.move({ from: 'e7', to: 'e5' });
    game.move({ from: 'g2', to: 'g4' });
    expect(game.move({ from: 'd8', to: 'h4' })?.san).toBe('Qh4#');
    expect(game.status()).toMatchObject({ check: true, checkmate: true, gameOver: true, winner: 'b' });
  });

  it('detects stalemate', () => {
    const game = new ChessGame('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1');
    expect(game.status()).toMatchObject({ stalemate: true, draw: true, drawReason: 'stalemate' });
  });

  it('supports all promotion choices', () => {
    const game = new ChessGame('7k/P7/8/8/8/8/8/7K w - - 0 1');
    expect(game.legalMoves('a7').filter((move) => move.to === algebraicToSquare('a8'))).toHaveLength(4);
    expect(game.move({ from: 'a7', to: 'a8', promotion: 'n' })?.san).toBe('a8=N');
    expect(game.getPosition().board[algebraicToSquare('a8')]).toBe('N');
  });

  it('allows legal castling and moves the rook', () => {
    const game = new ChessGame('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
    expect(game.move({ from: 'e1', to: 'g1' })?.san).toBe('O-O');
    expect(game.getPosition().board[algebraicToSquare('f1')]).toBe('R');
    expect(game.getPosition().castling).toBe('kq');
  });

  it('forbids castling through check', () => {
    const game = new ChessGame('4kr2/8/8/8/8/8/8/4K2R w K - 0 1');
    expect(game.move({ from: 'e1', to: 'g1' })).toBeNull();
  });

  it('supports en passant and removes the captured pawn', () => {
    const game = new ChessGame('4k3/3p4/8/4P3/8/8/8/4K3 b - - 0 1');
    game.move({ from: 'd7', to: 'd5' });
    expect(game.move({ from: 'e5', to: 'd6' })?.san).toBe('exd6');
    expect(game.getPosition().board[algebraicToSquare('d5')]).toBeNull();
  });

  it('round-trips FEN exactly', () => {
    const fen = 'r3k2r/ppp2ppp/2n1bn2/3qp3/3P4/2N1BN2/PPP2PPP/R2QK2R w KQkq - 4 9';
    expect(toFen(parseFen(fen))).toBe(fen);
  });

  it('detects threefold repetition', () => {
    const game = ChessGame.initial();
    for (let cycle = 0; cycle < 2; cycle += 1) {
      game.move({ from: 'g1', to: 'f3' });
      game.move({ from: 'g8', to: 'f6' });
      game.move({ from: 'f3', to: 'g1' });
      game.move({ from: 'f6', to: 'g8' });
    }
    expect(game.status()).toMatchObject({ draw: true, drawReason: 'threefold-repetition' });
  });

  it('detects the fifty-move rule at 100 halfmoves', () => {
    const game = new ChessGame('4k2r/8/8/8/8/8/8/R3K3 w - - 100 51');
    expect(game.status()).toMatchObject({ draw: true, drawReason: 'fifty-move' });
  });

  it('detects only valid insufficient-material cases', () => {
    expect(isInsufficientMaterial(parseFen('4k3/8/8/8/8/8/8/4K3 w - - 0 1'))).toBe(true);
    expect(isInsufficientMaterial(parseFen('4k3/8/8/8/8/8/8/2B1K3 w - - 0 1'))).toBe(true);
    expect(isInsufficientMaterial(parseFen('4kb2/8/8/8/8/8/8/2B1K3 w - - 0 1'))).toBe(true);
    expect(isInsufficientMaterial(parseFen('2b1k3/8/8/8/8/8/8/2B1K3 w - - 0 1'))).toBe(false);
    expect(isInsufficientMaterial(parseFen('4k3/8/8/8/8/8/8/1NN1K3 w - - 0 1'))).toBe(false);
  });
});

describe('perft reference positions', () => {
  it('matches the standard initial-position counts', () => {
    const position = parseFen(START_FEN);
    expect(perft(position, 1)).toBe(20);
    expect(perft(position, 2)).toBe(400);
    expect(perft(position, 3)).toBe(8902);
  });

  it('matches the standard Kiwipete fixture at depths 1, 2, and 3', () => {
    const position = parseFen('r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1');
    expect(position.board[algebraicToSquare('e5')]).toBe('N');
    expect(position.board[algebraicToSquare('f3')]).toBe('Q');
    expect(position.board[algebraicToSquare('h3')]).toBe('p');
    expect(perft(position, 1)).toBe(48);
    expect(perft(position, 2)).toBe(2039);
    expect(perft(position, 3)).toBe(97862);
  });

  it('keeps pure move application independent from game state', () => {
    const position = parseFen(START_FEN);
    const move = generateLegalMoves(position).find((candidate) => candidate.from === algebraicToSquare('e2') && candidate.to === algebraicToSquare('e4'));
    expect(move).toBeDefined();
    expect(applyMove(position, move!).turn).toBe('b');
    expect(toFen(position)).toBe(START_FEN);
  });
});
