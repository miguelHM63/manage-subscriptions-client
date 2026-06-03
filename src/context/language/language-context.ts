import { createContext } from 'react';
import type { ILanguageContext } from './language-context.interfaces';
import { Language } from '@/types/language.enum';

export const initialState: ILanguageContext = {
  language: Language.English,
  setLanguage: () => {},
};

export const LanguageContext = createContext(initialState);
