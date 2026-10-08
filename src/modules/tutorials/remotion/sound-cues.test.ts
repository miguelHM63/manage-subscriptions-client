import { describe, expect, it } from 'vitest';

import { CAPTION_INTRO } from './caption-timing';
import { buildSoundCues } from './sound-cues';

describe('buildSoundCues', () => {
  const holds = [{ at: 0, duration: 10 }];

  it('pasa cada momento a frames reales y los ordena', () => {
    const cues = buildSoundCues(
      { clicks: [20], typing: [], pops: [5], captions: [0], done: 40 },
      holds,
    );
    expect(cues.map(c => [c.frame, c.sound])).toEqual(
      [
        [0, 'caption-in'],
        [CAPTION_INTRO, 'caption-out'],
        [15, 'pop'],
        [30, 'click'],
        [50, 'success'],
      ].sort((a, b) => (a[0] as number) - (b[0] as number)),
    );
  });

  it('una tecla por letra (sin espacios), alternando variantes', () => {
    const cues = buildSoundCues(
      { clicks: [], typing: [{ text: 'ab c', start: 100 }], pops: [], captions: [], done: 999 },
      [],
    ).filter(c => c.sound.startsWith('key'));
    expect(cues.map(c => [c.frame, c.sound])).toEqual([
      [100, 'key-1'],
      [102, 'key-2'],
      [106, 'key-1'],
    ]);
  });
});
