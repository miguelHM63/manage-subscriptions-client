import { Blobatar } from '@blobatar/react';

import cn from '@/helpers/cn';

interface CustomerAvatarProps {
  /** Semilla estable (id del cliente): el avatar no cambia si se edita el nombre. */
  seed: string;
  size?: number;
  /** `danger` marca al cliente con deuda pendiente. */
  tone?: 'brand' | 'danger';
  className?: string;
}

/** Avatar generado (blobatar), determinista por cliente. Estático, sin animación. */
export function CustomerAvatar({ seed, size = 40, tone = 'brand', className }: CustomerAvatarProps) {
  return (
    <Blobatar
      name={seed}
      size={size}
      background="circle"
      alt=""
      aria-hidden
      className={cn(
        'shrink-0 rounded-full',
        tone === 'danger' && 'ring-2 ring-red-500/70 ring-offset-2 ring-offset-surface',
        className,
      )}
    />
  );
}
