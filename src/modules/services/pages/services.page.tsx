import { PlusOutlined } from '@ant-design/icons';
import { App, Button, Skeleton } from 'antd';
import { useCallback, useMemo, useState } from 'react';

import { Fab } from '@/components/panel/fab';
import { LoadError } from '@/components/panel/load-error';
import { PageHeader } from '@/components/panel/page-header';
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
import { AddServiceTile, ServiceCard, ServicesGrid, type ServiceStats } from '../components/service-card';
import { ServicesEmptyState } from '../components/services-empty-state';
import { logoForDomain, type PopularService } from '../popular-services';

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
    const map = new Map<string, ServiceStats>();
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

  const quickAdd = (item: PopularService) =>
    createService(
      { name: item.name, iconUrl: logoForDomain(item.domain) },
      { onSuccess: () => message.success(`${item.name} agregado`) },
    );

  const renderContent = () => {
    if (isError) {
      return <LoadError what="tus servicios" onRetry={() => refetch()} retrying={isRefetching} />;
    }
    if (!isLoading && !hasAny) {
      return (
        <ServicesEmptyState
          onQuickAdd={quickAdd}
          onCreate={openCreate}
          creatingName={creating ? creatingBody?.name : undefined}
        />
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
      <ServicesGrid>
        {services!.map(service => (
          <ServiceCard
            key={service.id}
            service={service}
            stats={stats.get(service.id)}
            onEdit={() => openEdit(service)}
            onDelete={() => confirmDelete(service)}
          />
        ))}
        <AddServiceTile onClick={openCreate} />
      </ServicesGrid>
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
