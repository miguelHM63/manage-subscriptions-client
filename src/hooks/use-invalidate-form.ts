import type { HttpError, InputError } from '@/api/config';
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

    form.setFields(message as InputError[]);
  };

  return [invalidate];
};
