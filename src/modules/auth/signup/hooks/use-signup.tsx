import { apiAxiosInstance, type HttpError, type MutationCallback } from '@/api/config';
import type { IAuthResponse } from '@/context/auth/auth-context.interfaces';
import { useMutation } from '@tanstack/react-query';

export interface SignupBody {
  businessName: string;
  email: string;
  password: string;
}

export function useSignup({ onSuccess, onError }: MutationCallback<IAuthResponse>) {
  return useMutation<IAuthResponse, HttpError, SignupBody>({
    mutationFn: async formData => {
      const { data } = await apiAxiosInstance.post<IAuthResponse>('/users/sign-up', formData);
      return data;
    },
    onSuccess,
    onError,
  });
}
