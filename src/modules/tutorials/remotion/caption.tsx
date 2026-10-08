import { useLayoutEffect, useRef, useState } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

import { captionPhase } from './caption-timing';

interface CaptionProps {
  text: string;
  /** Frame real en el que aparece. */
  from: number;
  step?: number;
  placement: 'top' | 'bottom';
  /** Distancia en px al borde elegido (p. ej. para quedar sobre la barra inferior). */
  inset?: number;
}

/**
 * Subtítulo del paso actual. Primero se presenta en grande en el centro, sobre
 * un velo oscuro que deja ver la app (la composición además la desenfoca con
 * `captionPhase().veil`); luego se encoge y viaja hasta el borde,
 * donde se funde en la píldora que acompaña el resto del paso.
 */
export function Caption({ text, from, step, placement, inset = 28 }: CaptionProps) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const pill = useRef<HTMLParagraphElement>(null);
  // Alto de la píldora sin transformar (offsetHeight ignora el `transform`).
  const [size, setSize] = useState({ height: 40 });

  // Sin dependencias a propósito: el texto o la fuente pueden cambiar el tamaño.
  // Solo actualiza si cambió, así que se estabiliza.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    const el = pill.current;
    if (!el) return;
    if (el.offsetHeight !== size.height) setSize({ height: el.offsetHeight });
  });

  // Al final del viaje el título grande se funde en la píldora.
  const { enter, settle, swap, veil } = captionPhase(frame - from);

  // El título viaja del centro hasta donde queda la píldora.
  const restCenter =
    placement === 'bottom' ? height - inset - size.height / 2 : inset + size.height / 2;
  const travel = (restCenter - height / 2) * settle;

  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 z-[2050] bg-black/60"
        style={{ opacity: veil }}
      />
      {swap < 1 && (
        <div
          className="pointer-events-none absolute inset-0 z-[2060] flex flex-col items-center justify-center gap-3 text-center"
          style={{
            padding: width < 600 ? 28 : 64,
            opacity: enter * (1 - swap),
            transform: `translateY(${travel + (1 - enter) * 16}px) scale(${1 - 0.5 * settle})`,
          }}
        >
          {step !== undefined && (
            <span className="rounded-full bg-brand-500 px-3 py-1 text-xs font-bold tracking-wider text-white uppercase">
              Paso {step}
            </span>
          )}
          <p
            className="font-extrabold tracking-tight text-balance text-white drop-shadow-lg"
            style={{ fontSize: width < 600 ? 28 : 42, lineHeight: 1.15 }}
          >
            {text}
          </p>
        </div>
      )}
      <div
        className="pointer-events-none absolute inset-x-0 z-[2060] flex justify-center px-4"
        style={{ [placement]: inset, opacity: swap, transform: `scale(${0.92 + 0.08 * swap})` }}
      >
        <p
          ref={pill}
          className="flex max-w-full items-center gap-2.5 rounded-2xl bg-neutral-900/90 py-2 pr-4 pl-2 text-[15px] font-semibold text-white shadow-xl"
        >
          {step !== undefined && (
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs">
              {step}
            </span>
          )}
          <span className="text-balance">{text}</span>
        </p>
      </div>
    </>
  );
}
