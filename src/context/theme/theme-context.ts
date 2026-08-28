import { createContext } from 'react';
import type { IThemeContext } from './theme-context.interfaces';

export const initialState: IThemeContext = {
  mode: 'system',
  isDark: false,
  setMode: () => {},
};

export const ThemeContext = createContext(initialState);
