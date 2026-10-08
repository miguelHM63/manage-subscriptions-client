import { AppstoreOutlined, PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';

import { EmptyState } from '@/components/panel/empty-state';
import { ServiceAvatar } from '@/components/panel/service-avatar';
import { logoForDomain, POPULAR_SERVICES, type PopularService } from '../popular-services';

interface ServicesEmptyStateProps {
  onQuickAdd: (item: PopularService) => void;
  onCreate: () => void;
  /** Nombre del atajo que se está creando (muestra su loading y bloquea el resto). */
  creatingName?: string;
}

/** Catálogo vacío: atajos de un toque para los más vendidos + alta manual. */
export function ServicesEmptyState({
  onQuickAdd,
  onCreate,
  creatingName,
}: ServicesEmptyStateProps) {
  return (
    <EmptyState
      icon={<AppstoreOutlined />}
      title="Agrega los servicios que vendes"
      description="Con ellos organizas tus cuentas, cupos y ventas."
      actions={
        <Button size="large" block icon={<PlusOutlined />} onClick={onCreate}>
          Otro servicio
        </Button>
      }
    >
      <div className="flex w-full flex-col gap-2.5">
        <p className="text-[11px] font-semibold tracking-wider text-content-subtle uppercase">
          Agregar con un toque
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {POPULAR_SERVICES.map(item => (
            <Button
              key={item.domain}
              shape="round"
              loading={creatingName === item.name}
              disabled={Boolean(creatingName) && creatingName !== item.name}
              onClick={() => onQuickAdd(item)}
              className="!h-10 !pl-1.5"
              icon={
                <ServiceAvatar name={item.name} iconUrl={logoForDomain(item.domain)} size={26} />
              }
            >
              {item.name}
            </Button>
          ))}
        </div>
      </div>
    </EmptyState>
  );
}
