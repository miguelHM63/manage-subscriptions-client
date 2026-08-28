export type ThemeMode = 'light' | 'dark' | 'system';

export interface IThemeContext {
  /** Preferencia elegida por el usuario. */
  mode: ThemeMode;
  /** Tema efectivo aplicado (resuelve 'system'). */
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
}
