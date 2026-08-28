import { Avatar } from 'antd';

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

/** Logo del servicio (iconUrl) o, si no hay, su inicial sobre un color estable. */
export function ServiceAvatar({ name, iconUrl, size = 32 }: ServiceAvatarProps) {
  if (iconUrl) {
    return <Avatar src={iconUrl} size={size} shape="square" />;
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
