import { useSubscriptions } from '@/modules/subscriptions/hooks/use-subscriptions';

/** Suscripciones que requieren acción (vencidas o por vencer). */
export const useAttentionCount = (): number => {
  const { data } = useSubscriptions();
  return data?.filter(s => s.status === 'expired' || s.status === 'expiring_soon').length ?? 0;
};
