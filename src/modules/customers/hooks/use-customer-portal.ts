import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiAxiosInstance, type HttpError } from '@/api/config';

/** Link de accesos de un cliente (lo que ve el vendedor). */
export interface ICustomerPortal {
  enabled: boolean;
  token?: string;
  pin?: string;
  /** Demasiados fallos de PIN: hay que regenerar el link. */
  blocked?: boolean;
  /** Pausado temporalmente por fallos de PIN. */
  lockedUntil?: string;
  lastAccessAt?: string;
}

const key = (customerId: string) => ['customers', customerId, 'portal'];

export const portalUrl = (token: string) => `${window.location.origin}/c/${token}`;

export const useCustomerPortal = (customerId?: string) =>
  useQuery<ICustomerPortal, HttpError>({
    queryKey: key(customerId ?? ''),
    enabled: Boolean(customerId),
    queryFn: () =>
      apiAxiosInstance
        .get<ICustomerPortal>(`/customers/${customerId}/portal`)
        .then(({ data }) => data),
  });

const usePortalMutation = (customerId: string, method: 'post' | 'delete', path = '') => {
  const queryClient = useQueryClient();
  return useMutation<ICustomerPortal, HttpError, void>({
    mutationFn: () =>
      apiAxiosInstance[method]<ICustomerPortal>(`/customers/${customerId}/portal${path}`).then(
        ({ data }) => data,
      ),
    onSuccess: data => queryClient.setQueryData(key(customerId), data),
  });
};

/** Crea el link o lo regenera (el anterior y su PIN dejan de funcionar). */
export const useRegenerateCustomerPortal = (customerId: string) =>
  usePortalMutation(customerId, 'post');

/** Nuevo PIN con el mismo link (cierra sesiones abiertas y quita bloqueos). */
export const useRegenerateCustomerPortalPin = (customerId: string) =>
  usePortalMutation(customerId, 'post', '/pin');

export const useDisableCustomerPortal = (customerId: string) =>
  usePortalMutation(customerId, 'delete');
