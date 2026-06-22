/*
 * ai-worker.js — Web Worker con la IA de ajedrez.
 * Usa búsqueda minimax con poda alfa-beta, ordenación de jugadas,
 * tablas de posición (piece-square tables) y quiescencia básica.
 *
 * Recibe: { fen, level } y responde: { bestMove, score }.
 * level 1..6 controla la profundidad y el "ruido" (errores intencionados
 * para que los principiantes puedan ganar).
 */
import { Chess, colorOf, WHITE, BLACK, fileOf, rankOf } from './engine.js';

const PIECE_VALUE = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

// Tablas de posición (perspectiva de las blancas, fila 0 = a8).
const PST = {
  p: [
     0,  0,  0,  0,  0,  0,  0,  0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
     5,  5, 10, 25, 25, 10,  5,  5,
     0,  0,  0, 20, 20,  0,  0,  0,
     5, -5,-10,  0,  0,-10, -5,  5,
     5, 10, 10,-20,-20, 10, 10,  5,
     0,  0,  0,  0,  0,  0,  0,  0,
  ],
  n: [
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20,  0,  0,  0,  0,-20,-40,
    -30,  0, 10, 15, 15, 10,  0,-30,
    -30,  5, 15, 20, 20, 15,  5,-30,
    -30,  0, 15, 20, 20, 15,  0,-30,
    -30,  5, 10, 15, 15, 10,  5,-30,
    -40,-20,  0,  5,  5,  0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50,
  ],
  b: [
    -20,-10,-10,-10,-10,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5, 10, 10,  5,  0,-10,
    -10,  5,  5, 10, 10,  5,  5,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10, 10, 10, 10, 10, 10, 10,-10,
    -10,  5,  0,  0,  0,  0,  5,-10,
    -20,-10,-10,-10,-10,-10,-10,-20,
  ],
  r: [
     0,  0,  0,  0,  0,  0,  0,  0,
     5, 10, 10, 10, 10, 10, 10,  5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
     0,  0,  0,  5,  5,  0,  0,  0,
  ],
  q: [
    -20,-10,-10, -5, -5,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5,  5,  5,  5,  0,-10,
     -5,  0,  5,  5,  5,  5,  0, -5,
      0,  0,  5,  5,  5,  5,  0, -5,
    -10,  5,  5,  5,  5,  5,  0,-10,
    -10,  0,  5,  0,  0,  0,  0,-10,
    -20,-10,-10, -5, -5,-10,-10,-20,
  ],
  k: [
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -20,-30,-30,-40,-40,-30,-30,-20,
    -10,-20,-20,-20,-20,-20,-20,-10,
     20, 20,  0,  0,  0,  0, 20, 20,
     20, 30, 10,  0,  0, 10, 30, 20,
  ],
};

function mirror(sq) { return (7 - rankOf(sq)) * 8 + fileOf(sq); }

// Evalúa la posición desde la perspectiva del bando que mueve.
function evaluate(game) {
  let score = 0;
  for (let sq = 0; sq < 64; sq++) {
    const p = game.board[sq];
    if (!p) continue;
    const type = p.toLowerCase();
    const val = PIECE_VALUE[type] + (PST[type] ? (colorOf(p) === WHITE ? PST[type][sq] : PST[type][mirror(sq)]) : 0);
    score += colorOf(p) === WHITE ? val : -val;
  }
  return game.turn === WHITE ? score : -score;
}

function scoreMove(game, m) {
  let s = 0;
  if (m.capture) {
    const victim = game.board[m.to] || (m.enpassant ? 'p' : '');
    const attacker = game.board[m.from];
    s += 10 * (PIECE_VALUE[(victim || 'p').toLowerCase()] || 100) - (PIECE_VALUE[attacker.toLowerCase()] || 0);
  }
  if (m.promotion) s += PIECE_VALUE[m.promotion] || 0;
  return s;
}

function quiesce(game, alpha, beta, depthLeft) {
  const standPat = evaluate(game);
  if (standPat >= beta) return beta;
  if (alpha < standPat) alpha = standPat;
  if (depthLeft <= 0) return alpha;
  const caps = game.legalMoves(game.turn).filter(m => m.capture || m.promotion);
  caps.sort((a, b) => scoreMove(game, b) - scoreMove(game, a));
  for (const m of caps) {
    const u = game._makeMove(m);
    const val = -quiesce(game, -beta, -alpha, depthLeft - 1);
    game._undoMove(u);
    if (val >= beta) return beta;
    if (val > alpha) alpha = val;
  }
  return alpha;
}

function negamax(game, depth, alpha, beta) {
  if (depth <= 0) return quiesce(game, alpha, beta, 4);
  const moves = game.legalMoves(game.turn);
  if (moves.length === 0) {
    if (game.inCheck(game.turn)) return -100000 + (10 - depth); // mate: prefiere los más cercanos
    return 0; // ahogado
  }
  moves.sort((a, b) => scoreMove(game, b) - scoreMove(game, a));
  let best = -Infinity;
  for (const m of moves) {
    const u = game._makeMove(m);
    const val = -negamax(game, depth - 1, -beta, -alpha);
    game._undoMove(u);
    if (val > best) best = val;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }
  return best;
}

// Devuelve la mejor jugada con su valoración. `randomness` añade variedad.
function search(game, depth, randomness = 0) {
  const moves = game.legalMoves(game.turn);
  if (moves.length === 0) return null;
  moves.sort((a, b) => scoreMove(game, b) - scoreMove(game, a));
  let best = null;
  let bestScore = -Infinity;
  const scored = [];
  let alpha = -Infinity;
  const beta = Infinity;
  for (const m of moves) {
    const u = game._makeMove(m);
    const val = -negamax(game, depth - 1, -beta, -alpha);
    game._undoMove(u);
    scored.push({ move: m, score: val });
    if (val > bestScore) { bestScore = val; best = m; }
    if (val > alpha) alpha = val;
  }
  // Con "ruido" (niveles fáciles) se elige a veces una jugada algo peor.
  if (randomness > 0) {
    const threshold = bestScore - randomness;
    const candidates = scored.filter(s => s.score >= threshold);
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    return { bestMove: pick.move, score: pick.score };
  }
  return { bestMove: best, score: bestScore };
}

const LEVELS = {
  1: { depth: 1, randomness: 250 },  // Principiante
  2: { depth: 2, randomness: 150 },  // Fácil
  3: { depth: 2, randomness: 50 },   // Medio
  4: { depth: 3, randomness: 0 },    // Avanzado
  5: { depth: 4, randomness: 0 },    // Difícil
  6: { depth: 5, randomness: 0 },    // Experto
};

self.onmessage = (e) => {
  const { fen, level, hint } = e.data;
  const game = new Chess(fen);
  const cfg = LEVELS[level] || LEVELS[3];
  // Las pistas siempre buscan la MEJOR jugada (sin ruido) y con algo más de profundidad.
  const depth = hint ? Math.max(cfg.depth, 3) : cfg.depth;
  const randomness = hint ? 0 : cfg.randomness;
  const result = search(game, depth, randomness);
  self.postMessage(result || { bestMove: null, score: 0 });
};
