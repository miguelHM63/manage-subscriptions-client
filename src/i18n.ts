import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import { Language } from './types/language.enum';
import { ERROR_NAMESPACES } from './constants';

await i18n
  .use(HttpApi)
  .use(initReactI18next)
  .init({
    lng: Language.Spanish,
    fallbackLng: Language.Spanish,
    debug: import.meta.env.DEV,
    ns: [ERROR_NAMESPACES],
    defaultNS: 'common',
    returnObjects: true,
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  });

export default i18n;
