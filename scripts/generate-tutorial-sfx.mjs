// Sintetiza los efectos de sonido de los tutoriales (public/tutorials/sfx/*.wav).
// Sin dependencias y determinista: volver a ejecutarlo produce los mismos archivos.
//
//   node scripts/generate-tutorial-sfx.mjs

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RATE = 22050;
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'tutorials', 'sfx');

// Ruido pseudoaleatorio con semilla (mismo resultado en cada ejecución).
function noise(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return (s / 0xffffffff) * 2 - 1;
  };
}

function render(seconds, sample) {
  const n = Math.round(seconds * RATE);
  const data = new Float32Array(n);
  for (let i = 0; i < n; i++) data[i] = sample(i / RATE, i);
  return data;
}

/**
 * Suaviza los bordes (evita chasquidos) y normaliza al pico indicado. La
 * entrada es muy corta para no comerse el golpe de clics y teclas.
 */
function finish(data, peak = 0.9, fadeIn = 0.0005, fadeOut = 0.004) {
  const inN = Math.max(1, Math.round(fadeIn * RATE));
  const outN = Math.max(1, Math.round(fadeOut * RATE));
  const faded = data.map((v, i) => v * Math.min(1, i / inN, (data.length - 1 - i) / outN));
  const max = faded.reduce((m, v) => Math.max(m, Math.abs(v)), 0) || 1;
  return faded.map(v => (v / max) * peak);
}

function wav(data) {
  const buf = Buffer.alloc(44 + data.length * 2);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + data.length * 2, 4);
  buf.write('WAVEfmt ', 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(1, 22); // mono
  buf.writeUInt32LE(RATE, 24);
  buf.writeUInt32LE(RATE * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(data.length * 2, 40);
  data.forEach((v, i) => buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), 44 + i * 2));
  return buf;
}

const TAU = Math.PI * 2;
const decay = (t, tau) => Math.exp(-t / tau);

/** Clic de ratón: golpe de ruido brillante + un "tic" tonal muy corto. */
function click() {
  const rnd = noise(7);
  let prev = 0;
  return render(0.06, t => {
    const n = rnd();
    const hp = n - prev; // paso alto simple: más "clic", menos "soplo"
    prev = n;
    return hp * decay(t, 0.004) * 0.8 + Math.sin(TAU * 2100 * t) * decay(t, 0.007) * 0.35;
  });
}

/** Tecla: más corta y apagada que el clic; `pitch` varía entre variantes. */
function key(seed, pitch) {
  const rnd = noise(seed);
  let lp = 0;
  return render(0.045, t => {
    lp += (rnd() - lp) * 0.35; // paso bajo: sonido de tecla suave
    return lp * decay(t, 0.006) + Math.sin(TAU * pitch * t) * decay(t, 0.012) * 0.25;
  });
}

/** Pop: burbuja que sube de tono (algo aparece). */
function pop() {
  let phase = 0;
  return render(0.14, t => {
    const freq = 420 + 650 * Math.min(1, t / 0.05);
    phase += (TAU * freq) / RATE;
    const env = Math.min(1, t / 0.004) * decay(t, 0.035);
    return Math.sin(phase) * env;
  });
}

/** Éxito: arpegio Do–Mi–Sol brillante con cola larga. */
function success() {
  const notes = [1046.5, 1318.5, 1568.0, 2093.0];
  return render(1.3, t =>
    notes.reduce((sum, f, i) => {
      const s = t - i * 0.075;
      if (s < 0) return sum;
      const env = Math.min(1, s / 0.005) * decay(s, 0.45);
      return sum + (Math.sin(TAU * f * s) + 0.25 * Math.sin(TAU * f * 2 * s)) * env * 0.5;
    }, 0),
  );
}

/** Envolvente con ataque y caída exponencial. */
const env = (t, attack, tau) => Math.min(1, t / attack) * decay(Math.max(0, t - attack), tau);

/** Marimba: golpe de mazo (fundamental + parcial ~4x que se apaga rápido). */
function mallet(seconds, notes) {
  return render(seconds, t =>
    notes.reduce((sum, [f, at, gain = 1]) => {
      const s = t - at;
      if (s < 0) return sum;
      return sum + gain * (env(s, 0.003, 0.22) * Math.sin(TAU * f * s) + env(s, 0.002, 0.03) * 0.5 * Math.sin(TAU * f * 3.95 * s));
    }, 0),
  );
}

const SOUNDS = {
  click: [click(), 0.9],
  'key-1': [key(11, 900), 0.8],
  'key-2': [key(23, 1050), 0.8],
  'key-3': [key(37, 1200), 0.8],
  pop: [pop(), 0.8],
  // Pregunta a pantalla completa: dos golpes que suben al aparecer, uno grave al bajar.
  'caption-in': [mallet(0.8, [[392.0, 0], [587.3, 0.11]]), 0.6],
  'caption-out': [mallet(0.5, [[293.7, 0, 0.8]]), 0.45],
  success: [success(), 0.8],
};

// Las notas largas se apagan en 20 ms; los golpes cortos, en 4 ms.
const LONG_TAIL = new Set(['caption-in', 'caption-out']);

mkdirSync(OUT, { recursive: true });
for (const [name, [data, peak]] of Object.entries(SOUNDS)) {
  const fadeOut = LONG_TAIL.has(name) ? 0.02 : 0.004;
  writeFileSync(join(OUT, `${name}.wav`), wav(finish(data, peak, 0.0005, fadeOut)));
  console.log(`${name}.wav  ${(data.length / RATE).toFixed(2)} s`);
}
