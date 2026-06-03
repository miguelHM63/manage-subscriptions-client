import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export default function useEnumTranslation(entity: string) {
  const { t } = useTranslation('enums', { keyPrefix: entity });
  const translateEnum = useCallback((value: string) => t(value), [t]);
  return { translateEnum };
}
