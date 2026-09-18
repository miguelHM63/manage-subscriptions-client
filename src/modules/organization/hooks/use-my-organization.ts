import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiAxiosInstance, type HttpError } from '@/api/config';

export type Plan = 'free' | 'pro' | 'business';

export interface IMyOrganization {
  id: string;
  name: string;
  plan: Plan;
  billingCycle: 'monthly' | 'semiannual' | 'annual';
  planValidUntil?: string;
  /** -1 = ilimitado. */
  limits: { maxCustomers: number; maxSeats: number };
  usage: { customers: number };
}

export const PLAN_LABEL: Record<Plan, string> = {
  free: 'Free',
  pro: 'Pro',
  business: 'Business',
};

const KEY = ['organizations', 'me'];

export const useMyOrganization = () =>
  useQuery<IMyOrganization, HttpError>({
    queryKey: KEY,
    queryFn: () =>
      apiAxiosInstance.get<IMyOrganization>('/organizations/me').then(({ data }) => data),
  });

export const useUpdateMyOrganization = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation<IMyOrganization, HttpError, { name: string }>({
    mutationFn: body =>
      apiAxiosInstance.patch<IMyOrganization>('/organizations/me', body).then(({ data }) => data),
    onSuccess: data => {
      queryClient.setQueryData(KEY, data);
      onSuccess?.();
    },
  });
};

/** El uso cambia al crear/eliminar clientes: refrescar tras esas acciones. */
export const invalidateMyOrganization = (queryClient: ReturnType<typeof useQueryClient>) =>
  queryClient.invalidateQueries({ queryKey: KEY });
