import dayjs from 'dayjs';
import { type ReactNode, useEffect, useMemo } from 'react';
import { ConfigProvider } from 'antd';
import esES from 'antd/locale/es_ES';
import enUS from 'antd/locale/en_US';
import type { ValidateMessages } from '@rc-component/form/lib/interface';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/hooks/use-language';
import { Language } from '@/types/language.enum';
import type { Locale } from 'antd/es/locale';

const languageMap: Record<Language, Locale> = {
  [Language.English]: enUS,
  [Language.Spanish]: esES,
};

export function AntDProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation('antd');
  const { language } = useLanguage();

  useEffect(() => {
    if (language === Language.Spanish) {
      import('dayjs/locale/es').then(() => dayjs.locale(language));
    } else {
      dayjs.locale(language);
    }
  }, [language]);

  const appLocale = useMemo(() => languageMap[language], [language]);

  return (
    <ConfigProvider
      locale={appLocale}
      theme={{
        // Paleta de marca — ver docs/ui-design.md (espeja los tokens de index.css)
        token: {
          colorPrimary: '#6366F1',
          colorLink: '#6366F1',
          colorInfo: '#3B82F6',
          colorSuccess: '#22C55E',
          colorWarning: '#F59E0B',
          colorError: '#EF4444',
          fontFamily: "'Inter', sans-serif",
          borderRadius: 8,
        },
      }}
      form={{
        validateMessages: t('antd.validateMessages') as ValidateMessages,
      }}
    >
      {children}
    </ConfigProvider>
  );
}
