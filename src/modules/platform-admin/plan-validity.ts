import dayjs from 'dayjs';

import type { BillingCycle, Plan } from '@/modules/organization/hooks/use-my-organization';
import { PLAN_PRICES } from '@/modules/organization/plans';
import type { IAdminOrganization } from './hooks/use-admin-organizations';

export const CYCLE_MONTHS: Record<BillingCycle, number> = {
  monthly: 1,
  semiannual: 6,
  annual: 12,
};

const monthlyPrice = (plan: Plan) => (plan === 'free' ? 0 : PLAN_PRICES[plan].monthly);

/**
 * Vista previa de la vigencia que dejará un pago. Replica la regla de la API
 * (Organization.nextValidity):
 * - Vencido, Free o sin fecha: desde hoy.
 * - Mismo plan (vigente o en gracia) o cambio en gracia: desde el vencimiento.
 * - Cambio de plan vigente: desde hoy + los días restantes convertidos al
 *   nuevo plan según la relación de precios (prorrateo).
 */
export function previewValidity(org: IAdminOrganization, plan: Plan, cycle: BillingCycle) {
  const now = dayjs();
  const months = CYCLE_MONTHS[cycle];
  const end = org.planValidUntil ? dayjs(org.planValidUntil) : undefined;
  const live = org.plan !== 'free' && end && org.planStatus !== 'expired';

  if (!live || !end)
    return { from: now, until: now.add(months, 'month'), stacks: false, creditDays: 0 };
  if (plan === org.plan || org.planStatus === 'grace') {
    return { from: end, until: end.add(months, 'month'), stacks: true, creditDays: 0 };
  }

  const remainingDays = end.diff(now, 'day', true);
  const creditDays = Math.round((remainingDays * monthlyPrice(org.plan)) / monthlyPrice(plan));
  return {
    from: now,
    until: now.add(months, 'month').add(creditDays, 'day'),
    stacks: false,
    creditDays,
  };
}
