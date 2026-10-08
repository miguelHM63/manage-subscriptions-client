import { useEffect } from 'react';

const HREF =
  'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600..800&display=swap';

/** Carga la tipografía de titulares de los diseños solo cuando se usan. */
export function useDisplayFont() {
  useEffect(() => {
    if (document.querySelector(`link[href="${HREF}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = HREF;
    document.head.appendChild(link);
  }, []);
}
