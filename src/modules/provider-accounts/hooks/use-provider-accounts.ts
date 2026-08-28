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
  capacity: number;
  usedSlots: number;
  availableSlots: number;
  cost: number;
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

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
      apiAxiosInstance
        .get<IProviderAccount[]>('/provider-accounts')
        .then(({ data }) => data),
  });

const useInvalidate = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: KEY });
};

export const useCreateProviderAccount = (onSuccess?: () => void) => {
  const invalidate = useInvalidate();
  return useMutation<IProviderAccount, HttpError, ProviderAccountBody>({
    mutationFn: body =>
      apiAxiosInstance
        .post<IProviderAccount>('/provider-accounts', body)
        .then(({ data }) => data),
    onSuccess: () => {
      invalidate();
      onSuccess?.();
    },
  });
};

export const useUpdateProviderAccount = (onSuccess?: () => void) => {
  const invalidate = useInvalidate();
  return useMutation<
    IProviderAccount,
    HttpError,
    { id: string; body: ProviderAccountBody }
  >({
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
