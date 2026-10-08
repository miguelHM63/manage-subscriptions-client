import { QuestionCircleOutlined, UserOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';

import { BrandLogo } from '@/components/brand-logo';
import { BottomNavItem } from '@/components/panel/panel-bottom-nav';
import { PANEL_NAV_ITEMS } from '@/components/panel/panel-nav-items';
import { SidebarItem } from '@/components/panel/panel-sidebar';
import { UserAvatar } from '@/components/panel/user-avatar';

// Mismo reparto que PanelBottomNav / PanelTopBar.
const BOTTOM_NAV = PANEL_NAV_ITEMS.filter(item => item.mobile !== false);
const SIDEBAR_ONLY = PANEL_NAV_ITEMS.filter(item => item.mobile === false);

interface PanelFrameProps {
  variant: 'desktop' | 'mobile';
  /** Ruta marcada como activa en la navegación. */
  activeRoute: string;
  children: ReactNode;
}

/**
 * Réplica del shell del panel (PanelLayout) con los ítems de navegación reales,
 * pero sin enlaces ni datos: el tutorial decide qué sección está activa.
 * Cada ítem lleva `data-nav` con su ruta para que el cursor lo encuentre.
 */
export function PanelFrame({ variant, activeRoute, children }: PanelFrameProps) {
  if (variant === 'mobile') {
    return (
      <div className="flex h-full flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-4">
          <BrandLogo size={28} />
          {/* Como PanelTopBar: lo que no cabe en la barra inferior va arriba. */}
          <div className="flex items-center">
            {SIDEBAR_ONLY.map(item => (
              <span
                key={item.to}
                data-nav={item.to}
                className="flex h-11 w-11 items-center justify-center text-xl text-content-muted"
              >
                {item.icon}
              </span>
            ))}
            <span className="-mr-1.5 flex h-11 w-11 items-center justify-center">
              <UserAvatar />
            </span>
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-hidden px-4 py-4">{children}</main>
        <nav className="flex shrink-0 border-t border-border bg-surface">
          {BOTTOM_NAV.map(item => (
            <div
              key={item.to}
              data-nav={item.to}
              className="flex min-h-14 flex-1 flex-col items-center justify-center gap-1 py-1.5"
            >
              <BottomNavItem icon={item.icon} label={item.label} active={item.to === activeRoute} />
            </div>
          ))}
        </nav>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-surface">
        <div className="flex h-16 items-center px-6">
          <BrandLogo size={32} />
        </div>
        <nav className="flex flex-col gap-1 px-3">
          {PANEL_NAV_ITEMS.map(item => (
            <div key={item.to} data-nav={item.to}>
              <SidebarItem icon={item.icon} label={item.label} active={item.to === activeRoute} />
            </div>
          ))}
          <SidebarItem icon={<UserOutlined />} label="Mi cuenta" />
          <SidebarItem icon={<QuestionCircleOutlined />} label="Cómo usarlo" />
        </nav>
      </aside>
      <main className="min-w-0 flex-1 overflow-hidden px-8 py-6">{children}</main>
    </div>
  );
}
