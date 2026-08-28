import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

import cn from '@/helpers/cn';
import { useAuth } from '@/hooks/use-auth';
import { PROFILE_ROUTE } from '@/routes/routes';
import { PANEL_NAV_ITEMS } from './panel-nav-items';
import { ThemeToggle } from './theme-toggle';

// El color va en este <span> interno (no en el <a>) para no ser pisado por el
// reset de enlaces de AntD (`a { color: colorLink }`).
function SidebarLink({
  to,
  icon,
  label,
}: {
  to: string;
  icon: ReactNode;
  label: string;
}) {
  return (
    <NavLink to={to} className="block">
      {({ isActive }) => (
        <span
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            isActive
              ? 'bg-brand-primary text-white'
              : 'text-content-muted hover:bg-surface-hover',
          )}
        >
          <span className="text-lg">{icon}</span>
          <span>{label}</span>
        </span>
      )}
    </NavLink>
  );
}

/** Navegación lateral para pantallas medianas en adelante (oculta en móvil). */
export function PanelSidebar() {
  const { logout } = useAuth();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface md:flex">
      <div className="flex h-16 items-center px-6">
        <span className="text-xl font-black text-brand-primary">Plancito</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {PANEL_NAV_ITEMS.map(item => (
          <SidebarLink key={item.to} to={item.to} icon={item.icon} label={item.label} />
        ))}
        <SidebarLink to={PROFILE_ROUTE} icon={<UserOutlined />} label="Mi cuenta" />
      </nav>

      <div className="space-y-1 border-t border-border p-3">
        <div className="flex items-center justify-between rounded-lg px-3 py-2">
          <span className="text-sm font-medium text-content-muted">Modo oscuro</span>
          <ThemeToggle />
        </div>
        <button
          type="button"
          onClick={() => logout?.()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-content-muted transition-colors hover:text-danger"
        >
          <LogoutOutlined />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
