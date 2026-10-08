import { Audio, Sequence } from 'remotion';

import { SOUND_FRAMES, type SoundCue } from './sound-cues';

/** Ruta pública de los efectos (servidos por Vite desde public/). */
const soundUrl = (sound: SoundCue['sound']) => `/tutorials/sfx/${sound}.wav`;

/** Reproduce los efectos de sonido del tutorial, sincronizados con el vídeo. */
export function SoundTrack({ cues }: { cues: SoundCue[] }) {
  return (
    <>
      {cues.map(({ frame, sound, volume }, i) => (
        <Sequence key={i} from={frame} durationInFrames={SOUND_FRAMES[sound]} layout="none">
          <Audio src={soundUrl(sound)} volume={volume} />
        </Sequence>
      ))}
    </>
  );
}
