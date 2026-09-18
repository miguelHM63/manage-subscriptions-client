import { Link } from 'react-router-dom';

import { PROFILE_ROUTE } from '@/routes/routes';
import { UserAvatar } from './user-avatar';

/**
 * Cabecera superior solo en móvil: marca + acceso a Mi cuenta (ahí viven tema,
 * idioma y cerrar sesión, para no llenar la barra de iconos sueltos).
 */
export function PanelTopBar() {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-surface/95 px-4 backdrop-blur md:hidden">
      <span className="text-lg font-black tracking-tight text-brand-ink">Plancito</span>
      <Link
        to={PROFILE_ROUTE}
        aria-label="Mi cuenta"
        className="-mr-1.5 flex h-11 w-11 items-center justify-center rounded-full"
      >
        <UserAvatar />
      </Link>
    </header>
  );
}
