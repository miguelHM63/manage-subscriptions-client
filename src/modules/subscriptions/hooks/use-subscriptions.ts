import { apiAxiosInstance, type HttpError } from '@/api/config';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export type SubscriptionStatus =
  | 'active'
  | 'expiring_soon'
  | 'expired'
  | 'cancelled'
  | 'paused';

export type PaymentMethod =
  | 'cash'
  | 'transfer'
  | 'card'
  | 'yape'
  | 'plin'
  | 'other';

export interface ISubscription {
  id: string;
  customerId: string;
  serviceId: string;
  providerAccountId: string;
  startDate: string;
  endDate: string;
  durationMonths: number;
  price: number;
  seats: number;
  fullAccount: boolean;
  status: SubscriptionStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSubscriptionBody {
  customerId: string;
  serviceId: string;
  providerAccountId: string;
  durationMonths: number;
  price: number;
  fullAccount?: boolean;
  startDate?: string;
}

export interface RenewBody {
  amount: number;
  method?: PaymentMethod;
  date?: string;
}

const KEY = ['subscriptions'];

export const useSubscriptions = () =>
  useQuery<ISubscription[], HttpError>({
    queryKey: KEY,
    queryFn: () =>
      apiAxiosInstance
        .get<ISubscription[]>('/subscriptions')
        .then(({ data }) => data),
  });

const useInvalidateSubscriptions = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: KEY });
    // Crear/cancelar afecta los cupos de las cuentas madre.
    queryClient.invalidateQueries({ queryKey: ['provider-accounts'] });
  };
};

export const useCreateSubscription = (onSuccess?: () => void) => {
  const invalidate = useInvalidateSubscriptions();
  return useMutation<ISubscription, HttpError, CreateSubscriptionBody>({
    mutationFn: body =>
      apiAxiosInstance
        .post<ISubscription>('/subscriptions', body)
        .then(({ data }) => data),
    onSuccess: () => {
      invalidate();
      onSuccess?.();
    },
  });
};

export const useRenewSubscription = (onSuccess?: () => void) => {
  const invalidate = useInvalidateSubscriptions();
  return useMutation<unknown, HttpError, { id: string; body: RenewBody }>({
    mutationFn: ({ id, body }) =>
      apiAxiosInstance.post(`/subscriptions/${id}/renew`, body),
    onSuccess: () => {
      invalidate();
      onSuccess?.();
    },
  });
};

type SubscriptionAction = 'cancel' | 'pause' | 'resume';

export const useSubscriptionAction = () => {
  const invalidate = useInvalidateSubscriptions();
  return useMutation<unknown, HttpError, { id: string; action: SubscriptionAction }>({
    mutationFn: ({ id, action }) =>
      apiAxiosInstance.post(`/subscriptions/${id}/${action}`),
    onSuccess: () => invalidate(),
  });
};
