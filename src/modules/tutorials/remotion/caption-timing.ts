import { Easing, interpolate } from 'remotion';

/** Frames que la pregunta se queda en el centro, a pantalla completa. */
export const CAPTION_INTRO = 50;
/** Frames que tarda en encogerse y viajar hasta su píldora. */
export const CAPTION_TRANSITION = 26;
/** Pausa total del guion por cada subtítulo (ver `Hold`). */
export const CAPTION_HOLD = CAPTION_INTRO + CAPTION_TRANSITION;

const EASE = Easing.bezier(0.65, 0, 0.35, 1);
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export interface CaptionPhase {
  /** Aparición (0–1). */
  enter: number;
  /** Viaje del centro a la píldora (0–1). */
  settle: number;
  /** Relevo del título grande por la píldora (0–1), al final del viaje. */
  swap: number;
  /** Intensidad del velo y del desenfoque de la escena (0–1). */
  veil: number;
}

/** Estado de la animación de un subtítulo `t` frames después de aparecer. */
export function captionPhase(t: number): CaptionPhase {
  const enter = interpolate(t, [0, 10], [0, 1], clamp);
  const settle = interpolate(t, [CAPTION_INTRO, CAPTION_HOLD], [0, 1], { ...clamp, easing: EASE });
  return {
    enter,
    settle,
    swap: interpolate(settle, [0.6, 1], [0, 1], clamp),
    veil: enter * (1 - settle),
  };
}

/**
 * Dónde se asienta la píldora: abajo (en móvil, sobre la barra inferior) o,
 * con un formulario abierto, arriba sobre la cabecera atenuada para no tapar
 * los campos ni el botón principal.
 */
export function captionSpot(variant: 'desktop' | 'mobile', formOpen: boolean) {
  if (formOpen) return { placement: 'top', inset: variant === 'mobile' ? 10 : 20 } as const;
  return { placement: 'bottom', inset: variant === 'mobile' ? 72 : 28 } as const;
}

// Desenfoque máximo (px) de la escena tras un subtítulo a pantalla completa.
const SCENE_BLUR = 6;

/**
 * Desenfoque de la escena: fuerte mientras un subtítulo está a pantalla
 * completa y suave bajo la tarjeta final. `captionT` son los frames desde que
 * apareció el subtítulo actual (o `null`); `doneT`, desde la tarjeta final.
 */
export function sceneBlur(captionT: number | null, doneT: number): number {
  const caption = captionT === null ? 0 : captionPhase(captionT).veil * SCENE_BLUR;
  const done = interpolate(doneT, [0, 8], [0, SCENE_BLUR / 2], clamp);
  return Math.max(caption, done);
}
