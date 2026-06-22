/*
 * app.js — Lógica principal de la interfaz de Ajedrez Maestro.
 * Incluye: juego contra IA, modo 2 jugadores, reloj de partida,
 * pistas, lecciones, temas con imágenes, sonidos y 13 idiomas.
 */
import { Chess, sqToAlg, algToSq, fileOf, rankOf, colorOf, WHITE, BLACK } from './engine.js';
import { renderPiece, PIECE_SETS, BOARD_THEMES } from './pieces.js';
import { LANGUAGES, setLang, getLang, isRTL, t } from './i18n.js';
import { LESSONS, coachAdvice } from './lessons.js';
import { Sounds, setSoundEnabled } from './sounds.js';

// ----------------------------- Controles de tiempo --------------------------
const TIME_CONTROLS = [
  { id: 'none', min: 0, inc: 0 },
  { id: '1+0', min: 1, inc: 0 },
  { id: '3+0', min: 3, inc: 0 },
  { id: '3+2', min: 3, inc: 2 },
  { id: '5+0', min: 5, inc: 0 },
  { id: '10+0', min: 10, inc: 0 },
  { id: '15+10', min: 15, inc: 10 },
];

// ----------------------------- Estado --------------------------------------
const defaults = {
  lang: 'es', theme: 'wood', pieceSet: 'symbols', square: 'flat',
  playerColor: 'w', level: 3, sound: true, coords: true,
  mode: 'ai', timeMin: 0, timeInc: 0,
};
const settings = Object.assign({}, defaults, loadSettings());

let game = new Chess();
let selected = -1;
let legalForSel = [];
let flipped = false;
let lastMove = null;
let hintMove = null;
let aiThinking = false;
let pendingPromo = null;
let capturedWhite = [];   // piezas blancas capturadas (las capturó el negro)
let capturedBlack = [];   // piezas negras capturadas (las capturó el blanco)
let gameEnded = false;    // fin por mate/tablas/tiempo

// Reloj
let clockMs = { w: 0, b: 0 };
let clockInterval = null;
let lastTickTs = 0;

const worker = new Worker('js/ai-worker.js', { type: 'module' });
let workerResolve = null;
worker.onmessage = (e) => { if (workerResolve) { workerResolve(e.data); workerResolve = null; } };
function askAI({ fen, level, hint }) {
  return new Promise((res) => { workerResolve = res; worker.postMessage({ fen, level, hint }); });
}

// ----------------------------- Utilidades ----------------------------------
function loadSettings() {
  try { return JSON.parse(localStorage.getItem('chess-settings') || '{}'); } catch { return {}; }
}
function saveSettings() { localStorage.setItem('chess-settings', JSON.stringify(settings)); }
function $(id) { return document.getElementById(id); }
function humanColor() { return settings.playerColor === 'b' ? BLACK : WHITE; }
function opposite(c) { return c === WHITE ? BLACK : WHITE; }
function isAIMode() { return settings.mode === 'ai'; }
function isHumanTurn() { return isAIMode() ? game.turn === humanColor() : true; }
function over() { return gameEnded || game.isGameOver(); }
function clockEnabled() { return settings.timeMin > 0; }
function viewToSquare(i) { return flipped ? 63 - i : i; }
function topColor() { return flipped ? WHITE : BLACK; }
function bottomColor() { return flipped ? BLACK : WHITE; }
function capturedByColor(color) { return color === WHITE ? capturedBlack : capturedWhite; }

// ----------------------------- Render tablero -------------------------------
const boardEl = $('board');

function applyTheme() {
  const th = BOARD_THEMES.find(x => x.id === settings.theme) || BOARD_THEMES[0];
  const root = document.documentElement.style;
  root.setProperty('--light', th.light);
  root.setProperty('--dark', th.dark);
  root.setProperty('--light-img', th.lightImg ? `url(${th.lightImg})` : 'none');
  root.setProperty('--dark-img', th.darkImg ? `url(${th.darkImg})` : 'none');
  boardEl.classList.toggle('textured', !!th.lightImg);
  boardEl.classList.toggle('round', settings.square === 'round');
}

function renderBoard() {
  applyTheme();
  boardEl.innerHTML = '';
  const checkColor = game.inCheck(game.turn) ? game.turn : null;
  const kingSq = checkColor ? game.kingSquare(checkColor) : -1;
  for (let i = 0; i < 64; i++) {
    const sq = viewToSquare(i);
    const r = rankOf(sq), f = fileOf(sq);
    const cell = document.createElement('div');
    cell.className = 'sq ' + ((r + f) % 2 === 0 ? 'light' : 'dark');
    cell.dataset.sq = sq;

    if (selected === sq) cell.classList.add('sel');
    if (lastMove && (lastMove.from === sq || lastMove.to === sq)) cell.classList.add('lastmove');
    if (hintMove && (hintMove.from === sq || hintMove.to === sq)) cell.classList.add('hint');
    if (sq === kingSq) cell.classList.add('check');

    const piece = game.pieceAt(sq);
    if (piece) cell.innerHTML = renderPiece(piece, settings.pieceSet);

    const mv = legalForSel.find(m => m.to === sq);
    if (mv) {
      const dot = document.createElement('div');
      dot.className = 'dot' + (mv.capture ? ' capture' : '');
      cell.appendChild(dot);
    }

    if (settings.coords) {
      if (f === (flipped ? 7 : 0)) addCoord(cell, 'rank', 8 - r);
      if (r === (flipped ? 0 : 7)) addCoord(cell, 'file', 'abcdefgh'[f]);
    }
    boardEl.appendChild(cell);
  }
  updatePlayerBars();
}
function addCoord(cell, type, val) {
  const c = document.createElement('span');
  c.className = 'coord ' + type; c.textContent = val; cell.appendChild(c);
}

// ----------------------------- Barras de jugador / reloj --------------------
function nameFor(color) {
  let base = color === WHITE ? t('white') : t('black');
  if (isAIMode()) base += color === humanColor() ? ' 👤' : ' 🤖';
  return base;
}
function updatePlayerBars() {
  const top = topColor(), bot = bottomColor();
  $('topName').textContent = nameFor(top);
  $('bottomName').textContent = nameFor(bot);
  const set = settings.pieceSet === 'modern' ? 'symbols' : settings.pieceSet;
  $('topCaptured').innerHTML = capturedByColor(top).map(p => renderPiece(p, set)).join('');
  $('bottomCaptured').innerHTML = capturedByColor(bot).map(p => renderPiece(p, set)).join('');
  updateClocks();
}
function fmtTime(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(s / 60);
  return m + ':' + String(s % 60).padStart(2, '0');
}
function updateClocks() {
  const en = clockEnabled();
  setClockEl('topClock', topColor(), en);
  setClockEl('bottomClock', bottomColor(), en);
}
function setClockEl(id, color, en) {
  const el = $(id);
  if (!en) { el.classList.add('hidden'); return; }
  el.classList.remove('hidden');
  el.textContent = fmtTime(clockMs[color]);
  el.classList.toggle('active', game.turn === color && !over());
  el.classList.toggle('low', clockMs[color] <= 20000);
}
function startClock() {
  stopClock();
  if (!clockEnabled() || over()) return;
  lastTickTs = Date.now();
  clockInterval = setInterval(() => {
    const now = Date.now();
    const dt = now - lastTickTs; lastTickTs = now;
    clockMs[game.turn] -= dt;
    if (clockMs[game.turn] <= 0) {
      clockMs[game.turn] = 0;
      updateClocks();
      onTimeout(game.turn);
      return;
    }
    updateClocks();
  }, 100);
}
function stopClock() { if (clockInterval) { clearInterval(clockInterval); clockInterval = null; } }
function addIncrement(moverColor) {
  if (clockEnabled() && settings.timeInc > 0) clockMs[moverColor] += settings.timeInc * 1000;
}
function onTimeout(color) {
  stopClock();
  finishGame(opposite(color), t('timeoutMsg'));
}

// ----------------------------- Interacción ---------------------------------
function clearSelection() { selected = -1; legalForSel = []; }

function onSquareTap(sq) {
  if (over() || !isHumanTurn() || aiThinking) return;
  const piece = game.pieceAt(sq);
  if (selected === -1) {
    if (piece && colorOf(piece) === game.turn) {
      selected = sq; legalForSel = game.legalMovesFrom(sq); Sounds.pickup(); renderBoard();
    }
    return;
  }
  if (sq === selected) { clearSelection(); renderBoard(); return; }
  const mv = legalForSel.find(m => m.to === sq);
  if (mv) { tryMove(selected, sq); return; }
  if (piece && colorOf(piece) === game.turn) {
    selected = sq; legalForSel = game.legalMovesFrom(sq); Sounds.pickup(); renderBoard();
  } else { clearSelection(); renderBoard(); }
}

function tryMove(from, to) {
  const moves = game.legalMovesFrom(from).filter(m => m.to === to);
  if (moves.length === 0) { Sounds.illegal(); return; }
  const needsPromo = moves.some(m => m.promotion);
  if (needsPromo) { pendingPromo = { from, to }; openPromoDialog(); return; }
  doMove({ from, to });
}

function doMove(m) {
  hintMove = null;
  const before = game.pieceAt(m.to);
  const result = game.move(m);
  if (!result) { Sounds.illegal(); return; }
  const mover = opposite(game.turn);
  registerCapture(result, before);
  addIncrement(mover);
  lastMove = { from: result.from, to: result.to };
  clearSelection();
  playMoveSound(result);
  renderBoard();
  updateAfterMove(result);
  if (!over() && isAIMode() && game.turn !== humanColor()) setTimeout(aiMove, 350);
}

function registerCapture(result, before) {
  if (result.enpassant) {
    const capColor = colorOf(game.pieceAt(result.to));
    if (capColor === WHITE) capturedBlack.push('p'); else capturedWhite.push('P');
  } else if (before) {
    if (colorOf(before) === WHITE) capturedWhite.push(before); else capturedBlack.push(before);
  }
}

function playMoveSound(result) {
  if (game.inCheck(game.turn)) { Sounds.check(); return; }
  if (result.castle) { Sounds.castle(); return; }
  if (result.capture) { Sounds.capture(); return; }
  Sounds.move();
}

async function aiMove() {
  if (over()) return;
  aiThinking = true;
  setStatus(t('thinking'));
  const { bestMove } = await askAI({ fen: game.fen(), level: settings.level, hint: false });
  aiThinking = false;
  if (!bestMove || over()) return;
  const before = game.pieceAt(bestMove.to);
  const result = game.move({ from: bestMove.from, to: bestMove.to, promotion: bestMove.promotion });
  if (!result) return;
  const mover = opposite(game.turn);
  registerCapture(result, before);
  addIncrement(mover);
  lastMove = { from: result.from, to: result.to };
  playMoveSound(result);
  renderBoard();
  updateAfterMove(result);
}

function updateAfterMove(result) {
  pushMoveToList(result);
  refreshStatus();
  if (game.isCheckmate()) { finishGame(opposite(game.turn), t('checkmate')); return; }
  if (game.isStalemate()) { finishGame(null, t('stalemate')); return; }
  if (game.isDraw()) { finishGame(null, t('draw')); return; }
}

// ----------------------------- Estado / fin ---------------------------------
function setStatus(text, isCheck = false) {
  const el = $('status'); el.textContent = text; el.classList.toggle('check', isCheck);
}
function refreshStatus() {
  if (over()) return;
  const check = game.inCheck(game.turn);
  let s;
  if (isAIMode()) s = (game.turn === humanColor()) ? t('yourMove') : t('aiMove');
  else s = (game.turn === WHITE) ? t('whiteToMove') : t('blackToMove');
  if (check) s = t('check') + ' · ' + s;
  setStatus(s, check);
}

function finishGame(winnerColor, reasonText) {
  gameEnded = true;
  stopClock();
  clearSelection();
  renderBoard();
  let icon, title;
  if (winnerColor === null) {
    icon = '🤝'; title = t('drawMsg'); Sounds.gameEndNeutral();
  } else if (isAIMode()) {
    const humanWon = winnerColor === humanColor();
    icon = humanWon ? '🏆' : '😿';
    title = humanWon ? t('youWin') : t('youLose');
    humanWon ? Sounds.champion() : Sounds.defeat();
  } else {
    icon = '🏆';
    title = winnerColor === WHITE ? t('whiteWins') : t('blackWins');
    Sounds.champion();
  }
  setStatus(title, false);
  $('endIcon').textContent = icon;
  $('endTitle').textContent = title;
  $('endSubtitle').textContent = reasonText || '';
  $('endDialog').classList.remove('hidden');
}

// ----------------------------- Lista de jugadas -----------------------------
function pushMoveToList(result) {
  const list = $('moveList');
  if (colorOf(game.pieceAt(result.to)) === WHITE) {
    const li = document.createElement('li');
    li.innerHTML = `<span class="san">${result.san}</span>`;
    list.appendChild(li);
  } else {
    const last = list.lastElementChild;
    if (last) last.innerHTML += `<span class="san">${result.san}</span>`;
    else { const li = document.createElement('li'); li.innerHTML = `<span class="san">…</span><span class="san">${result.san}</span>`; list.appendChild(li); }
  }
  list.scrollTop = list.scrollHeight;
}

// ----------------------------- Pista (profesor) -----------------------------
async function showHint() {
  if (over() || !isHumanTurn() || aiThinking) return;
  setStatus(t('thinking'));
  const { bestMove, score } = await askAI({ fen: game.fen(), level: settings.level, hint: true });
  refreshStatus();
  if (!bestMove) return;
  hintMove = { from: bestMove.from, to: bestMove.to };
  selected = -1; legalForSel = [];
  renderBoard();
  const found = game.legalMoves().find(m => m.from === bestMove.from && m.to === bestMove.to && (!bestMove.promotion || m.promotion === bestMove.promotion)) || bestMove;
  const san = game.toSan(found);
  const captured = !!game.pieceAt(bestMove.to);
  $('coachTitle').textContent = t('hintTitle');
  $('coachText').textContent = coachAdvice(san, score, getLang(), captured);
  $('coachBox').classList.remove('hidden');
}

// ----------------------------- Coronación -----------------------------------
function openPromoDialog() {
  const box = $('promoChoices'); box.innerHTML = '';
  const color = game.turn;
  ['q', 'r', 'b', 'n'].forEach(type => {
    const b = document.createElement('button'); b.className = 'promo-choice';
    const piece = color === WHITE ? type.toUpperCase() : type;
    b.innerHTML = renderPiece(piece, settings.pieceSet === 'modern' ? 'modern' : 'symbols');
    b.onclick = () => {
      $('promoDialog').classList.add('hidden');
      const { from, to } = pendingPromo; pendingPromo = null;
      doMove({ from, to, promotion: type });
    };
    box.appendChild(b);
  });
  $('promoTitle').textContent = t('promotion');
  $('promoDialog').classList.remove('hidden');
}

// ----------------------------- Nueva partida --------------------------------
function newGame() {
  game = new Chess();
  selected = -1; legalForSel = []; lastMove = null; hintMove = null;
  capturedWhite = []; capturedBlack = []; aiThinking = false; gameEnded = false;
  if (isAIMode() && settings.playerColor === 'r') settings.playerColor = Math.random() < 0.5 ? 'w' : 'b';
  flipped = isAIMode() ? (humanColor() === BLACK) : false;
  clockMs = { w: settings.timeMin * 60000, b: settings.timeMin * 60000 };
  $('moveList').innerHTML = '';
  $('coachBox').classList.add('hidden');
  $('endDialog').classList.add('hidden');
  renderBoard();
  refreshStatus();
  if (clockEnabled()) startClock();
  if (isAIMode() && game.turn !== humanColor()) setTimeout(aiMove, 400);
}

// ----------------------------- Aprender -------------------------------------
function renderLessonList() {
  const list = $('lessonList'); list.innerHTML = '';
  $('lessonDetail').classList.add('hidden'); list.classList.remove('hidden');
  const lang = getLang();
  const lvlMap = {
    basico: getLang() === 'en' ? 'Basic' : 'Básico',
    intermedio: getLang() === 'en' ? 'Intermediate' : 'Intermedio',
    avanzado: getLang() === 'en' ? 'Advanced' : 'Avanzado',
  };
  LESSONS.forEach((lesson, idx) => {
    const card = document.createElement('div'); card.className = 'lesson-card';
    const title = lesson.title[lang] || lesson.title.en;
    card.innerHTML = `<div class="lic">${lesson.icon}</div><div><h4>${title}</h4><span class="badge lvl-${lesson.level}">● ${lvlMap[lesson.level]}</span></div>`;
    card.onclick = () => openLesson(idx);
    list.appendChild(card);
  });
}
function openLesson(idx) {
  const lesson = LESSONS[idx];
  const lang = getLang();
  const detail = $('lessonDetail');
  $('lessonList').classList.add('hidden'); detail.classList.remove('hidden');
  let html = `<button class="btn" id="backLessons">← ${t('backToLessons')}</button>`;
  html += `<h2>${lesson.icon} ${lesson.title[lang] || lesson.title.en}</h2>`;
  for (const block of lesson.content) {
    const b = block[lang] || block.en;
    if (b.h) html += `<h4>${b.h}</h4>`;
    if (b.p) html += `<p>${b.p}</p>`;
    if (b.tip) html += `<div class="tip">💡 ${b.tip}</div>`;
    if (b.fen) html += `<div class="lesson-mini-board" data-fen="${b.fen}"></div>`;
  }
  html += `<div class="lesson-nav">
    <button class="btn" id="prevLesson" ${idx === 0 ? 'disabled' : ''}>← ${t('prev')}</button>
    <button class="btn" id="nextLesson" ${idx === LESSONS.length - 1 ? 'disabled' : ''}>${t('next')} →</button></div>`;
  detail.innerHTML = html;
  detail.querySelectorAll('.lesson-mini-board').forEach(el => renderMiniBoard(el, el.dataset.fen));
  $('backLessons').onclick = renderLessonList;
  $('prevLesson').onclick = () => idx > 0 && openLesson(idx - 1);
  $('nextLesson').onclick = () => idx < LESSONS.length - 1 && openLesson(idx + 1);
  detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function renderMiniBoard(container, fen) {
  const mini = new Chess(fen);
  const wrap = document.createElement('div'); wrap.className = 'board';
  const th = BOARD_THEMES.find(x => x.id === settings.theme) || BOARD_THEMES[0];
  for (let i = 0; i < 64; i++) {
    const r = rankOf(i), f = fileOf(i);
    const cell = document.createElement('div');
    cell.className = 'sq ' + ((r + f) % 2 === 0 ? 'light' : 'dark');
    cell.style.background = (r + f) % 2 === 0 ? th.light : th.dark;
    const p = mini.pieceAt(i);
    if (p) cell.innerHTML = renderPiece(p, settings.pieceSet);
    wrap.appendChild(cell);
  }
  if (settings.square === 'round') wrap.classList.add('round');
  container.appendChild(wrap);
}

// ----------------------------- Ajustes (UI) ---------------------------------
function buildSettingsUI() {
  // Controles de tiempo
  const timeG = $('timeGrid'); timeG.innerHTML = '';
  TIME_CONTROLS.forEach(tc => {
    const chip = document.createElement('div');
    const active = settings.timeMin === tc.min && settings.timeInc === tc.inc;
    chip.className = 'chip' + (active ? ' active' : '');
    const label = tc.id === 'none' ? t('noClock') : `${tc.min}'${tc.inc ? ' +' + tc.inc : ''}`;
    chip.innerHTML = `<div class="time-preview">${tc.id === 'none' ? '∞' : '⏱'}</div>${label}`;
    chip.onclick = () => { settings.timeMin = tc.min; settings.timeInc = tc.inc; saveSettings(); buildSettingsUI(); newGame(); };
    timeG.appendChild(chip);
  });
  // Temas de color / imagen
  const tg = $('themeGrid'); tg.innerHTML = '';
  BOARD_THEMES.forEach(th => {
    const chip = document.createElement('div');
    chip.className = 'chip' + (settings.theme === th.id ? ' active' : '');
    const sw = th.lightImg
      ? `<div class="swatch"><i style="background-image:url(${th.lightImg});background-size:cover"></i><i style="background-image:url(${th.darkImg});background-size:cover"></i></div>`
      : `<div class="swatch"><i style="background:${th.light}"></i><i style="background:${th.dark}"></i></div>`;
    chip.innerHTML = `${sw}${th.name}`;
    chip.onclick = () => { settings.theme = th.id; saveSettings(); buildSettingsUI(); renderBoard(); };
    tg.appendChild(chip);
  });
  // Juegos de piezas
  const pg = $('pieceGrid'); pg.innerHTML = '';
  PIECE_SETS.forEach(ps => {
    const chip = document.createElement('div');
    chip.className = 'chip' + (settings.pieceSet === ps.id ? ' active' : '');
    chip.innerHTML = `<div class="pieces-preview">${renderPiece('N', ps.id)}${renderPiece('p', ps.id)}</div>${ps.name}`;
    chip.onclick = () => { settings.pieceSet = ps.id; saveSettings(); buildSettingsUI(); renderBoard(); };
    pg.appendChild(chip);
  });
  document.querySelector(`input[name="sq"][value="${settings.square}"]`).checked = true;
  document.querySelector(`input[name="pc"][value="${settings.playerColor}"]`).checked = true;
  document.querySelector(`input[name="mode"][value="${settings.mode}"]`).checked = true;
  $('soundToggle').checked = settings.sound;
  $('coordsToggle').checked = settings.coords;
  applyModeUI();
}
function applyModeUI() {
  // El nivel de la IA y la elección de color solo importan contra la IA.
  $('levelPanel').classList.toggle('hidden', !isAIMode());
  $('hintBtn').classList.toggle('hidden', false); // la pista funciona en ambos modos
}

// ----------------------------- Idioma / textos ------------------------------
function buildLangSelect() {
  const sel = $('langSelect'); sel.innerHTML = '';
  LANGUAGES.forEach(l => {
    const o = document.createElement('option'); o.value = l.code; o.textContent = `${l.flag} ${l.name}`;
    if (l.code === settings.lang) o.selected = true; sel.appendChild(o);
  });
}
function applyTexts() {
  setLang(settings.lang);
  document.documentElement.lang = settings.lang;
  document.documentElement.dir = isRTL() ? 'rtl' : 'ltr';
  $('appName').textContent = t('appName');
  $('tagline').textContent = t('tagline');
  $('tabPlay').textContent = t('play');
  $('tabLearn').textContent = t('learn');
  $('tabSettings').textContent = t('settings');
  $('btnNew').textContent = t('newGame');
  $('btnHint').textContent = t('hint');
  $('btnUndo').textContent = t('undo');
  $('btnFlip').textContent = t('flip');
  $('lblLevel').textContent = t('level');
  $('lblMoves').textContent = t('moveList');
  $('lblMode').textContent = t('mode');
  $('optVsAI').textContent = t('vsAI');
  $('optTwo').textContent = t('twoPlayers');
  $('lblTime').textContent = t('timeControl');
  $('lblBoard').textContent = t('boardTheme');
  $('lblPieces').textContent = t('pieceSet');
  $('lblSquares').textContent = t('squareShape');
  $('lblColor').textContent = t('chooseColor');
  $('lblSound').textContent = t('sound');
  $('lblCoords').textContent = t('coords');
  $('sqFlat').textContent = t('square_flat');
  $('sqRound').textContent = t('square_round');
  $('optWhite').textContent = t('white');
  $('optBlack').textContent = t('black');
  $('optRandom').textContent = t('random');
  $('endNewBtn').textContent = t('newGame');
  $('endCloseBtn').textContent = t('close');
  updateLevelName();
  buildSettingsUI();
  if (over()) return;
  refreshStatus();
  updatePlayerBars();
}
function updateLevelName() { $('levelName').textContent = t('lvl' + settings.level); }

// ----------------------------- Eventos --------------------------------------
function bindEvents() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.onclick = () => {
      document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
      document.querySelectorAll('.view').forEach(x => x.classList.remove('active'));
      tab.classList.add('active');
      $('view-' + tab.dataset.view).classList.add('active');
      if (tab.dataset.view === 'learn') renderLessonList();
    };
  });

  setupBoardPointer();

  $('newGameBtn').onclick = newGame;
  $('hintBtn').onclick = showHint;
  $('undoBtn').onclick = undoMove;
  $('flipBtn').onclick = () => { flipped = !flipped; renderBoard(); };

  $('levelRange').value = settings.level;
  $('levelRange').oninput = (e) => { settings.level = parseInt(e.target.value, 10); saveSettings(); updateLevelName(); };

  $('langSelect').onchange = (e) => { settings.lang = e.target.value; saveSettings(); applyTexts(); };

  document.querySelectorAll('input[name="sq"]').forEach(r => r.onchange = (e) => { settings.square = e.target.value; saveSettings(); renderBoard(); });
  document.querySelectorAll('input[name="pc"]').forEach(r => r.onchange = (e) => { settings.playerColor = e.target.value; saveSettings(); });
  document.querySelectorAll('input[name="mode"]').forEach(r => r.onchange = (e) => {
    settings.mode = e.target.value; saveSettings(); applyModeUI(); newGame();
  });
  $('soundToggle').onchange = (e) => { settings.sound = e.target.checked; setSoundEnabled(settings.sound); saveSettings(); };
  $('coordsToggle').onchange = (e) => { settings.coords = e.target.checked; saveSettings(); renderBoard(); };

  $('endNewBtn').onclick = () => { $('endDialog').classList.add('hidden'); newGame(); };
  $('endCloseBtn').onclick = () => $('endDialog').classList.add('hidden');
}

function undoMove() {
  if (aiThinking || game.history.length === 0) return;
  game.undo();
  if (isAIMode() && game.history.length > 0 && game.turn !== humanColor()) game.undo();
  gameEnded = false;
  recomputeCaptured();
  lastMove = game.history.length ? { from: game.history[game.history.length - 1].move.from, to: game.history[game.history.length - 1].move.to } : null;
  hintMove = null; clearSelection();
  rebuildMoveListFromHistory();
  renderBoard(); refreshStatus();
  $('coachBox').classList.add('hidden');
  $('endDialog').classList.add('hidden');
  if (clockEnabled() && !over() && clockMs[game.turn] > 0) startClock(); else stopClock();
}
function recomputeCaptured() {
  capturedWhite = []; capturedBlack = [];
  const replay = new Chess();
  for (const h of game.history) {
    const before = replay.pieceAt(h.move.to);
    if (h.move.enpassant) { if (colorOf(replay.pieceAt(h.move.from)) === WHITE) capturedBlack.push('p'); else capturedWhite.push('P'); }
    else if (before) { if (colorOf(before) === WHITE) capturedWhite.push(before); else capturedBlack.push(before); }
    replay.move({ from: h.move.from, to: h.move.to, promotion: h.move.promotion });
  }
}
function rebuildMoveListFromHistory() {
  const list = $('moveList'); list.innerHTML = '';
  for (let i = 0; i < game.history.length; i++) {
    const san = game.history[i].san;
    if (i % 2 === 0) { const li = document.createElement('li'); li.innerHTML = `<span class="san">${san}</span>`; list.appendChild(li); }
    else { list.lastElementChild.innerHTML += `<span class="san">${san}</span>`; }
  }
}

// ---- Pointer (toque/click + arrastre) ----
let dragEl = null, dragFrom = -1, dragMoved = false;
function setupBoardPointer() {
  boardEl.addEventListener('pointerdown', (e) => {
    const cell = e.target.closest('.sq'); if (!cell) return;
    const sq = parseInt(cell.dataset.sq, 10);
    if (over() || !isHumanTurn() || aiThinking) return;
    const piece = game.pieceAt(sq);
    if (piece && colorOf(piece) === game.turn) {
      dragFrom = sq; dragMoved = false;
      selected = sq; legalForSel = game.legalMovesFrom(sq);
      Sounds.pickup(); renderBoard();
      startDrag(e, sq);
    } else {
      onSquareTap(sq);
    }
  });
  window.addEventListener('pointermove', (e) => {
    if (!dragEl) return;
    dragMoved = true;
    dragEl.style.left = e.clientX + 'px';
    dragEl.style.top = e.clientY + 'px';
  });
  window.addEventListener('pointerup', (e) => {
    if (dragEl) {
      const target = document.elementFromPoint(e.clientX, e.clientY);
      const cell = target && target.closest && target.closest('.sq');
      endDrag();
      if (cell && dragMoved) {
        const to = parseInt(cell.dataset.sq, 10);
        if (to !== dragFrom) { tryMove(dragFrom, to); dragFrom = -1; return; }
      }
      dragFrom = -1;
    }
  });
}
function startDrag(e, sq) {
  const piece = game.pieceAt(sq); if (!piece) return;
  dragEl = document.createElement('div');
  dragEl.className = 'dragging';
  const size = boardEl.clientWidth / 8;
  dragEl.style.width = size + 'px'; dragEl.style.height = size + 'px';
  dragEl.style.fontSize = (size * 0.78) + 'px';
  dragEl.innerHTML = renderPiece(piece, settings.pieceSet);
  dragEl.style.left = e.clientX + 'px'; dragEl.style.top = e.clientY + 'px';
  document.body.appendChild(dragEl);
}
function endDrag() { if (dragEl) { dragEl.remove(); dragEl = null; } }

// ----------------------------- PWA ------------------------------------------
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault(); deferredPrompt = e; $('installBtn').classList.remove('hidden');
});
$('installBtn') && ($('installBtn').onclick = async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null;
  $('installBtn').classList.add('hidden');
});
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

// ----------------------------- Init -----------------------------------------
function init() {
  setSoundEnabled(settings.sound);
  buildLangSelect();
  bindEvents();
  applyTexts();   // construye ajustes y aplica textos
  newGame();
}
init();
