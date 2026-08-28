import { Outlet } from 'react-router-dom';

import { PanelSidebar } from '@/components/panel/panel-sidebar';
import { PanelBottomNav } from '@/components/panel/panel-bottom-nav';
import { PanelTopBar } from '@/components/panel/panel-top-bar';

/**
 * Shell del panel, mobile-first:
 * - Móvil: top-bar + contenido + bottom-nav fija.
 * - Escritorio (md+): sidebar lateral + contenido.
 */
export function PanelLayout() {
  return (
    <div className="flex min-h-screen bg-surface-muted">
      <PanelSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <PanelTopBar />
        <main className="flex-1 px-4 py-4 pb-24 md:px-8 md:py-6 md:pb-8">
          <Outlet />
        </main>
        <PanelBottomNav />
      </div>
    </div>
  );
}
