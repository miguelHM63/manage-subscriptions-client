import { apiAxiosInstance, type HttpError } from '@/api/config';
import type { ISubscription } from '@/modules/subscriptions/hooks/use-subscriptions';
import { useQuery } from '@tanstack/react-query';

/** Historial de suscripciones de un cliente (todas las que ha tenido). */
export const useCustomerSubscriptions = (customerId?: string) =>
  useQuery<ISubscription[], HttpError>({
    queryKey: ['subscriptions', { customerId }],
    enabled: Boolean(customerId),
    queryFn: () =>
      apiAxiosInstance
        .get<ISubscription[]>('/subscriptions', { params: { customerId } })
        .then(({ data }) => data),
  });
