import cn from '@/helpers/cn';
import { PLAN_LABEL, type IMyOrganization } from '@/modules/organization/hooks/use-my-organization';
import { planHealth, type PlanHealth } from '@/modules/organization/plan-status';

const TONES: Record<PlanHealth, string> = {
  free: 'bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300',
  active: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
  expiring: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  grace: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  expired: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
};

const SUFFIX: Partial<Record<PlanHealth, string>> = {
  expiring: ' · por vencer',
  grace: ' · en gracia',
  expired: ' · vencido',
};

/** Plan contratado con el color de su estado de vigencia. */
export function PlanPill({
  org,
  className,
}: {
  org: Pick<IMyOrganization, 'plan' | 'planStatus' | 'planValidUntil'>;
  className?: string;
}) {
  const { health } = planHealth(org);
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold whitespace-nowrap',
        TONES[health],
        className,
      )}
    >
      {PLAN_LABEL[org.plan]}
      {SUFFIX[health]}
    </span>
  );
}
