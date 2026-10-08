import { DeleteOutlined, EditOutlined, MoreOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Dropdown } from 'antd';
import type { ReactNode } from 'react';

import { ServiceAvatar } from '@/components/panel/service-avatar';
import cn from '@/helpers/cn';
import type { IService } from '../hooks/use-services';

export interface ServiceStats {
  accounts: number;
  active: number;
  free: number;
}

interface ServiceCardProps {
  service: Pick<IService, 'name' | 'iconUrl'>;
  stats?: ServiceStats;
  onEdit: () => void;
  onDelete: () => void;
}

/** Tarjeta del catálogo: logo, cuentas/vigentes y cupos libres del servicio. */
export function ServiceCard({ service, stats: s, onEdit, onDelete }: ServiceCardProps) {
  return (
    <article className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-3.5 shadow-sm">
      <div className="flex items-start justify-between">
        <ServiceAvatar name={service.name} iconUrl={service.iconUrl} size={44} />
        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              { key: 'edit', label: 'Editar', icon: <EditOutlined /> },
              { key: 'delete', label: 'Eliminar', icon: <DeleteOutlined />, danger: true },
            ],
            onClick: ({ key }) => (key === 'edit' ? onEdit() : onDelete()),
          }}
        >
          <Button
            type="text"
            aria-label={`Acciones de ${service.name}`}
            icon={<MoreOutlined />}
            className="!-mt-1 !-mr-2 !h-10 !w-10"
          />
        </Dropdown>
      </div>
      <div className="min-w-0">
        <p className="truncate font-bold text-content">{service.name}</p>
        <p className="mt-0.5 truncate text-xs text-content-muted">
          {s?.accounts ?? 0} cuenta{s?.accounts === 1 ? '' : 's'} · {s?.active ?? 0} vigente
          {s?.active === 1 ? '' : 's'}
        </p>
      </div>
      <p className={cn('text-xs font-semibold', s?.free ? 'text-success' : 'text-content-subtle')}>
        {s?.free
          ? `${s.free} cupo${s.free === 1 ? '' : 's'} libre${s.free === 1 ? '' : 's'}`
          : 'Sin cupos libres'}
      </p>
    </article>
  );
}

/** Última celda de la cuadrícula: alta de un servicio nuevo. */
export function AddServiceTile({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-36 flex-col items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed border-border text-brand-ink transition-colors hover:bg-surface-hover"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-xl dark:bg-brand-400/15">
        <PlusOutlined />
      </span>
      <span className="text-sm font-semibold">Agregar servicio</span>
    </button>
  );
}

/** Cuadrícula del catálogo (tarjetas + celda de alta). */
export function ServicesGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">{children}</div>;
}
