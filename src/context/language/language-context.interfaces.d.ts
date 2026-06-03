import type { Language } from '@/types/language.enum';

export interface ILanguageContext {
  language: Language;
  setLanguage: (lang: Language) => void;
}
