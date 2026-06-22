/*
 * engine.js — Motor de ajedrez completo y sin dependencias.
 * Implementa reglas, generación de jugadas legales, enroque, captura al paso,
 * coronación, detección de jaque / jaque mate / ahogado y tablas.
 *
 * Representación del tablero: array de 64 casillas (índice 0 = a8 ... 63 = h1).
 * Las piezas se representan como letras: mayúsculas = blancas, minúsculas = negras.
 *   p/P peón, n/N caballo, b/B alfil, r/R torre, q/Q dama, k/K rey.
 */

export const WHITE = 'w';
export const BLACK = 'b';

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

// Direcciones de desplazamiento por tipo de pieza (sobre array 8x8).
const KNIGHT_OFFSETS = [-17, -15, -10, -6, 6, 10, 15, 17];
const KING_OFFSETS = [-9, -8, -7, -1, 1, 7, 8, 9];
const BISHOP_DIRS = [-9, -7, 7, 9];
const ROOK_DIRS = [-8, -1, 1, 8];

function fileOf(sq) { return sq % 8; }
function rankOf(sq) { return Math.floor(sq / 8); }

// Comprueba que un salto no "cruce" el borde del tablero.
function onBoardStep(from, to, maxFileDiff) {
  if (to < 0 || to > 63) return false;
  const fileDiff = Math.abs(fileOf(from) - fileOf(to));
  return fileDiff <= maxFileDiff;
}

export function isWhitePiece(p) { return p && p === p.toUpperCase(); }
export function colorOf(p) { return isWhitePiece(p) ? WHITE : BLACK; }

export class Chess {
  constructor(fen = START_FEN) {
    this.loadFen(fen);
  }

  loadFen(fen) {
    const parts = fen.trim().split(/\s+/);
    const [placement, turn, castling, ep, half, full] = parts;
    this.board = new Array(64).fill('');
    let sq = 0;
    for (const ch of placement) {
      if (ch === '/') continue;
      if (/\d/.test(ch)) { sq += parseInt(ch, 10); }
      else { this.board[sq] = ch; sq++; }
    }
    this.turn = turn || 'w';
    this.castling = castling && castling !== '-' ? castling : '';
    this.epSquare = ep && ep !== '-' ? algToSq(ep) : -1;
    this.halfmoves = parseInt(half || '0', 10);
    this.fullmoves = parseInt(full || '1', 10);
    this.history = [];
  }

  fen() {
    let placement = '';
    for (let r = 0; r < 8; r++) {
      let empty = 0;
      for (let f = 0; f < 8; f++) {
        const p = this.board[r * 8 + f];
        if (!p) { empty++; }
        else {
          if (empty) { placement += empty; empty = 0; }
          placement += p;
        }
      }
      if (empty) placement += empty;
      if (r < 7) placement += '/';
    }
    const ep = this.epSquare >= 0 ? sqToAlg(this.epSquare) : '-';
    const castling = this.castling || '-';
    return `${placement} ${this.turn} ${castling} ${ep} ${this.halfmoves} ${this.fullmoves}`;
  }

  clone() { return new Chess(this.fen()); }

  pieceAt(sq) { return this.board[sq]; }

  kingSquare(color) {
    const k = color === WHITE ? 'K' : 'k';
    return this.board.indexOf(k);
  }

  // ¿La casilla `sq` está atacada por el bando `byColor`?
  isAttacked(sq, byColor) {
    const board = this.board;
    // Peones
    const pawnDir = byColor === WHITE ? 1 : -1; // dónde está el peón respecto a sq
    for (const df of [-1, 1]) {
      const f = fileOf(sq) + df;
      const r = rankOf(sq) + pawnDir;
      if (f >= 0 && f < 8 && r >= 0 && r < 8) {
        const from = r * 8 + f;
        const p = board[from];
        if (p && colorOf(p) === byColor && p.toLowerCase() === 'p') return true;
      }
    }
    // Caballos
    for (const off of KNIGHT_OFFSETS) {
      const to = sq + off;
      if (onBoardStep(sq, to, 2)) {
        const p = board[to];
        if (p && colorOf(p) === byColor && p.toLowerCase() === 'n') return true;
      }
    }
    // Rey
    for (const off of KING_OFFSETS) {
      const to = sq + off;
      if (onBoardStep(sq, to, 1)) {
        const p = board[to];
        if (p && colorOf(p) === byColor && p.toLowerCase() === 'k') return true;
      }
    }
    // Deslizantes: alfil/dama (diagonales) y torre/dama (líneas)
    const checkSliding = (dirs, types) => {
      for (const dir of dirs) {
        let to = sq;
        while (true) {
          const prev = to;
          to += dir;
          if (to < 0 || to > 63) break;
          if (Math.abs(fileOf(prev) - fileOf(to)) > 1) break; // cruzó borde
          const p = board[to];
          if (p) {
            if (colorOf(p) === byColor && types.includes(p.toLowerCase())) return true;
            break;
          }
        }
      }
      return false;
    };
    if (checkSliding(BISHOP_DIRS, ['b', 'q'])) return true;
    if (checkSliding(ROOK_DIRS, ['r', 'q'])) return true;
    return false;
  }

  inCheck(color = this.turn) {
    const ks = this.kingSquare(color);
    if (ks < 0) return false;
    return this.isAttacked(ks, color === WHITE ? BLACK : WHITE);
  }

  // Genera pseudo-movimientos (sin filtrar jaques) para una casilla.
  _pseudoMovesFrom(sq) {
    const moves = [];
    const p = this.board[sq];
    if (!p) return moves;
    const color = colorOf(p);
    const type = p.toLowerCase();
    const add = (to, opts = {}) => moves.push({ from: sq, to, ...opts });

    if (type === 'p') {
      const dir = color === WHITE ? -8 : 8;
      const startRank = color === WHITE ? 6 : 1;
      const promoRank = color === WHITE ? 0 : 7;
      const one = sq + dir;
      if (one >= 0 && one < 64 && !this.board[one]) {
        if (rankOf(one) === promoRank) {
          for (const pr of ['q', 'r', 'b', 'n']) add(one, { promotion: pr });
        } else add(one);
        const two = sq + dir * 2;
        if (rankOf(sq) === startRank && !this.board[two]) add(two, { double: true });
      }
      for (const df of [-1, 1]) {
        const f = fileOf(sq) + df;
        if (f < 0 || f > 7) continue;
        const to = sq + dir + df;
        if (to < 0 || to > 63) continue;
        const target = this.board[to];
        if (target && colorOf(target) !== color) {
          if (rankOf(to) === promoRank) {
            for (const pr of ['q', 'r', 'b', 'n']) add(to, { promotion: pr, capture: true });
          } else add(to, { capture: true });
        } else if (to === this.epSquare) {
          add(to, { enpassant: true, capture: true });
        }
      }
    } else if (type === 'n') {
      for (const off of KNIGHT_OFFSETS) {
        const to = sq + off;
        if (onBoardStep(sq, to, 2)) {
          const t = this.board[to];
          if (!t) add(to);
          else if (colorOf(t) !== color) add(to, { capture: true });
        }
      }
    } else if (type === 'k') {
      for (const off of KING_OFFSETS) {
        const to = sq + off;
        if (onBoardStep(sq, to, 1)) {
          const t = this.board[to];
          if (!t) add(to);
          else if (colorOf(t) !== color) add(to, { capture: true });
        }
      }
      // Enroque
      this._addCastling(sq, color, moves);
    } else {
      const dirs = type === 'b' ? BISHOP_DIRS : type === 'r' ? ROOK_DIRS : [...BISHOP_DIRS, ...ROOK_DIRS];
      for (const dir of dirs) {
        let to = sq;
        while (true) {
          const prev = to;
          to += dir;
          if (to < 0 || to > 63) break;
          if (Math.abs(fileOf(prev) - fileOf(to)) > 1) break;
          const t = this.board[to];
          if (!t) add(to);
          else { if (colorOf(t) !== color) add(to, { capture: true }); break; }
        }
      }
    }
    return moves;
  }

  _addCastling(sq, color, moves) {
    const enemy = color === WHITE ? BLACK : WHITE;
    if (this.inCheck(color)) return;
    if (color === WHITE && sq === 60) {
      if (this.castling.includes('K') && !this.board[61] && !this.board[62] &&
          !this.isAttacked(61, enemy) && !this.isAttacked(62, enemy) && this.board[63] === 'R') {
        moves.push({ from: sq, to: 62, castle: 'K' });
      }
      if (this.castling.includes('Q') && !this.board[59] && !this.board[58] && !this.board[57] &&
          !this.isAttacked(59, enemy) && !this.isAttacked(58, enemy) && this.board[56] === 'R') {
        moves.push({ from: sq, to: 58, castle: 'Q' });
      }
    } else if (color === BLACK && sq === 4) {
      if (this.castling.includes('k') && !this.board[5] && !this.board[6] &&
          !this.isAttacked(5, enemy) && !this.isAttacked(6, enemy) && this.board[7] === 'r') {
        moves.push({ from: sq, to: 6, castle: 'k' });
      }
      if (this.castling.includes('q') && !this.board[3] && !this.board[2] && !this.board[1] &&
          !this.isAttacked(3, enemy) && !this.isAttacked(2, enemy) && this.board[0] === 'r') {
        moves.push({ from: sq, to: 2, castle: 'q' });
      }
    }
  }

  // Movimientos legales (filtrados para no dejar al rey en jaque).
  legalMoves(color = this.turn) {
    const pseudo = [];
    for (let sq = 0; sq < 64; sq++) {
      const p = this.board[sq];
      if (p && colorOf(p) === color) pseudo.push(...this._pseudoMovesFrom(sq));
    }
    const legal = [];
    for (const m of pseudo) {
      const undo = this._makeMove(m);
      if (!this.inCheck(color)) legal.push(m);
      this._undoMove(undo);
    }
    return legal;
  }

  legalMovesFrom(sq) {
    const p = this.board[sq];
    if (!p || colorOf(p) !== this.turn) return [];
    return this.legalMoves(this.turn).filter(m => m.from === sq);
  }

  // Aplica un movimiento internamente y devuelve info para deshacer.
  _makeMove(m) {
    const undo = {
      from: m.from, to: m.to,
      piece: this.board[m.from],
      captured: this.board[m.to],
      castling: this.castling,
      epSquare: this.epSquare,
      halfmoves: this.halfmoves,
      fullmoves: this.fullmoves,
      turn: this.turn,
      epCapturedSq: -1, epCapturedPiece: '',
      rookFrom: -1, rookTo: -1,
      move: m,
    };
    const piece = this.board[m.from];
    const color = colorOf(piece);
    const type = piece.toLowerCase();

    this.board[m.to] = piece;
    this.board[m.from] = '';

    if (m.enpassant) {
      const capSq = color === WHITE ? m.to + 8 : m.to - 8;
      undo.epCapturedSq = capSq;
      undo.epCapturedPiece = this.board[capSq];
      this.board[capSq] = '';
    }
    if (m.promotion) {
      this.board[m.to] = color === WHITE ? m.promotion.toUpperCase() : m.promotion;
    }
    if (m.castle) {
      if (m.castle === 'K') { this.board[61] = this.board[63]; this.board[63] = ''; undo.rookFrom = 63; undo.rookTo = 61; }
      else if (m.castle === 'Q') { this.board[59] = this.board[56]; this.board[56] = ''; undo.rookFrom = 56; undo.rookTo = 59; }
      else if (m.castle === 'k') { this.board[5] = this.board[7]; this.board[7] = ''; undo.rookFrom = 7; undo.rookTo = 5; }
      else if (m.castle === 'q') { this.board[3] = this.board[0]; this.board[0] = ''; undo.rookFrom = 0; undo.rookTo = 3; }
    }

    // Actualizar derechos de enroque
    let c = this.castling;
    if (type === 'k') c = c.replace(color === WHITE ? /[KQ]/g : /[kq]/g, '');
    if (m.from === 63 || m.to === 63) c = c.replace('K', '');
    if (m.from === 56 || m.to === 56) c = c.replace('Q', '');
    if (m.from === 7 || m.to === 7) c = c.replace('k', '');
    if (m.from === 0 || m.to === 0) c = c.replace('q', '');
    this.castling = c;

    // En passant nueva
    this.epSquare = m.double ? (color === WHITE ? m.from - 8 : m.from + 8) : -1;

    // Relojes
    if (type === 'p' || m.capture) this.halfmoves = 0; else this.halfmoves++;
    if (color === BLACK) this.fullmoves++;
    this.turn = color === WHITE ? BLACK : WHITE;
    return undo;
  }

  _undoMove(u) {
    this.board[u.from] = u.piece;
    this.board[u.to] = u.captured;
    if (u.epCapturedSq >= 0) this.board[u.epCapturedSq] = u.epCapturedPiece;
    if (u.rookFrom >= 0) { this.board[u.rookFrom] = this.board[u.rookTo]; this.board[u.rookTo] = ''; }
    this.castling = u.castling;
    this.epSquare = u.epSquare;
    this.halfmoves = u.halfmoves;
    this.fullmoves = u.fullmoves;
    this.turn = u.turn;
  }

  // Aplica un movimiento "de verdad" (guarda historial para deshacer en la UI).
  move(m) {
    // Acepta {from,to,promotion} y busca el movimiento legal correspondiente.
    const legal = this.legalMoves(this.turn);
    const match = legal.find(x => x.from === m.from && x.to === m.to &&
      (m.promotion ? x.promotion === m.promotion : !x.promotion || x.promotion === 'q'));
    if (!match) return null;
    const san = this.toSan(match);
    const undo = this._makeMove(match);
    this.history.push({ undo, san, move: match });
    return { ...match, san };
  }

  undo() {
    const last = this.history.pop();
    if (!last) return null;
    this._undoMove(last.undo);
    return last.move;
  }

  // Notación algebraica (SAN) para mostrar la jugada.
  toSan(m) {
    const piece = this.board[m.from];
    const type = piece.toLowerCase();
    if (m.castle === 'K' || m.castle === 'k') return 'O-O';
    if (m.castle === 'Q' || m.castle === 'q') return 'O-O-O';
    let san = '';
    const dest = sqToAlg(m.to);
    if (type === 'p') {
      if (m.capture) san += 'abcdefgh'[fileOf(m.from)] + 'x';
      san += dest;
      if (m.promotion) san += '=' + m.promotion.toUpperCase();
    } else {
      san += type.toUpperCase();
      // desambiguación
      const others = this.legalMoves(colorOf(piece)).filter(x =>
        x.to === m.to && x.from !== m.from && this.board[x.from] && this.board[x.from].toLowerCase() === type);
      if (others.length) {
        const sameFile = others.some(x => fileOf(x.from) === fileOf(m.from));
        const sameRank = others.some(x => rankOf(x.from) === rankOf(m.from));
        if (!sameFile) san += 'abcdefgh'[fileOf(m.from)];
        else if (!sameRank) san += (8 - rankOf(m.from));
        else san += sqToAlg(m.from);
      }
      if (m.capture) san += 'x';
      san += dest;
    }
    // jaque / mate
    const undo = this._makeMove(m);
    if (this.inCheck(this.turn)) {
      san += this.legalMoves(this.turn).length === 0 ? '#' : '+';
    }
    this._undoMove(undo);
    return san;
  }

  isCheckmate() { return this.inCheck(this.turn) && this.legalMoves(this.turn).length === 0; }
  isStalemate() { return !this.inCheck(this.turn) && this.legalMoves(this.turn).length === 0; }
  isInsufficientMaterial() {
    const pieces = this.board.filter(p => p).map(p => p.toLowerCase()).filter(p => p !== 'k');
    if (pieces.length === 0) return true;
    if (pieces.length === 1 && (pieces[0] === 'b' || pieces[0] === 'n')) return true;
    if (pieces.length === 2 && pieces.every(p => p === 'b')) return true;
    return false;
  }
  isDraw() {
    return this.halfmoves >= 100 || this.isStalemate() || this.isInsufficientMaterial();
  }
  isGameOver() { return this.isCheckmate() || this.isDraw(); }
}

export function algToSq(alg) {
  const f = 'abcdefgh'.indexOf(alg[0]);
  const r = 8 - parseInt(alg[1], 10);
  return r * 8 + f;
}
export function sqToAlg(sq) {
  return 'abcdefgh'[fileOf(sq)] + (8 - rankOf(sq));
}
export { fileOf, rankOf };
