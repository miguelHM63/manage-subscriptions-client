import dayjs from 'dayjs';
import { type ReactNode, useEffect, useMemo } from 'react';
import { App as AntdApp, ConfigProvider, theme as antdTheme } from 'antd';
import esES from 'antd/locale/es_ES';
import enUS from 'antd/locale/en_US';
import type { ValidateMessages } from '@rc-component/form/lib/interface';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/hooks/use-language';
import { useTheme } from '@/hooks/use-theme';
import { Language } from '@/types/language.enum';
import type { Locale } from 'antd/es/locale';

const languageMap: Record<Language, Locale> = {
  [Language.English]: enUS,
  [Language.Spanish]: esES,
};

export function AntDProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation('antd');
  const { language } = useLanguage();
  const { isDark } = useTheme();

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
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
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
          // En oscuro, alinea los fondos de AntD a la paleta slate (en vez de
          // los grises por defecto) para que las tarjetas resalten sobre la
          // página y todo combine con los tokens de index.css.
          ...(isDark
            ? {
                colorBgLayout: '#0f172a', // fondo de página (slate-900)
                colorBgContainer: '#1e293b', // tarjetas / inputs (slate-800)
                colorBgElevated: '#1e293b', // modales / dropdowns
                colorBorder: '#334155', // slate-700
                colorBorderSecondary: '#334155',
              }
            : {}),
        },
        // En oscuro, el ítem seleccionado de los menús/dropdowns (p. ej. el
        // selector de tema) necesita texto más claro para buen contraste.
        components: isDark
          ? {
              Menu: {
                itemSelectedColor: '#c7d2fe', // brand-200
                itemSelectedBg: 'rgba(129, 140, 248, 0.18)', // brand-400 tenue
              },
              Select: {
                optionSelectedColor: '#c7d2fe', // brand-200 (texto claro)
                optionSelectedBg: 'rgba(129, 140, 248, 0.18)', // brand-400 tenue
              },
            }
          : undefined,
      }}
      form={{
        validateMessages: t('antd.validateMessages') as ValidateMessages,
      }}
    >
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  );
}
