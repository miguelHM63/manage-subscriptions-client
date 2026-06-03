import { LanguageContext } from '@/context/language/language-context';
import { useContext } from 'react';

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LangProvider');
  return context;
};
