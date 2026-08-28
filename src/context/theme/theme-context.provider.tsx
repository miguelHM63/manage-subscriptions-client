import { useCallback, useEffect, useState, type ReactNode } from 'react';

import { LOCAL_STORAGE_THEME } from '@/constants';
import { useStorage } from '@/hooks/use-storage';
import { ThemeContext } from './theme-context';
import type { ThemeMode } from './theme-context.interfaces';

const DARK_QUERY = '(prefers-color-scheme: dark)';

const resolveIsDark = (mode: ThemeMode): boolean =>
  mode === 'dark' ||
  (mode === 'system' &&
    typeof window !== 'undefined' &&
    window.matchMedia(DARK_QUERY).matches);

const applyDarkClass = (isDark: boolean) => {
  document.documentElement.classList.toggle('dark', isDark);
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { getItem, setItem } = useStorage();

  const [mode, setModeState] = useState<ThemeMode>(
    () => (getItem(LOCAL_STORAGE_THEME) as ThemeMode) || 'system',
  );
  const [isDark, setIsDark] = useState<boolean>(() => resolveIsDark(mode));

  const setMode = useCallback(
    (next: ThemeMode) => {
      setModeState(next);
      setItem(LOCAL_STORAGE_THEME, next);
      const dark = resolveIsDark(next);
      setIsDark(dark);
      applyDarkClass(dark);
    },
    [setItem],
  );

  // Mantiene sincronizada la clase al cambiar de modo.
  useEffect(() => {
    applyDarkClass(isDark);
  }, [isDark]);

  // En modo 'system', sigue los cambios de preferencia del SO en vivo.
  useEffect(() => {
    if (mode !== 'system') return;
    const media = window.matchMedia(DARK_QUERY);
    const onChange = () => {
      setIsDark(media.matches);
      applyDarkClass(media.matches);
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, isDark, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
