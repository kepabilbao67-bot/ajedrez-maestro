/*
 * pieces.js — Juegos de piezas (distintas FORMAS) y temas de tablero (COLORES).
 * Cada juego de piezas devuelve el HTML que se pinta dentro de la casilla.
 *  - 'symbols'  : símbolos Unicode de ajedrez (clásico)
 *  - 'modern'   : piezas dibujadas en SVG (formas modernas)
 *  - 'letters'  : letras (K Q R B N P) — útil para aprender la notación
 *  - 'outline'  : símbolos con contorno (estilo línea)
 */

export const PIECE_SETS = [
  { id: 'symbols', name: 'Clásicas ♟' },
  { id: 'modern', name: 'Modernas (SVG)' },
  { id: 'outline', name: 'Contorno' },
  { id: 'letters', name: 'Letras' },
];

export const BOARD_THEMES = [
  { id: 'wood',   name: 'Madera',   light: '#f0d9b5', dark: '#b58863' },
  { id: 'green',  name: 'Verde',    light: '#eeeed2', dark: '#769656' },
  { id: 'blue',   name: 'Azul',     light: '#dee3e6', dark: '#5b7fa3' },
  { id: 'marble', name: 'Mármol',   light: '#e9e6df', dark: '#9aa0a6' },
  { id: 'rose',   name: 'Rosa',     light: '#ffeef2', dark: '#c98aa6' },
  { id: 'night',  name: 'Noche',    light: '#6f7780', dark: '#2e343b' },
  { id: 'coral',  name: 'Coral',    light: '#fbe9d0', dark: '#d08b5b' },
  { id: 'purple', name: 'Púrpura',  light: '#e7e2f3', dark: '#7d6aa6' },
  // Tableros con IMÁGENES (texturas). Llevan colores de respaldo por si la imagen no carga.
  { id: 'wood-img',   name: 'Madera real 🪵', light: '#deb887', dark: '#96643c', lightImg: 'img/wood_light.png',   darkImg: 'img/wood_dark.png' },
  { id: 'marble-img', name: 'Mármol real 🏛️', light: '#ebe8e2', dark: '#787c82', lightImg: 'img/marble_light.png', darkImg: 'img/marble_dark.png' },
  { id: 'slate-img',  name: 'Pizarra 🪨',     light: '#cdcdc8', dark: '#464e56', lightImg: 'img/slate_light.png',  darkImg: 'img/slate_dark.png' },
];

const UNICODE = {
  w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
  b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' },
};
// Para 'outline' usamos siempre los glifos "huecos" y coloreamos con CSS.
const OUTLINE = { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' };
const LETTERS = { k: 'K', q: 'Q', r: 'R', b: 'B', n: 'N', p: 'P' };

// ---- Piezas en SVG (formas) ----------------------------------------------
function svg(inner) {
  return `<svg viewBox="0 0 45 45" class="svg-piece" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
}
function modernPiece(type, color) {
  const fill = color === 'w' ? '#f7fafc' : '#2b2f36';
  const stroke = color === 'w' ? '#444' : '#000';
  const s = `fill="${fill}" stroke="${stroke}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"`;
  switch (type) {
    case 'p':
      return svg(`<g ${s}>
        <circle cx="22.5" cy="14" r="6"/>
        <path d="M16 22 q6.5 4 13 0 l4 14 h-21 z"/>
        <rect x="11" y="35" width="23" height="4.5" rx="2"/>
      </g>`);
    case 'r':
      return svg(`<g ${s}>
        <path d="M12 10 h4 v3 h4 v-3 h5 v3 h4 v-3 h4 v8 l-3 3 v12 l3 3 v3 h-25 v-3 l3 -3 v-12 l-3 -3 z"/>
        <rect x="10" y="38" width="25" height="4.5" rx="1.5"/>
      </g>`);
    case 'n':
      return svg(`<g ${s}>
        <path d="M16 38 c0 -10 2 -14 4 -18 c-3 1 -6 4 -8 4 c-1 -3 1 -6 4 -8 c3 -2 5 -5 9 -5 c8 0 13 7 13 18 v9 z"/>
        <circle cx="16" cy="14.5" r="1.2" fill="${stroke}"/>
        <rect x="13" y="38" width="22" height="4.5" rx="1.5"/>
      </g>`);
    case 'b':
      return svg(`<g ${s}>
        <circle cx="22.5" cy="9" r="2.6"/>
        <path d="M22.5 12 c7 4 9 12 6 18 h-12 c-3 -6 -1 -14 6 -18z"/>
        <path d="M19 22 h7" stroke-width="1.4"/>
        <path d="M14 32 q8.5 4 17 0 l1.5 5 h-20 z"/>
        <rect x="11" y="37.5" width="23" height="4.5" rx="2"/>
      </g>`);
    case 'q':
      return svg(`<g ${s}>
        <circle cx="8" cy="13" r="2.4"/><circle cx="16.5" cy="9.5" r="2.4"/>
        <circle cx="22.5" cy="8" r="2.6"/><circle cx="28.5" cy="9.5" r="2.4"/>
        <circle cx="37" cy="13" r="2.4"/>
        <path d="M9 15 l4 18 h19 l4 -18 l-6 8 l-3.5 -12 l-4 12 l-4 -12 l-3.5 12 z"/>
        <path d="M12 33 q10.5 4 21 0 l1 5 h-23 z"/>
        <rect x="9" y="38" width="27" height="4.5" rx="2"/>
      </g>`);
    case 'k':
      return svg(`<g ${s}>
        <path d="M22.5 5 v7 M19 8 h7" stroke-width="2"/>
        <path d="M22.5 13 c8 5 9 13 6 20 h-12 c-3 -7 -2 -15 6 -20z"/>
        <path d="M12 33 q10.5 4 21 0 l1 5 h-23 z"/>
        <rect x="9" y="38" width="27" height="4.5" rx="2"/>
      </g>`);
    default:
      return '';
  }
}

// Devuelve el HTML de la pieza para un juego concreto.
// piece es una letra de la FEN: 'P','n', etc.
export function renderPiece(piece, setId) {
  if (!piece) return '';
  const color = piece === piece.toUpperCase() ? 'w' : 'b';
  const type = piece.toLowerCase();
  if (setId === 'modern') {
    return `<span class="piece-svg" data-color="${color}">${modernPiece(type, color)}</span>`;
  }
  if (setId === 'letters') {
    return `<span class="piece-glyph piece-letters" data-color="${color}">${LETTERS[type]}</span>`;
  }
  if (setId === 'outline') {
    return `<span class="piece-glyph piece-outline" data-color="${color}">${OUTLINE[type]}</span>`;
  }
  // symbols (por defecto)
  return `<span class="piece-glyph" data-color="${color}">${UNICODE[color][type]}</span>`;
}
