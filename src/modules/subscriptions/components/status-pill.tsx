import cn from '@/helpers/cn';
import type { SubscriptionStatus } from '../hooks/use-subscriptions';
import { STATUS_META } from '../subscription-meta';

const TONES: Record<SubscriptionStatus, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
  expiring_soon: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  expired: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  paused: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  cancelled: 'bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300',
};

/** Estado de la suscripción con su color (el calculado por el backend). */
export function StatusPill({
  status,
  className,
}: {
  status: SubscriptionStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold whitespace-nowrap',
        TONES[status],
        className,
      )}
    >
      {STATUS_META[status].label}
    </span>
  );
}

/** Color del texto de días restantes / barra de vigencia según el estado. */
export const DUE_TEXT: Record<SubscriptionStatus, string> = {
  active: 'text-content-muted',
  expiring_soon: 'text-amber-600 dark:text-amber-300',
  expired: 'text-danger',
  paused: 'text-content-subtle',
  cancelled: 'text-content-subtle',
};

export const DUE_BAR: Record<SubscriptionStatus, string> = {
  active: 'bg-success',
  expiring_soon: 'bg-warning',
  expired: 'bg-danger',
  paused: 'bg-content-subtle',
  cancelled: 'bg-content-subtle',
};
