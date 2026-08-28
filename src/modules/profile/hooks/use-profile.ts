import { apiAxiosInstance, type HttpError } from '@/api/config';
import type { IUser } from '@/types/user.interfaces';
import { useMutation, useQuery } from '@tanstack/react-query';

export interface ProfileBody {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
}

export const useMe = () =>
  useQuery<IUser, HttpError>({
    queryKey: ['me'],
    queryFn: () => apiAxiosInstance.get<IUser>('/users/me').then(({ data }) => data),
  });

export const useUpdateProfile = (onSuccess?: (user: IUser) => void) =>
  useMutation<IUser, HttpError, ProfileBody>({
    mutationFn: body =>
      apiAxiosInstance.patch<IUser>('/users/me', body).then(({ data }) => data),
    onSuccess,
  });
