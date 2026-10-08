import { CheckOutlined } from '@ant-design/icons';
import { AbsoluteFill, interpolate, spring, useVideoConfig } from 'remotion';

interface DoneCardProps {
  /** Frame de la escena (tiempo del guion, no del vídeo). */
  frame: number;
  /** Frame en el que aparece. */
  from: number;
  title: string;
  /** Normalmente, el siguiente paso. */
  description: string;
}

/**
 * Cierre del tutorial: confirma lo logrado y anuncia el siguiente paso. El
 * desenfoque del fondo lo pone la composición sobre la escena (ver
 * `sceneBlur`): `backdrop-filter` repite los bordes dentro del Player.
 */
export function DoneCard({ frame, from, title, description }: DoneCardProps) {
  const { fps } = useVideoConfig();
  if (frame < from) return null;

  const enter = spring({ frame: frame - from, fps, config: { damping: 16 } });
  return (
    <AbsoluteFill
      className="z-[2100] items-center justify-center bg-neutral-900/40 p-6"
      style={{ opacity: interpolate(frame - from, [0, 8], [0, 1], { extrapolateRight: 'clamp' }) }}
    >
      <div
        className="flex max-w-sm flex-col items-center gap-3 rounded-2xl bg-surface px-7 py-6 text-center shadow-2xl"
        style={{ transform: `scale(${0.9 + enter * 0.1})` }}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success text-xl text-white">
          <CheckOutlined />
        </span>
        <p className="text-lg font-bold text-content">{title}</p>
        <p className="text-sm text-content-muted">{description}</p>
      </div>
    </AbsoluteFill>
  );
}
