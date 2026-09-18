import { useMutation } from '@tanstack/react-query';

import { apiAxiosInstance, type HttpError } from '@/api/config';

/** Envía el correo con el enlace para restablecer la contraseña. */
export const useRecoverPassword = () =>
  useMutation<unknown, HttpError, { email: string }>({
    mutationFn: body => apiAxiosInstance.post('/users/recover-password', body),
  });

/** Cambia la contraseña con el token del enlace. */
export const useResetPassword = () =>
  useMutation<unknown, HttpError, { token: string; password: string }>({
    mutationFn: body => apiAxiosInstance.post('/users/reset-password', body),
  });
