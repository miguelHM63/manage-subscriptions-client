import { apiAxiosInstance, type HttpError } from '@/api/config';
import type { IUser } from '@/types/user.interfaces';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export type IGetUserListResponse = IUser;

export const useGetUserList = () => {
  return useQuery<IGetUserListResponse[], HttpError>({
    queryFn: () => apiAxiosInstance.get<IGetUserListResponse[]>(`/users`).then(({ data }) => data),
    queryKey: ['users'],
  });
};

export const useInvalidateUserList = () => {
  const queryClient = useQueryClient();

  return () => queryClient.invalidateQueries({ queryKey: ['users'] });
};
