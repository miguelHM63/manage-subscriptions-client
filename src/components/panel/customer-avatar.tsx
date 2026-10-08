import { Blobatar } from '@blobatar/react';

import { CountryFlag } from '@/components/country-flag';
import cn from '@/helpers/cn';

interface CustomerAvatarProps {
  /** Semilla estable (id del cliente): el avatar no cambia si se edita el nombre. */
  seed: string;
  size?: number;
  /** `danger` marca al cliente con deuda pendiente. */
  tone?: 'brand' | 'danger';
  /** País del cliente (`PE`): su bandera va en la esquina del avatar. */
  country?: string;
  className?: string;
}

/** Avatar generado (blobatar), determinista por cliente. Estático, sin animación. */
export function CustomerAvatar({
  seed,
  size = 40,
  tone = 'brand',
  country,
  className,
}: CustomerAvatarProps) {
  const avatar = (
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
  if (!country) return avatar;

  // Siempre en la misma esquina, para que se lea igual en toda la lista.
  const flagWidth = Math.max(14, Math.round(size * 0.42));
  return (
    <span className="relative inline-flex shrink-0">
      {avatar}
      <CountryFlag
        code={country}
        width={flagWidth}
        className="absolute -right-1 -bottom-0.5 shadow-sm ring-2 ring-surface"
      />
    </span>
  );
}
