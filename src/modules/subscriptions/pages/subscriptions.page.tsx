import {
  CheckCircleFilled,
  CreditCardOutlined,
  MoreOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  WhatsAppOutlined,
} from '@ant-design/icons';
import { App, Button, Dropdown, Input, Skeleton, Space, Table, Tooltip, type MenuProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { EmptyState } from '@/components/panel/empty-state';
import { Fab } from '@/components/panel/fab';
import { FilterChips, type FilterChip } from '@/components/panel/filter-chips';
import { LoadError } from '@/components/panel/load-error';
import { PageHeader } from '@/components/panel/page-header';
import { ServiceAvatar } from '@/components/panel/service-avatar';
import cn from '@/helpers/cn';
import { daysUntil, dueLabel } from '@/helpers/dates';
import { formatMoney } from '@/helpers/money';
import { withErrorBoundary } from '@/hoc/with-error-boundary';
import { useOpenFromQuery } from '@/hooks/use-open-from-query';
import { useProviderAccounts } from '@/modules/provider-accounts/hooks/use-provider-accounts';
import { useServices } from '@/modules/services/hooks/use-services';
import {
  useSubscriptionAction,
  useSubscriptions,
  type ISubscription,
  type SubscriptionStatus,
} from '../hooks/use-subscriptions';
import { useLookups } from '../hooks/use-lookups';
import { useShareSubscription } from '../hooks/use-share-subscription';
import { SubscriptionFormModal } from '../components/subscription-form-modal';
import { RenewModal } from '../components/renew-modal';
import { SubscriptionCard } from '../components/subscription-card';
import { DUE_TEXT, StatusPill } from '../components/status-pill';

type Filter = 'all' | SubscriptionStatus;

// Orden: lo que requiere acción primero, lo inactivo al final.
const STATUS_ORDER: Record<SubscriptionStatus, number> = {
  expired: 0,
  expiring_soon: 1,
  active: 2,
  paused: 3,
  cancelled: 4,
};

const FILTERS: Filter[] = ['all', 'active', 'expiring_soon', 'expired', 'paused', 'cancelled'];

const normalize = (text: string) =>
  text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

function SubscriptionsPageComponent() {
  const { modal } = App.useApp();
  const { data: subscriptions, isLoading, isError, refetch, isRefetching } = useSubscriptions();
  const { data: services } = useServices();
  const { data: accounts } = useProviderAccounts();
  const { customerName, service } = useLookups();
  const share = useShareSubscription();
  const { mutate: runAction } = useSubscriptionAction();

  const [formOpen, setFormOpen] = useState(false);
  const [renewing, setRenewing] = useState<ISubscription | null>(null);
  // El filtro puede venir en la URL (p. ej. "Cobrar" en el inicio → ?estado=expired).
  const [params] = useSearchParams();
  const fromUrl = params.get('estado') as Filter | null;
  const [filter, setFilter] = useState<Filter>(
    fromUrl && FILTERS.includes(fromUrl) ? fromUrl : 'all',
  );
  useOpenFromQuery(useCallback(() => setFormOpen(true), []));
  const [search, setSearch] = useState('');

  const counts = useMemo(() => {
    const byStatus = { active: 0, expiring_soon: 0, expired: 0, paused: 0, cancelled: 0 };
    subscriptions?.forEach(s => byStatus[s.status]++);
    return byStatus;
  }, [subscriptions]);

  const chips: FilterChip<Filter>[] = [
    { value: 'all', label: 'Todas', count: (subscriptions?.length ?? 0) - counts.cancelled },
    { value: 'expiring_soon', label: 'Por vencer', count: counts.expiring_soon, tone: 'warning' },
    { value: 'expired', label: 'Vencidas', count: counts.expired, tone: 'danger' },
    { value: 'active', label: 'Activas', count: counts.active },
    { value: 'paused', label: 'Pausadas', count: counts.paused },
    { value: 'cancelled', label: 'Canceladas', count: counts.cancelled },
  ];

  const visible = useMemo(() => {
    const term = normalize(search.trim());
    return (subscriptions ?? [])
      .filter(s => (filter === 'all' ? s.status !== 'cancelled' : s.status === filter))
      .filter(
        s =>
          !term ||
          normalize(customerName(s.customerId)).includes(term) ||
          normalize(service(s.serviceId)?.name ?? '').includes(term),
      )
      .sort(
        (a, b) =>
          STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
          dayjs(a.endDate).valueOf() - dayjs(b.endDate).valueOf(),
      );
  }, [subscriptions, filter, search, customerName, service]);

  const confirmCancel = (sub: ISubscription) => {
    modal.confirm({
      title: 'Cancelar suscripción',
      content: 'Se liberará el cupo de la cuenta de proveedor. ¿Continuar?',
      okText: 'Cancelar suscripción',
      okButtonProps: { danger: true },
      cancelText: 'Volver',
      onOk: () => runAction({ id: sub.id, action: 'cancel' }),
    });
  };

  // Menú ⋯ de una suscripción. `withPrimary` agrega renovar/compartir cuando no
  // están a la vista (tarjetas no urgentes).
  const menuFor = (sub: ISubscription, withPrimary: boolean): MenuProps => {
    const items: MenuProps['items'] = [
      ...(withPrimary
        ? [
            { key: 'renew', label: 'Renovar', icon: <ReloadOutlined /> },
            { key: 'share', label: 'Compartir por WhatsApp', icon: <WhatsAppOutlined /> },
            { type: 'divider' as const },
          ]
        : []),
      sub.status === 'paused'
        ? { key: 'resume', label: 'Reanudar' }
        : { key: 'pause', label: 'Pausar' },
      { key: 'cancel', label: 'Cancelar', danger: true },
    ];
    return {
      items,
      onClick: ({ key }) => {
        if (key === 'renew') setRenewing(sub);
        else if (key === 'share') share(sub);
        else if (key === 'cancel') confirmCancel(sub);
        else runAction({ id: sub.id, action: key as 'pause' | 'resume' });
      },
    };
  };

  const columns: ColumnsType<ISubscription> = [
    {
      title: 'Cliente',
      key: 'customer',
      render: (_, sub) => {
        const svc = service(sub.serviceId);
        return (
          <span className="flex items-center gap-2.5">
            <ServiceAvatar name={svc?.name ?? ''} iconUrl={svc?.iconUrl} size={32} />
            <span className="min-w-0">
              <span className="block truncate font-semibold text-content">
                {customerName(sub.customerId)}
              </span>
              <span className="block truncate text-xs text-content-subtle">
                {svc?.name ?? 'Servicio'} ·{' '}
                {sub.fullAccount ? 'Cuenta completa' : `${sub.seats} cupo${sub.seats === 1 ? '' : 's'}`}
              </span>
            </span>
          </span>
        );
      },
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      render: (status: SubscriptionStatus) => <StatusPill status={status} />,
    },
    {
      title: 'Vencimiento',
      dataIndex: 'endDate',
      sorter: (a, b) => dayjs(a.endDate).valueOf() - dayjs(b.endDate).valueOf(),
      render: (endDate: string, sub) => (
        <span>
          <span className="block text-content">{dayjs(endDate).format('DD/MM/YYYY')}</span>
          {sub.status !== 'cancelled' && sub.status !== 'paused' && (
            <span className={cn('block text-xs font-semibold', DUE_TEXT[sub.status])}>
              {dueLabel(daysUntil(endDate))}
            </span>
          )}
        </span>
      ),
    },
    {
      title: 'Precio',
      dataIndex: 'price',
      align: 'right',
      render: (price: number) => <span className="font-semibold">{formatMoney(price)}</span>,
    },
    {
      title: '',
      key: 'actions',
      align: 'right',
      render: (_, sub) => {
        if (sub.status === 'cancelled') {
          return <span className="text-content-subtle">—</span>;
        }
        return (
          <Space>
            <Tooltip title="Compartir por WhatsApp">
              <Button
                aria-label="Compartir por WhatsApp"
                icon={<WhatsAppOutlined />}
                className="!border-[#25D366] !text-[#25D366]"
                onClick={() => share(sub)}
              />
            </Tooltip>
            <Button
              type={sub.status === 'expired' || sub.status === 'expiring_soon' ? 'primary' : 'default'}
              icon={<ReloadOutlined />}
              onClick={() => setRenewing(sub)}
            >
              Renovar
            </Button>
            <Dropdown trigger={['click']} menu={menuFor(sub, false)}>
              <Button aria-label="Más acciones" icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  const hasAny = Boolean(subscriptions?.length);
  const freeSlots = accounts?.reduce((sum, a) => sum + a.availableSlots, 0) ?? 0;

  const renderList = () => {
    if (isError) {
      return <LoadError what="tus suscripciones" onRetry={() => refetch()} retrying={isRefetching} />;
    }

    if (!isLoading && !hasAny) {
      const req = (ok: boolean, text: string) => (
        <li className="flex items-center gap-2.5 text-left text-sm">
          {ok ? (
            <CheckCircleFilled className="text-lg text-success" />
          ) : (
            <span className="h-[18px] w-[18px] shrink-0 rounded-full border-[1.5px] border-dashed border-content-subtle" />
          )}
          <span className={ok ? 'text-content' : 'text-content-muted'}>{text}</span>
        </li>
      );
      return (
        <EmptyState
          icon={<CreditCardOutlined />}
          title="Registra tu primera venta"
          description="Cada venta asigna un cupo a un cliente y calcula su vencimiento."
          actions={
            <Button type="primary" size="large" block icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>
              Registrar venta
            </Button>
          }
        >
          <ul className="flex w-full flex-col gap-2.5 rounded-xl border border-border bg-surface p-4">
            {req(Boolean(services?.length), services?.length ? `Tienes ${services.length} servicio${services.length === 1 ? '' : 's'}` : 'Agrega un servicio')}
            {req(freeSlots > 0, freeSlots > 0 ? `Tienes ${freeSlots} cupo${freeSlots === 1 ? '' : 's'} libre${freeSlots === 1 ? '' : 's'}` : 'Registra una cuenta con cupos libres')}
            {req(true, 'El cliente lo puedes crear en la misma venta')}
          </ul>
        </EmptyState>
      );
    }

    const emptyFilter = (
      <p className="py-12 text-center text-sm text-content-muted">
        {search ? `Sin resultados para “${search}”` : 'No hay suscripciones en este filtro'}
      </p>
    );

    return (
      <>
        {/* Móvil: tarjetas */}
        <div className="flex flex-col gap-2.5 md:hidden">
          {isLoading
            ? Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="rounded-xl border border-border bg-surface p-3">
                  <Skeleton avatar active paragraph={{ rows: 1 }} />
                </div>
              ))
            : visible.length
              ? visible.map(sub => (
                  <SubscriptionCard
                    key={sub.id}
                    subscription={sub}
                    customerName={customerName(sub.customerId)}
                    service={service(sub.serviceId)}
                    menu={menuFor(sub, !['expired', 'expiring_soon'].includes(sub.status))}
                    onRenew={() => setRenewing(sub)}
                    onShare={() => share(sub)}
                  />
                ))
              : emptyFilter}
        </div>

        {/* Escritorio: tabla */}
        <div className="hidden md:block">
          <Table<ISubscription>
            rowKey="id"
            columns={columns}
            dataSource={visible}
            loading={isLoading}
            size="middle"
            pagination={{ pageSize: 10, hideOnSinglePage: true }}
            locale={{ emptyText: emptyFilter }}
          />
        </div>
      </>
    );
  };

  return (
    <>
      <PageHeader
        title="Suscripciones"
        subtitle="Ventas activas y sus vencimientos"
        action={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)} className="!hidden md:!inline-flex">
            Nueva venta
          </Button>
        }
      />

      {hasAny && !isError && (
        <div className="mb-4 flex flex-col gap-3 md:flex-row-reverse md:items-center md:justify-between">
          <Input
            allowClear
            size="large"
            prefix={<SearchOutlined className="text-content-subtle" />}
            placeholder="Buscar cliente o servicio"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="md:!w-72"
          />
          <FilterChips chips={chips} value={filter} onChange={setFilter} />
        </div>
      )}

      {renderList()}

      {hasAny && <Fab label="Nueva venta" onClick={() => setFormOpen(true)} />}

      <SubscriptionFormModal open={formOpen} onClose={() => setFormOpen(false)} />
      <RenewModal
        subscription={renewing}
        open={Boolean(renewing)}
        onClose={() => setRenewing(null)}
      />
    </>
  );
}

export const SubscriptionsPage = withErrorBoundary(SubscriptionsPageComponent);
