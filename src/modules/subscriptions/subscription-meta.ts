import type { PaymentMethod, SubscriptionStatus } from './hooks/use-subscriptions';

export const STATUS_META: Record<
  SubscriptionStatus,
  { label: string; color: string }
> = {
  active: { label: 'Activa', color: 'green' },
  expiring_soon: { label: 'Por vencer', color: 'gold' },
  expired: { label: 'Vencida', color: 'red' },
  cancelled: { label: 'Cancelada', color: 'default' },
  paused: { label: 'Pausada', color: 'blue' },
};

export const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'transfer', label: 'Transferencia' },
  { value: 'card', label: 'Tarjeta' },
  { value: 'yape', label: 'Yape' },
  { value: 'plin', label: 'Plin' },
  { value: 'other', label: 'Otro' },
];

export const DURATION_OPTIONS = [
  { value: 1, label: '1 mes' },
  { value: 6, label: '6 meses' },
  { value: 12, label: '12 meses' },
];
