import { apiAxiosInstance, type HttpError } from '@/api/config';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface ICustomer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerBody {
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
}

const CUSTOMERS_KEY = ['customers'];

export const useCustomers = () =>
  useQuery<ICustomer[], HttpError>({
    queryKey: CUSTOMERS_KEY,
    queryFn: () =>
      apiAxiosInstance.get<ICustomer[]>('/customers').then(({ data }) => data),
  });

const useInvalidateCustomers = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY });
};

export const useCreateCustomer = (onSuccess?: () => void) => {
  const invalidate = useInvalidateCustomers();
  return useMutation<ICustomer, HttpError, CustomerBody>({
    mutationFn: body =>
      apiAxiosInstance
        .post<ICustomer>('/customers', body)
        .then(({ data }) => data),
    onSuccess: () => {
      invalidate();
      onSuccess?.();
    },
  });
};

export const useUpdateCustomer = (onSuccess?: () => void) => {
  const invalidate = useInvalidateCustomers();
  return useMutation<ICustomer, HttpError, { id: string; body: CustomerBody }>({
    mutationFn: ({ id, body }) =>
      apiAxiosInstance
        .patch<ICustomer>(`/customers/${id}`, body)
        .then(({ data }) => data),
    onSuccess: () => {
      invalidate();
      onSuccess?.();
    },
  });
};

export const useDeleteCustomer = () => {
  const invalidate = useInvalidateCustomers();
  return useMutation<unknown, HttpError, string>({
    mutationFn: id => apiAxiosInstance.delete(`/customers/${id}`),
    onSuccess: () => invalidate(),
  });
};
