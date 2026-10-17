import { useId } from 'react';

import { APP_NAME } from '@/config';
import cn from '@/helpers/cn';

/**
 * Isotipo (`public/plancito-icon.svg`): una "P" con un "play" recortado y dos
 * ondas de señal, sobre el indigo de marca. El "play" es un hueco real (máscara),
 * así que se ve bien aunque `className` cambie el fondo.
 */
export function BrandMark({ size = 32, className }: { size?: number; className?: string }) {
  const maskId = useId();
  return (
    <span
      aria-hidden
      className={cn('flex shrink-0 items-center justify-center bg-brand-600', className)}
      style={{ width: size, height: size, borderRadius: Math.round(size * 0.23) }}
    >
      <svg width={size} height={size} viewBox="0 0 280 280" fill="none">
        {/* userSpaceOnUse: por defecto la máscara usa la caja sin el grosor
            del trazo y recortaría los bordes de la "P". */}
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="280" height="280">
          <rect width="280" height="280" fill="#ffffff" />
          <path
            d="M121 116 L121 144 L145 130 Z"
            fill="#000000"
            stroke="#000000"
            strokeWidth={6}
            strokeLinejoin="round"
          />
        </mask>
        <g mask={`url(#${maskId})`}>
          <path d="M91 200 V88" stroke="#ffffff" strokeWidth={30} strokeLinecap="round" />
          <path
            d="M91 88 H126 a42 42 0 0 1 0 84 H91 Z"
            fill="#ffffff"
            stroke="#ffffff"
            strokeWidth={30}
            strokeLinejoin="round"
          />
        </g>
        <path
          d="M191.5 84 A80 80 0 0 1 191.5 176"
          stroke="#ffffff"
          strokeWidth={11}
          strokeLinecap="round"
        />
        <path
          d="M206 74 A98 98 0 0 1 206 186"
          stroke="#ffffff"
          strokeOpacity={0.55}
          strokeWidth={11}
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

/** Isotipo + nombre del producto. */
export function BrandLogo({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <BrandMark size={size} />
      <span
        className="font-black tracking-tight text-brand-ink"
        style={{ fontSize: Math.round(size * 0.62) }}
      >
        {APP_NAME}
      </span>
    </span>
  );
}
