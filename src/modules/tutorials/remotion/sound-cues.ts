import { CAPTION_INTRO } from './caption-timing';
import { realFrame, type Hold } from './timeline';

/** Efectos disponibles (public/tutorials/sfx, generados con scripts/generate-tutorial-sfx.mjs). */
export type Sound =
  | 'click'
  | 'key-1'
  | 'key-2'
  | 'key-3'
  | 'pop'
  | 'caption-in'
  | 'caption-out'
  | 'success';

/** Duración de cada efecto en frames (a 30 fps, redondeando hacia arriba). */
export const SOUND_FRAMES: Record<Sound, number> = {
  click: 2,
  'key-1': 2,
  'key-2': 2,
  'key-3': 2,
  pop: 5,
  'caption-in': 24,
  'caption-out': 15,
  success: 39,
};

// Mezcla: el cursor y las teclas acompañan; las transiciones y el cierre destacan.
const VOLUME: Record<Sound, number> = {
  click: 0.55,
  'key-1': 0.3,
  'key-2': 0.3,
  'key-3': 0.3,
  pop: 0.4,
  'caption-in': 0.35,
  'caption-out': 0.3,
  success: 0.5,
};

export interface SoundCue {
  /** Frame real del vídeo. */
  frame: number;
  sound: Sound;
  volume: number;
}

/** Momentos sonoros del guion, en frames de la escena (como el resto del guion). */
export interface SoundScript {
  clicks: number[];
  typing: { text: string; start: number; framesPerChar?: number }[];
  /** Algo aparece: una tarjeta, un modal, un desplegable… */
  pops: number[];
  /** Inicio (`from`) de cada subtítulo: suena al presentarse y al bajar a su sitio. */
  captions: number[];
  done: number;
}

const cue = (frame: number, sound: Sound): SoundCue => ({ frame, sound, volume: VOLUME[sound] });

/**
 * Convierte el guion sonoro a frames reales del vídeo (sumando las pausas de
 * los subtítulos), ordenado por tiempo.
 */
export function buildSoundCues(script: SoundScript, holds: Hold[]): SoundCue[] {
  const keys: Sound[] = ['key-1', 'key-2', 'key-3'];
  const cues = [
    ...script.clicks.map(f => cue(realFrame(f, holds), 'click')),
    ...script.typing.flatMap(({ text, start, framesPerChar = 2 }) =>
      [...text].flatMap((char, i) =>
        char === ' '
          ? []
          : [cue(realFrame(start + i * framesPerChar, holds), keys[i % keys.length])],
      ),
    ),
    ...script.pops.map(f => cue(realFrame(f, holds), 'pop')),
    ...script.captions.flatMap(from => {
      const start = realFrame(from, holds);
      return [cue(start, 'caption-in'), cue(start + CAPTION_INTRO, 'caption-out')];
    }),
    cue(realFrame(script.done, holds), 'success'),
  ];
  return cues.sort((a, b) => a.frame - b.frame);
}
