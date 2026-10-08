import { Easing, interpolate } from 'remotion';

export interface Point {
  x: number;
  y: number;
}

// ease-in-out cúbica: arranca y frena suave, como una mano real.
const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);

/** El cursor sale en `start` desde donde estaba y llega a `target` en `end`. */
export interface CursorMove {
  start: number;
  end: number;
  target: string;
}

/** Fragmento de `text` escrito en `frame` si empieza a teclear en `start`. */
export function typedText(text: string, frame: number, start: number, framesPerChar = 2): string {
  if (frame < start) return '';
  return text.slice(0, Math.floor((frame - start) / framesPerChar) + 1);
}

/** Frame en el que termina de escribirse `text`. */
export const typingEnd = (text: string, start: number, framesPerChar = 2) =>
  start + (text.length - 1) * framesPerChar;

/**
 * Posición del cursor en `frame`. Los destinos se resuelven con `points`
 * (medidos en el DOM); si uno aún no se conoce, el cursor espera donde está.
 */
export function cursorPosition(
  frame: number,
  moves: CursorMove[],
  points: ReadonlyMap<string, Point>,
  initial: Point,
): Point {
  let from = initial;
  for (const move of moves) {
    if (frame < move.start) break;
    const to = points.get(move.target) ?? from;
    if (frame >= move.end) {
      from = to;
      continue;
    }
    const t = interpolate(frame, [move.start, move.end], [0, 1], { easing: EASE_IN_OUT });
    return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t };
  }
  return from;
}

/** Progreso (0–1) del clic más reciente, o `null` si no hay uno en curso. */
export function clickProgress(frame: number, clicks: number[], duration = 14): number | null {
  const last = lastOf(clicks.filter(c => c <= frame));
  if (last === undefined || frame - last >= duration) return null;
  return (frame - last) / duration;
}

/** Último elemento cuyo `from` ya pasó (subtítulos, escenas…). */
export function activeAt<T extends { from: number }>(items: T[], frame: number): T | undefined {
  return lastOf(items.filter(item => item.from <= frame));
}

const lastOf = <T>(items: T[]): T | undefined => items[items.length - 1];

/** Pausa del guion: en el frame `at` la escena se congela `duration` frames. */
export interface Hold {
  at: number;
  duration: number;
}

/**
 * Frame de la escena para un frame real del vídeo. Durante una pausa la escena
 * queda congelada en `hold.at` (mientras, se anima otra cosa encima, como el
 * subtítulo a pantalla completa). `holds` va ordenado por `at`.
 */
export function sceneFrame(frame: number, holds: Hold[]): number {
  let offset = 0;
  for (const hold of holds) {
    const start = hold.at + offset;
    if (frame < start) break;
    if (frame < start + hold.duration) return hold.at;
    offset += hold.duration;
  }
  return frame - offset;
}

/** Frame real en el que la escena llega a `scene` (si hay una pausa ahí, su inicio). */
export function realFrame(scene: number, holds: Hold[]): number {
  return scene + holds.filter(h => h.at < scene).reduce((sum, h) => sum + h.duration, 0);
}

/** Duración real del vídeo: la de la escena más todas las pausas. */
export const realDuration = (scene: number, holds: Hold[]) =>
  scene + holds.reduce((sum, h) => sum + h.duration, 0);
