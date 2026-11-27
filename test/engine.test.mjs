// Tests del motor (js/engine.js) con node --test.
// perft = nº de posiciones alcanzables a N jugadas; se compara con los valores
// de referencia de https://www.chessprogramming.org/Perft_Results
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Chess, algToSq } from '../js/engine.js';

function perft(game, depth) {
  if (depth === 0) return 1;
  const moves = game.legalMoves();
  if (depth === 1) return moves.length;
  let nodes = 0;
  for (const m of moves) {
    const undo = game._makeMove(m);
    nodes += perft(game, depth - 1);
    game._undoMove(undo);
  }
  return nodes;
}

const POSITIONS = [
  { name: 'posición inicial', fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', counts: [20, 400, 8902, 197281] },
  { name: 'Kiwipete (enroques, al paso, clavadas)', fen: 'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1', counts: [48, 2039, 97862] },
  { name: 'posición 3 (finales, al paso con jaque)', fen: '8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1', counts: [14, 191, 2812, 43238] },
  { name: 'posición 4 (coronaciones)', fen: 'r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1', counts: [6, 264, 9467] },
  { name: 'posición 5', fen: 'rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8', counts: [44, 1486, 62379] },
];

for (const { name, fen, counts } of POSITIONS) {
  test(`perft: ${name}`, () => {
    const game = new Chess(fen);
    counts.forEach((expected, i) => {
      assert.equal(perft(game, i + 1), expected, `profundidad ${i + 1}`);
    });
    assert.equal(game.fen(), new Chess(fen).fen(), 'make/undo deja el tablero igual');
  });
}

test('FEN: cargar y exportar es estable', () => {
  const fen = 'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1';
  assert.equal(new Chess(fen).fen(), fen);
});

test('mate del pastor y fin de partida', () => {
  const g = new Chess();
  for (const [f, t] of [['e2', 'e4'], ['e7', 'e5'], ['f1', 'c4'], ['b8', 'c6'], ['d1', 'h5'], ['g8', 'f6'], ['h5', 'f7']]) {
    assert.ok(g.move({ from: algToSq(f), to: algToSq(t) }), `${f}-${t} debe ser legal`);
  }
  assert.equal(g.isCheckmate(), true);
  assert.equal(g.isGameOver(), true);
});

test('ahogado', () => {
  const g = new Chess('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1');
  assert.equal(g.isStalemate(), true);
  assert.equal(g.isCheckmate(), false);
});

test('rechaza jugadas ilegales y deshace', () => {
  const g = new Chess();
  assert.equal(g.move({ from: algToSq('e2'), to: algToSq('e5') }), null);
  const start = g.fen();
  g.move({ from: algToSq('g1'), to: algToSq('f3') });
  g.undo();
  assert.equal(g.fen(), start);
});
