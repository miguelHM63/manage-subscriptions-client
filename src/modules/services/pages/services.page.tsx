import { AppstoreOutlined, DeleteOutlined, EditOutlined, MoreOutlined, PlusOutlined } from '@ant-design/icons';
import { App, Button, Dropdown, Skeleton } from 'antd';
import { useCallback, useMemo, useState } from 'react';

import { EmptyState } from '@/components/panel/empty-state';
import { Fab } from '@/components/panel/fab';
import { LoadError } from '@/components/panel/load-error';
import { PageHeader } from '@/components/panel/page-header';
import { ServiceAvatar } from '@/components/panel/service-avatar';
import { BRANDFETCH_CLIENT_ID } from '@/config';
import cn from '@/helpers/cn';
import { withErrorBoundary } from '@/hoc/with-error-boundary';
import { useOpenFromQuery } from '@/hooks/use-open-from-query';
import { useProviderAccounts } from '@/modules/provider-accounts/hooks/use-provider-accounts';
import { useSubscriptions } from '@/modules/subscriptions/hooks/use-subscriptions';
import {
  useCreateService,
  useDeleteService,
  useServices,
  type IService,
} from '../hooks/use-services';
import { ServiceFormModal } from '../components/service-form-modal';

// Atajos del estado vacío: los servicios más vendidos, con su dominio para el logo.
const POPULAR = [
  { name: 'Netflix', domain: 'netflix.com' },
  { name: 'Spotify', domain: 'spotify.com' },
  { name: 'Disney+', domain: 'disneyplus.com' },
  { name: 'Max', domain: 'max.com' },
  { name: 'Prime Video', domain: 'primevideo.com' },
  { name: 'YouTube Premium', domain: 'youtube.com' },
];

const logoFor = (domain: string) =>
  BRANDFETCH_CLIENT_ID
    ? `https://cdn.brandfetch.io/${domain}/w/128/h/128?c=${BRANDFETCH_CLIENT_ID}`
    : undefined;

function ServicesPageComponent() {
  const { modal, message } = App.useApp();
  const { data: services, isLoading, isError, refetch, isRefetching } = useServices();
  const { data: accounts } = useProviderAccounts();
  const { data: subscriptions } = useSubscriptions();
  const { mutate: deleteService } = useDeleteService();
  const { mutate: createService, isPending: creating, variables: creatingBody } = useCreateService();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IService | null>(null);

  const openCreate = useCallback(() => {
    setEditing(null);
    setModalOpen(true);
  }, []);
  useOpenFromQuery(openCreate);

  const openEdit = (service: IService) => {
    setEditing(service);
    setModalOpen(true);
  };

  const confirmDelete = (service: IService) => {
    modal.confirm({
      title: `Eliminar "${service.name}"`,
      content: 'Esta acción no se puede deshacer.',
      okText: 'Eliminar',
      okButtonProps: { danger: true },
      cancelText: 'Cancelar',
      onOk: () => deleteService(service.id),
    });
  };

  // Cuentas, suscripciones vigentes y cupos libres por servicio.
  const stats = useMemo(() => {
    const map = new Map<string, { accounts: number; active: number; free: number }>();
    accounts?.forEach(a => {
      const s = map.get(a.serviceId) ?? { accounts: 0, active: 0, free: 0 };
      s.accounts++;
      s.free += a.availableSlots;
      map.set(a.serviceId, s);
    });
    subscriptions
      ?.filter(sub => sub.status === 'active' || sub.status === 'expiring_soon')
      .forEach(sub => {
        const s = map.get(sub.serviceId) ?? { accounts: 0, active: 0, free: 0 };
        s.active++;
        map.set(sub.serviceId, s);
      });
    return map;
  }, [accounts, subscriptions]);

  const hasAny = Boolean(services?.length);

  const quickAdd = (item: (typeof POPULAR)[number]) =>
    createService(
      { name: item.name, iconUrl: logoFor(item.domain) },
      { onSuccess: () => message.success(`${item.name} agregado`) },
    );

  const renderContent = () => {
    if (isError) {
      return <LoadError what="tus servicios" onRetry={() => refetch()} retrying={isRefetching} />;
    }
    if (!isLoading && !hasAny) {
      return (
        <EmptyState
          icon={<AppstoreOutlined />}
          title="Agrega los servicios que vendes"
          description="Con ellos organizas tus cuentas, cupos y ventas."
          actions={
            <Button size="large" block icon={<PlusOutlined />} onClick={openCreate}>
              Otro servicio
            </Button>
          }
        >
          <div className="flex w-full flex-col gap-2.5">
            <p className="text-[11px] font-semibold tracking-wider text-content-subtle uppercase">
              Agregar con un toque
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {POPULAR.map(item => (
                <Button
                  key={item.domain}
                  shape="round"
                  loading={creating && creatingBody?.name === item.name}
                  disabled={creating && creatingBody?.name !== item.name}
                  onClick={() => quickAdd(item)}
                  className="!h-10 !pl-1.5"
                  icon={<ServiceAvatar name={item.name} iconUrl={logoFor(item.domain)} size={26} />}
                >
                  {item.name}
                </Button>
              ))}
            </div>
          </div>
        </EmptyState>
      );
    }

    if (isLoading) {
      return (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="rounded-xl border border-border bg-surface p-4">
              <Skeleton avatar active paragraph={{ rows: 1 }} />
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {services!.map(service => {
          const s = stats.get(service.id);
          return (
            <article
              key={service.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-3.5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <ServiceAvatar name={service.name} iconUrl={service.iconUrl} size={44} />
                <Dropdown
                  trigger={['click']}
                  menu={{
                    items: [
                      { key: 'edit', label: 'Editar', icon: <EditOutlined /> },
                      { key: 'delete', label: 'Eliminar', icon: <DeleteOutlined />, danger: true },
                    ],
                    onClick: ({ key }) => (key === 'edit' ? openEdit(service) : confirmDelete(service)),
                  }}
                >
                  <Button type="text" aria-label={`Acciones de ${service.name}`} icon={<MoreOutlined />} className="!-mt-1 !-mr-2 !h-10 !w-10" />
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
                {s?.free ? `${s.free} cupo${s.free === 1 ? '' : 's'} libre${s.free === 1 ? '' : 's'}` : 'Sin cupos libres'}
              </p>
            </article>
          );
        })}
        <button
          type="button"
          onClick={openCreate}
          className="flex min-h-36 flex-col items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed border-border text-brand-ink transition-colors hover:bg-surface-hover"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-xl dark:bg-brand-400/15">
            <PlusOutlined />
          </span>
          <span className="text-sm font-semibold">Agregar servicio</span>
        </button>
      </div>
    );
  };

  return (
    <>
      <PageHeader
        title="Servicios"
        subtitle="Catálogo de plataformas que ofreces"
        action={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} className="!hidden md:!inline-flex">
            Nuevo servicio
          </Button>
        }
      />
      {renderContent()}
      {hasAny && <Fab label="Nuevo servicio" onClick={openCreate} />}
      <ServiceFormModal open={modalOpen} onClose={() => setModalOpen(false)} service={editing} />
    </>
  );
}

export const ServicesPage = withErrorBoundary(ServicesPageComponent);
