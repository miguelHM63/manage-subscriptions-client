import { useSyncExternalStore } from 'react';

// Mismo corte que Tailwind `md` (768px): por debajo es la versión móvil.
const QUERY = '(max-width: 767.98px)';

const subscribe = (onChange: () => void) => {
  const media = window.matchMedia(QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
};

/** `true` en pantallas menores a `md`. Correcto desde el primer render. */
export const useIsMobile = (): boolean =>
  useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
