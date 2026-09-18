import cn from '@/helpers/cn';
import { useAuth } from '@/hooks/use-auth';

/** Iniciales del usuario (nombre + apellido, o el correo). */
export const userInitials = (
  firstName?: string,
  lastName?: string,
  email?: string,
): string => {
  const fromName = [firstName, lastName]
    .map(part => part?.trim()?.[0])
    .filter(Boolean)
    .join('');
  return (fromName || email?.[0] || '?').toUpperCase();
};

/** Iniciales de un nombre completo: "Luis Ramírez" → "LR". */
export const nameInitials = (name: string): string => {
  const [first, second] = name.trim().split(/\s+/);
  return userInitials(first, second);
};

/** Avatar con las iniciales del usuario logueado. */
export function UserAvatar({ size = 32, className }: { size?: number; className?: string }) {
  const { user } = useAuth();
  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-brand-50 font-bold text-brand-ink dark:bg-brand-400/15',
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
    >
      {userInitials(user?.profile?.firstName, user?.profile?.lastName, user?.email)}
    </span>
  );
}
