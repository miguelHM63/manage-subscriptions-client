import type { Point } from './timeline';

interface AnimatedCursorProps {
  position: Point;
  /** Progreso del clic en curso (0–1) o `null`. */
  click: number | null;
  /** `touch` dibuja la yema del dedo en vez de la flecha (versión móvil). */
  variant: 'pointer' | 'touch';
}

/** Cursor del tutorial: se hunde al hacer clic y deja una onda. */
export function AnimatedCursor({ position, click, variant }: AnimatedCursorProps) {
  // Se hunde en la primera mitad del clic y vuelve en la segunda.
  const press = click === null ? 0 : Math.sin(Math.min(click * 2, 1) * Math.PI);
  const ripple =
    click === null ? null : (
      <span
        className="absolute rounded-full border-2 border-brand-500"
        style={{
          width: 56,
          height: 56,
          left: -28,
          top: -28,
          transform: `scale(${0.3 + click * 0.9})`,
          opacity: 1 - click,
        }}
      />
    );

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute z-[2000]"
      style={{ left: position.x, top: position.y }}
    >
      {ripple}
      {variant === 'touch' ? (
        <span
          className="absolute rounded-full border-2 border-white bg-neutral-900/30 shadow-lg"
          style={{
            width: 36,
            height: 36,
            left: -18,
            top: -18,
            transform: `scale(${1 - press * 0.25})`,
          }}
        />
      ) : (
        <svg
          width={26}
          height={26}
          viewBox="0 0 24 24"
          className="absolute drop-shadow-md"
          style={{
            left: -3,
            top: -2,
            transform: `scale(${1 - press * 0.18})`,
            transformOrigin: '3px 2px',
          }}
        >
          <path
            d="M4 2.5v17.2l4.6-4.3 3 6.8 3.1-1.4-3-6.7 6.3-.3z"
            fill="#ffffff"
            stroke="#0f172a"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}
