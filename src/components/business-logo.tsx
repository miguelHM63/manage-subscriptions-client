import { useState } from 'react';

import { API_URL } from '@/config';
import cn from '@/helpers/cn';
import { nameInitials } from '@/components/panel/user-avatar';

/** La API devuelve la ruta de la foto relativa a ella (`/public/logos/...`). */
const apiAssetUrl = (path: string) => `${API_URL.replace(/\/$/, '')}${path}`;

interface BusinessLogoProps {
  name: string;
  /** Ruta que devuelve la API; sin ella (o si no carga) se ven las iniciales. */
  logoUrl?: string | null;
  /** Tamaño, fondo y borde del círculo: cada diseño pone los suyos. */
  className?: string;
}

/** Foto del negocio en un círculo, o sus iniciales si no subió ninguna. */
export function BusinessLogo({ name, logoUrl, className }: BusinessLogoProps) {
  const [failedUrl, setFailedUrl] = useState<string>();
  const showImage = Boolean(logoUrl) && failedUrl !== logoUrl;

  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-full font-bold',
        className,
      )}
    >
      {showImage ? (
        <img
          src={apiAssetUrl(logoUrl!)}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setFailedUrl(logoUrl!)}
        />
      ) : (
        <span aria-hidden>{nameInitials(name || '?')}</span>
      )}
    </span>
  );
}
