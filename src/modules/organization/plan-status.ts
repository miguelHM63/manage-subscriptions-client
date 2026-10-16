import { daysUntil } from '@/helpers/dates';
import type { IMyOrganization } from './hooks/use-my-organization';
import { PLAN_RENEWAL_NOTICE_DAYS } from './plans';

/**
 * Estado del plan para la UI:
 * - `free`: sin plan de pago.
 * - `active`: de pago, vigente (o sin vencimiento).
 * - `expiring`: vence en ≤ PLAN_RENEWAL_NOTICE_DAYS días.
 * - `grace`: ya venció pero conserva sus límites unos días.
 * - `expired`: venció; aplican los límites de Free.
 */
export type PlanHealth = 'free' | 'active' | 'expiring' | 'grace' | 'expired';

type PlanFields = Pick<IMyOrganization, 'plan' | 'planStatus' | 'planValidUntil'>;

export function planHealth(org: PlanFields): { health: PlanHealth; days?: number } {
  if (org.plan === 'free') return { health: 'free' };
  const days = org.planValidUntil ? daysUntil(org.planValidUntil) : undefined;
  if (org.planStatus === 'expired') return { health: 'expired', days };
  if (org.planStatus === 'grace') return { health: 'grace', days };
  if (days !== undefined && days <= PLAN_RENEWAL_NOTICE_DAYS) return { health: 'expiring', days };
  return { health: 'active', days };
}
