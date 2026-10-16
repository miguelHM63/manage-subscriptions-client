import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiAxiosInstance, type HttpError } from '@/api/config';
import type {
  BillingCycle,
  IMyOrganization,
  IPlanPayment,
  Plan,
} from '@/modules/organization/hooks/use-my-organization';

export interface IAdminOrganization extends IMyOrganization {
  /** Usuarios del negocio (dueño + sub-vendedores). */
  members: number;
  createdAt?: string;
  owner?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    createdAt?: string;
  };
}

export const ownerName = (org: IAdminOrganization) =>
  [org.owner?.firstName, org.owner?.lastName].filter(Boolean).join(' ');

export interface PlanPaymentBody {
  plan: Exclude<Plan, 'free'>;
  billingCycle: BillingCycle;
  /** Céntimos. */
  amount: number;
  note?: string;
}

export interface ChangePlanBody {
  plan: Plan;
  billingCycle?: BillingCycle;
  /** Sin fecha, un plan de pago no vence. */
  planValidUntil?: string;
}

const KEY = ['admin', 'organizations'];
const paymentsKey = (organizationId: string) => [...KEY, organizationId, 'plan-payments'];

export const useAdminOrganizations = () =>
  useQuery<IAdminOrganization[], HttpError>({
    queryKey: KEY,
    queryFn: () =>
      apiAxiosInstance.get<IAdminOrganization[]>('/admin/organizations').then(({ data }) => data),
  });

export const usePlanPayments = (organizationId?: string) =>
  useQuery<IPlanPayment[], HttpError>({
    queryKey: paymentsKey(organizationId ?? ''),
    enabled: Boolean(organizationId),
    queryFn: () =>
      apiAxiosInstance
        .get<IPlanPayment[]>(`/admin/organizations/${organizationId}/plan-payments`)
        .then(({ data }) => data),
  });

export const useRegisterPlanPayment = (organizationId: string, onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation<unknown, HttpError, PlanPaymentBody>({
    mutationFn: body =>
      apiAxiosInstance.post(`/admin/organizations/${organizationId}/plan-payments`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
      onSuccess?.();
    },
  });
};

export const useChangePlan = (organizationId: string, onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation<unknown, HttpError, ChangePlanBody>({
    mutationFn: body => apiAxiosInstance.patch(`/admin/organizations/${organizationId}/plan`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
      onSuccess?.();
    },
  });
};
