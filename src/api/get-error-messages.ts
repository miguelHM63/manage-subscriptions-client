import { ERROR_NAMESPACES } from '@/constants';
import i18next from 'i18next';

/* const VALIDATION_NAMESPACES = 'validation'; */

const tHttpError = i18next.getFixedT(null, ERROR_NAMESPACES, 'byHttpCode');
export const getHttpErrorMessage = (status: string) => {
  return tHttpError(status, { defaultValue: getUnknownError() });
};

const tApiError = i18next.getFixedT(null, ERROR_NAMESPACES, 'byDomainCode');
export const getApiErrorMessage = (code: string) =>
  tApiError(code, { defaultValue: getUnknownError() });
export const getUnknownError = () => i18next.t('unknown', { ns: ERROR_NAMESPACES });

// TODO: check this implementation
/* export function translateValidationErrors(apiErrors: any[]) {
  return apiErrors.map((item: { errors: any[] }) => ({
    ...item,
    errors: item.errors.map((error: any) => {
      return i18next.t(error, {
        ns: VALIDATION_NAMESPACES,
        defaultValue: error,
      });
    }),
  }));
}
 */
