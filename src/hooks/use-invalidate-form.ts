import type { HttpError } from '@/api/config';
import { type FormInstance } from 'antd';

export const useInvalidateForm = (form: FormInstance) => {
  if (!form) {
    return [() => {}];
  }

  const invalidate = (error: HttpError) => {
    if (!error?.response?.data?.message) {
      return;
    }

    const { message } = error.response.data;

    // Solo los 400 de validación traen errores por campo (array). Los errores
    // de dominio (422) traen un texto y ya se muestran como toast.
    if (!Array.isArray(message)) return;

    form.setFields(message);
  };

  return [invalidate];
};
