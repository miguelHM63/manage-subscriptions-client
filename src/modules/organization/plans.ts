import type { Plan } from './hooks/use-my-organization';

export interface PlanOffer {
  plan: Plan;
  price: string;
  /** Precio anual (2 meses gratis), si aplica. */
  annual?: string;
  customers: string;
  features: { label: string; soon?: boolean }[];
}

/**
 * Oferta de planes (docs/discovery.md §5b). Lo que aún no está construido va
 * marcado `soon` para no venderlo como disponible.
 */
export const PLAN_OFFERS: PlanOffer[] = [
  {
    plan: 'free',
    price: 'S/ 0',
    customers: '20 clientes',
    features: [{ label: '20 clientes' }, { label: 'Recordatorios manuales' }],
  },
  {
    plan: 'pro',
    price: 'S/ 10',
    annual: 'S/ 100',
    customers: '200 clientes',
    features: [
      { label: '200 clientes' },
      { label: 'Avisos por Telegram', soon: true },
      { label: 'Recordatorios automáticos', soon: true },
    ],
  },
  {
    plan: 'business',
    price: 'S/ 20',
    annual: 'S/ 200',
    customers: 'Clientes ilimitados',
    features: [
      { label: 'Clientes ilimitados' },
      { label: 'Sub-vendedores', soon: true },
      { label: 'WhatsApp automático', soon: true },
    ],
  },
];
