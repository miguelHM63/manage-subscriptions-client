import type {
  ISubscription,
  SubscriptionStatus,
} from '@/modules/subscriptions/hooks/use-subscriptions';

// Prioridad para resumir a un cliente con su estado "más urgente".
const PRIORITY: SubscriptionStatus[] = [
  'expired',
  'expiring_soon',
  'active',
  'paused',
  'cancelled',
];

export interface CustomerSummary {
  /** Suscripciones no canceladas. */
  current: ISubscription[];
  /** Estado más urgente entre las no canceladas (undefined si no tiene). */
  status?: SubscriptionStatus;
  /** Suma de precios de las vencidas (lo que debe). */
  due: number;
  /** Aporte mensual de las vigentes. */
  monthly: number;
}

/** Resumen por cliente a partir de todas las suscripciones. */
export function summarizeByCustomer(subscriptions: ISubscription[]): Map<string, CustomerSummary> {
  const map = new Map<string, CustomerSummary>();
  for (const sub of subscriptions) {
    const entry = map.get(sub.customerId) ?? { current: [], due: 0, monthly: 0 };
    if (sub.status !== 'cancelled') {
      entry.current.push(sub);
      if (!entry.status || PRIORITY.indexOf(sub.status) < PRIORITY.indexOf(entry.status)) {
        entry.status = sub.status;
      }
    }
    if (sub.status === 'expired') entry.due += sub.price;
    if (sub.status === 'active' || sub.status === 'expiring_soon') {
      entry.monthly += sub.price / (sub.durationMonths || 1);
    }
    map.set(sub.customerId, entry);
  }
  return map;
}
