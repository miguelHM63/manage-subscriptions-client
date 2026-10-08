import { apiAxiosInstance, type HttpError } from '@/api/config';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface IProviderCredentials {
  username?: string;
  password?: string;
  notes?: string;
}

export interface IProviderAccount {
  id: string;
  serviceId: string;
  label?: string;
  /** Usuario/correo de acceso (solo en el listado; sin contraseña). */
  username?: string;
  capacity: number;
  usedSlots: number;
  availableSlots: number;
  cost: number;
  expiresAt?: string;
  /** Inicio del periodo que paga `cost` (se reinicia al renovar). */
  periodStart?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Cupos libres y costo total de un conjunto de cuentas. */
export const accountTotals = (accounts: IProviderAccount[]) => ({
  free: accounts.reduce((sum, a) => sum + a.availableSlots, 0),
  cost: accounts.reduce((sum, a) => sum + a.cost, 0),
});

export interface ProviderAccountBody {
  serviceId?: string;
  label?: string;
  credentials?: IProviderCredentials;
  capacity?: number;
  cost?: number;
  expiresAt?: string | null;
}

const KEY = ['provider-accounts'];

export const useProviderAccounts = () =>
  useQuery<IProviderAccount[], HttpError>({
    queryKey: KEY,
    queryFn: () =>
      apiAxiosInstance.get<IProviderAccount[]>('/provider-accounts').then(({ data }) => data),
  });

const useInvalidate = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: KEY });
};

export const useCreateProviderAccount = (onSuccess?: () => void) => {
  const invalidate = useInvalidate();
  return useMutation<IProviderAccount, HttpError, ProviderAccountBody>({
    mutationFn: body =>
      apiAxiosInstance.post<IProviderAccount>('/provider-accounts', body).then(({ data }) => data),
    onSuccess: () => {
      invalidate();
      onSuccess?.();
    },
  });
};

export const useUpdateProviderAccount = (onSuccess?: () => void) => {
  const invalidate = useInvalidate();
  return useMutation<IProviderAccount, HttpError, { id: string; body: ProviderAccountBody }>({
    mutationFn: ({ id, body }) =>
      apiAxiosInstance
        .patch<IProviderAccount>(`/provider-accounts/${id}`, body)
        .then(({ data }) => data),
    onSuccess: () => {
      invalidate();
      onSuccess?.();
    },
  });
};

export interface RenewProviderAccountBody {
  expiresAt: string;
  periodStart?: string;
  cost?: number;
}

export const useRenewProviderAccount = (onSuccess?: () => void) => {
  const invalidate = useInvalidate();
  return useMutation<IProviderAccount, HttpError, { id: string; body: RenewProviderAccountBody }>({
    mutationFn: ({ id, body }) =>
      apiAxiosInstance
        .post<IProviderAccount>(`/provider-accounts/${id}/renew`, body)
        .then(({ data }) => data),
    onSuccess: () => {
      invalidate();
      onSuccess?.();
    },
  });
};

export const useDeleteProviderAccount = () => {
  const invalidate = useInvalidate();
  return useMutation<unknown, HttpError, string>({
    mutationFn: id => apiAxiosInstance.delete(`/provider-accounts/${id}`),
    onSuccess: () => invalidate(),
  });
};

export const useProviderCredentials = (id: string | null, enabled: boolean) =>
  useQuery<IProviderCredentials, HttpError>({
    queryKey: ['provider-accounts', id, 'credentials'],
    enabled: enabled && Boolean(id),
    queryFn: () =>
      apiAxiosInstance
        .get<IProviderCredentials>(`/provider-accounts/${id}/credentials`)
        .then(({ data }) => data),
  });
