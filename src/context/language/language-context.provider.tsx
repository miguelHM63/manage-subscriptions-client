import React, { useState } from 'react';
import i18n from '@/i18n';
import type { Language } from '@/types/language.enum';
import { LanguageContext } from './language-context';

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLangState] = useState<Language>(i18n.language as Language);

  const setLanguage = (newLang: Language) => {
    i18n.changeLanguage(newLang);
    setLangState(newLang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
