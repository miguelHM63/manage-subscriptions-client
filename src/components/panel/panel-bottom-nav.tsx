import { NavLink } from 'react-router-dom';

import cn from '@/helpers/cn';
import { PANEL_NAV_ITEMS } from './panel-nav-items';

/** Barra de navegación inferior fija para móvil (oculta en escritorio). */
export function PanelBottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 flex border-t border-border bg-surface md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {PANEL_NAV_ITEMS.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          className="flex min-h-14 flex-1 flex-col items-center justify-center gap-1 py-1.5"
        >
          {({ isActive }) => (
            <>
              <span
                className={cn(
                  'flex h-7 w-14 items-center justify-center rounded-full text-2xl transition-colors',
                  isActive
                    ? 'bg-brand-500/15 text-brand-ink dark:bg-brand-400/20'
                    : 'text-content-muted',
                )}
              >
                {item.icon}
              </span>
              <span
                className={cn(
                  'text-[11px] font-medium leading-none',
                  isActive ? 'text-brand-ink' : 'text-content-muted',
                )}
              >
                {item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
