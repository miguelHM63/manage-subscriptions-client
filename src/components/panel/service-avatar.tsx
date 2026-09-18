import { Avatar } from 'antd';
import { useState } from 'react';

import { resolveLogoUrl } from '@/helpers/logo-url';

// Paleta determinística para el fallback (inicial + color) cuando no hay logo.
const COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#ef4444',
  '#14b8a6',
];

function colorFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

interface ServiceAvatarProps {
  name: string;
  iconUrl?: string;
  size?: number;
}

/**
 * Logo del servicio (iconUrl) o, si no hay o no carga, su inicial sobre un
 * color estable.
 */
export function ServiceAvatar({ name, iconUrl, size = 32 }: ServiceAvatarProps) {
  const src = resolveLogoUrl(iconUrl);
  // Guarda qué URL falló (no un booleano) para reintentar si cambia el logo.
  const [failedSrc, setFailedSrc] = useState<string>();

  if (src && src !== failedSrc) {
    return (
      <Avatar
        src={src}
        size={size}
        shape="square"
        onError={() => {
          setFailedSrc(src);
          return false;
        }}
      />
    );
  }

  const initial = (name?.trim()?.[0] ?? '?').toUpperCase();
  return (
    <Avatar
      size={size}
      shape="square"
      style={{ backgroundColor: colorFor(name || '?') }}
    >
      {initial}
    </Avatar>
  );
}
