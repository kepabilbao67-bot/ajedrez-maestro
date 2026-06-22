/*
 * sounds.js — Efectos de sonido sintetizados con Web Audio API.
 * No requiere archivos externos, así funciona sin conexión.
 * Incluye: levantar/arrastrar pieza, soltar/mover, captura, enroque,
 * jaque, fin de partida y un pequeño "fanfarria de campeón" al ganar.
 */

let ctx = null;
let enabled = true;

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function setSoundEnabled(v) { enabled = v; }
export function isSoundEnabled() { return enabled; }

// Un "beep" con envolvente para que suene suave.
function tone(freq, start, dur, { type = 'sine', gain = 0.2 } = {}) {
  const c = ac();
  const t0 = c.currentTime + start;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

// Pequeño "click" de madera para arrastrar/soltar.
function click(freq = 220, gain = 0.15) {
  const c = ac();
  const t0 = c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, t0);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.6, t0 + 0.08);
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.12);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + 0.14);
}

export const Sounds = {
  // Levantar/arrastrar una pieza
  pickup() { if (enabled) click(330, 0.10); },
  // Mover (soltar) una pieza normal
  move() { if (enabled) click(240, 0.16); },
  // Captura
  capture() {
    if (!enabled) return;
    click(160, 0.20);
    tone(110, 0.02, 0.12, { type: 'square', gain: 0.12 });
  },
  // Enroque
  castle() {
    if (!enabled) return;
    click(240, 0.14);
    setTimeout(() => click(240, 0.14), 90);
  },
  // Jaque
  check() {
    if (!enabled) return;
    tone(880, 0, 0.12, { type: 'sawtooth', gain: 0.14 });
    tone(1175, 0.08, 0.14, { type: 'sawtooth', gain: 0.12 });
  },
  // Movimiento ilegal
  illegal() {
    if (!enabled) return;
    tone(140, 0, 0.18, { type: 'sawtooth', gain: 0.12 });
  },
  // Fanfarria de CAMPEÓN al ganar
  champion() {
    if (!enabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // Do, Mi, Sol, Do agudo
    notes.forEach((f, i) => tone(f, i * 0.16, 0.35, { type: 'triangle', gain: 0.25 }));
    // acorde final
    [523.25, 659.25, 783.99, 1046.5].forEach(f => tone(f, 0.7, 0.6, { type: 'sine', gain: 0.14 }));
  },
  // Sonido de derrota / tablas (más sobrio)
  gameEndNeutral() {
    if (!enabled) return;
    tone(440, 0, 0.25, { type: 'sine', gain: 0.15 });
    tone(330, 0.18, 0.35, { type: 'sine', gain: 0.13 });
  },
  defeat() {
    if (!enabled) return;
    tone(330, 0, 0.25, { type: 'sine', gain: 0.14 });
    tone(247, 0.2, 0.45, { type: 'sine', gain: 0.13 });
  },
};
