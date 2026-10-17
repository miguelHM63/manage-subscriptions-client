import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiAxiosInstance, type HttpError } from '@/api/config';

export type Plan = 'free' | 'pro' | 'business';

export type BillingCycle = 'monthly' | 'semiannual' | 'annual';

/**
 * `grace`: venció hace pocos días pero conserva sus límites.
 * `expired`: pasó la gracia; aplican los límites de Free (`effectivePlan`).
 */
export type PlanStatus = 'active' | 'grace' | 'expired';

export interface IMyOrganization {
  id: string;
  name: string;
  /** Ruta (relativa a la API) de la foto del negocio, si subió una. */
  logoUrl?: string;
  /** Plan contratado. */
  plan: Plan;
  /** Plan cuyos límites aplican hoy (Free si el de pago venció). */
  effectivePlan: Plan;
  planStatus: PlanStatus;
  billingCycle: BillingCycle;
  planValidUntil?: string;
  /** -1 = ilimitado. */
  limits: { maxCustomers: number; maxSeats: number; maxReceiptsPerMonth: number };
  /** `receipts`: comprobantes de cobro subidos este mes. */
  usage: { customers: number; receipts?: number };
}

export const PLAN_LABEL: Record<Plan, string> = {
  free: 'Free',
  pro: 'Pro',
  business: 'Business',
};

export const BILLING_CYCLE_LABEL: Record<BillingCycle, string> = {
  monthly: 'Mensual',
  semiannual: 'Semestral',
  annual: 'Anual',
};

/** Pago de un plan (registrado a mano por el equipo de Plancito). */
export interface IPlanPayment {
  id: string;
  plan: Plan;
  billingCycle: BillingCycle;
  /** Céntimos. */
  amount: number;
  note?: string;
  validFrom: string;
  validUntil: string;
  /** Días del plan anterior convertidos al nuevo al cambiar de plan. */
  creditDays: number;
  hasReceipt: boolean;
  /** Quién subió el comprobante: el equipo o el propio dueño. */
  receiptSource?: 'admin' | 'owner';
  receiptUploadedAt?: string;
  createdAt: string;
}

export const MY_ORGANIZATION_KEY = ['organizations', 'me'];
const KEY = MY_ORGANIZATION_KEY;

export const useMyOrganization = () =>
  useQuery<IMyOrganization, HttpError>({
    queryKey: KEY,
    queryFn: () =>
      apiAxiosInstance.get<IMyOrganization>('/organizations/me').then(({ data }) => data),
  });

export const useMyPlanPayments = (enabled = true) =>
  useQuery<IPlanPayment[], HttpError>({
    queryKey: [...KEY, 'plan-payments'],
    enabled,
    queryFn: () =>
      apiAxiosInstance
        .get<IPlanPayment[]>('/organizations/me/plan-payments')
        .then(({ data }) => data),
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
