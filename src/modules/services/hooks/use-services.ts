import { apiAxiosInstance, type HttpError } from '@/api/config';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface IService {
  id: string;
  name: string;
  iconUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceBody {
  name: string;
  iconUrl?: string;
}

const SERVICES_KEY = ['services'];

export const useServices = () =>
  useQuery<IService[], HttpError>({
    queryKey: SERVICES_KEY,
    queryFn: () =>
      apiAxiosInstance.get<IService[]>('/services').then(({ data }) => data),
  });

const useInvalidateServices = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: SERVICES_KEY });
};

export const useCreateService = (onSuccess?: () => void) => {
  const invalidate = useInvalidateServices();
  return useMutation<IService, HttpError, ServiceBody>({
    mutationFn: body =>
      apiAxiosInstance.post<IService>('/services', body).then(({ data }) => data),
    onSuccess: () => {
      invalidate();
      onSuccess?.();
    },
  });
};

export const useUpdateService = (onSuccess?: () => void) => {
  const invalidate = useInvalidateServices();
  return useMutation<IService, HttpError, { id: string; body: ServiceBody }>({
    mutationFn: ({ id, body }) =>
      apiAxiosInstance
        .patch<IService>(`/services/${id}`, body)
        .then(({ data }) => data),
    onSuccess: () => {
      invalidate();
      onSuccess?.();
    },
  });
};

export const useDeleteService = () => {
  const invalidate = useInvalidateServices();
  return useMutation<unknown, HttpError, string>({
    mutationFn: id => apiAxiosInstance.delete(`/services/${id}`),
    onSuccess: () => invalidate(),
  });
};
