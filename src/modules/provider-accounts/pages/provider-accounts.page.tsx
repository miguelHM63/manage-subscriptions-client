import {
  CloudServerOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  MoreOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { App, Button, Dropdown, Skeleton, Space, Table, Tooltip, type MenuProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useCallback, useMemo, useState } from 'react';

import { EmptyState } from '@/components/panel/empty-state';
import { Fab } from '@/components/panel/fab';
import { LoadError } from '@/components/panel/load-error';
import { PageHeader } from '@/components/panel/page-header';
import { ServiceAvatar } from '@/components/panel/service-avatar';
import { SlotBar } from '@/components/panel/slot-bar';
import cn from '@/helpers/cn';
import { daysUntil, dueLabel, shortDate } from '@/helpers/dates';
import { formatMoney } from '@/helpers/money';
import { withErrorBoundary } from '@/hoc/with-error-boundary';
import { useOpenFromQuery } from '@/hooks/use-open-from-query';
import { useServices } from '@/modules/services/hooks/use-services';
import { SubscriptionFormModal } from '@/modules/subscriptions/components/subscription-form-modal';
import {
  useDeleteProviderAccount,
  useProviderAccounts,
  type IProviderAccount,
} from '../hooks/use-provider-accounts';
import { ProviderAccountFormModal } from '../components/provider-account-form-modal';
import { CredentialsModal } from '../components/credentials-modal';

// Cuentas que vencen dentro de esta ventana se destacan arriba.
const EXPIRY_WINDOW = 30;

const expiryTone = (days: number) =>
  days < 0
    ? 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300'
    : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300';

function ProviderAccountsPageComponent() {
  const { modal } = App.useApp();
  const { data: accounts, isLoading, isError, refetch, isRefetching } = useProviderAccounts();
  const { data: services } = useServices();
  const { mutate: deleteAccount } = useDeleteProviderAccount();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<IProviderAccount | null>(null);
  const [credentialsId, setCredentialsId] = useState<string | null>(null);
  const [sellFrom, setSellFrom] = useState<{ serviceId: string; providerAccountId: string } | null>(null);

  const serviceById = useMemo(() => {
    const map = new Map(services?.map(s => [s.id, s]));
    return (id: string) => map.get(id);
  }, [services]);

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);
  useOpenFromQuery(openCreate);

  const openEdit = (account: IProviderAccount) => {
    setEditing(account);
    setFormOpen(true);
  };

  const confirmDelete = (account: IProviderAccount) => {
    modal.confirm({
      title: 'Eliminar cuenta de proveedor',
      content: 'Solo puedes eliminarla si no tiene suscripciones activas.',
      okText: 'Eliminar',
      okButtonProps: { danger: true },
      cancelText: 'Cancelar',
      onOk: () => deleteAccount(account.id),
    });
  };

  const sell = (account: IProviderAccount) =>
    setSellFrom({ serviceId: account.serviceId, providerAccountId: account.id });

  const menuFor = (account: IProviderAccount): MenuProps => ({
    items: [
      { key: 'edit', label: 'Editar', icon: <EditOutlined /> },
      { key: 'delete', label: 'Eliminar', icon: <DeleteOutlined />, danger: true },
    ],
    onClick: ({ key }) => (key === 'edit' ? openEdit(account) : confirmDelete(account)),
  });

  const list = accounts ?? [];
  const expiring = list
    .filter(a => a.expiresAt && daysUntil(a.expiresAt) <= EXPIRY_WINDOW)
    .sort((a, b) => dayjs(a.expiresAt).valueOf() - dayjs(b.expiresAt).valueOf());
  const others = list.filter(a => !expiring.includes(a));
  const totals = {
    free: list.reduce((sum, a) => sum + a.availableSlots, 0),
    cost: list.reduce((sum, a) => sum + a.cost, 0),
  };

  const card = (account: IProviderAccount) => {
    const svc = serviceById(account.serviceId);
    const days = account.expiresAt ? daysUntil(account.expiresAt) : null;
    const perSlot = account.capacity > 0 && account.cost > 0 ? account.cost / account.capacity : 0;
    return (
      <article
        key={account.id}
        className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-3 shadow-sm"
      >
        <div className="flex items-center gap-2.5">
          <ServiceAvatar name={svc?.name ?? ''} iconUrl={svc?.iconUrl} size={40} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold text-content">
              {account.label || svc?.name || 'Cuenta'}
            </p>
            <p className="truncate text-[12.5px] text-content-muted">
              {[svc?.name, account.cost ? formatMoney(account.cost) : null, perSlot ? `${formatMoney(perSlot)} por cupo` : null]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
          {days !== null &&
            (days <= EXPIRY_WINDOW ? (
              <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold', expiryTone(days))}>
                {dueLabel(days)}
              </span>
            ) : (
              <span className="shrink-0 text-xs text-content-subtle">{shortDate(account.expiresAt!)}</span>
            ))}
        </div>

        <div className="flex items-center gap-2.5">
          <SlotBar capacity={account.capacity} used={account.usedSlots} className="flex-1" />
          <span
            className={cn(
              'shrink-0 text-xs font-semibold',
              account.availableSlots ? 'text-success' : 'text-content-subtle',
            )}
          >
            {account.availableSlots
              ? `${account.availableSlots} libre${account.availableSlots === 1 ? '' : 's'}`
              : 'Llena'}
          </span>
        </div>

        <div className="flex gap-2">
          {account.availableSlots > 0 && (
            <Button type="primary" icon={<PlusOutlined />} className="!h-10 flex-1" onClick={() => sell(account)}>
              Vender cupo
            </Button>
          )}
          <Button
            icon={<EyeOutlined />}
            className={cn('!h-10', account.availableSlots > 0 ? '!w-11' : 'flex-1')}
            aria-label="Ver credenciales"
            onClick={() => setCredentialsId(account.id)}
          >
            {account.availableSlots > 0 ? null : 'Credenciales'}
          </Button>
          <Dropdown trigger={['click']} menu={menuFor(account)}>
            <Button aria-label="Más acciones" icon={<MoreOutlined />} className="!h-10 !w-11" />
          </Dropdown>
        </div>
      </article>
    );
  };

  const columns: ColumnsType<IProviderAccount> = [
    {
      title: 'Cuenta',
      key: 'account',
      render: (_, account) => {
        const svc = serviceById(account.serviceId);
        return (
          <span className="flex items-center gap-2.5">
            <ServiceAvatar name={svc?.name ?? ''} iconUrl={svc?.iconUrl} size={32} />
            <span className="min-w-0">
              <span className="block truncate font-semibold text-content">
                {account.label || svc?.name}
              </span>
              <span className="block truncate text-xs text-content-subtle">{svc?.name}</span>
            </span>
          </span>
        );
      },
    },
    {
      title: 'Cupos',
      key: 'slots',
      width: 220,
      render: (_, account) => (
        <div className="flex flex-col gap-1.5">
          <SlotBar capacity={account.capacity} used={account.usedSlots} />
          <span className="text-xs text-content-muted">
            {account.usedSlots}/{account.capacity} usados ·{' '}
            <span className={account.availableSlots ? 'font-semibold text-success' : ''}>
              {account.availableSlots} libres
            </span>
          </span>
        </div>
      ),
    },
    {
      title: 'Costo',
      key: 'cost',
      align: 'right',
      render: (_, account) => (
        <div>
          <div className="font-semibold">{formatMoney(account.cost)}</div>
          {account.capacity > 0 && account.cost > 0 && (
            <div className="text-xs text-content-subtle">
              {formatMoney(account.cost / account.capacity)} por cupo
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Vence',
      dataIndex: 'expiresAt',
      render: (expiresAt?: string) => {
        if (!expiresAt) return <span className="text-content-subtle">—</span>;
        const days = daysUntil(expiresAt);
        return (
          <div>
            <div className={days < 0 ? 'text-danger' : undefined}>{dayjs(expiresAt).format('DD/MM/YYYY')}</div>
            {days <= EXPIRY_WINDOW && (
              <div className={cn('text-xs font-semibold', days < 0 ? 'text-danger' : days <= 15 ? 'text-warning' : 'text-content-subtle')}>
                {dueLabel(days)}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: '',
      key: 'actions',
      align: 'right',
      render: (_, account) => (
        <Space>
          {account.availableSlots > 0 && (
            <Button icon={<PlusOutlined />} onClick={() => sell(account)}>
              Vender cupo
            </Button>
          )}
          <Tooltip title="Ver credenciales">
            <Button aria-label="Ver credenciales" icon={<EyeOutlined />} onClick={() => setCredentialsId(account.id)} />
          </Tooltip>
          <Dropdown trigger={['click']} menu={menuFor(account)}>
            <Button aria-label="Más acciones" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  const hasAny = list.length > 0;

  const renderContent = () => {
    if (isError) {
      return <LoadError what="tus cuentas" onRetry={() => refetch()} retrying={isRefetching} />;
    }
    if (!isLoading && !hasAny) {
      return (
        <EmptyState
          icon={<CloudServerOutlined />}
          title="Registra la cuenta que compras"
          description="Indica cuántos cupos tiene y cuánto te cuesta. Plancito te dirá cuántos te quedan por vender y tu costo por cupo."
          actions={
            <Button type="primary" size="large" block icon={<PlusOutlined />} onClick={openCreate}>
              Agregar cuenta
            </Button>
          }
        >
          <div className="flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-surface p-4 text-xs text-content-muted">
            <span className="flex flex-col items-center gap-1.5">
              <CloudServerOutlined className="text-2xl text-brand-ink" />1 cuenta
            </span>
            <span className="text-content-subtle">→</span>
            <span className="flex flex-col items-center gap-1.5">
              <SlotBar capacity={5} used={0} className="w-20" />5 cupos
            </span>
            <span className="text-content-subtle">→</span>
            <span className="flex flex-col items-center gap-1.5">
              <span className="text-2xl leading-none font-bold text-brand-ink">5</span>
              clientes
            </span>
          </div>
        </EmptyState>
      );
    }

    return (
      <>
        {/* Móvil: tarjetas */}
        <div className="flex flex-col gap-3 md:hidden">
          {isLoading ? (
            <div className="rounded-xl border border-border bg-surface p-3">
              <Skeleton avatar active paragraph={{ rows: 2 }} />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 divide-x divide-border rounded-xl border border-border bg-surface py-3 text-center shadow-sm">
                <div>
                  <p className="text-lg font-bold text-content">{list.length}</p>
                  <p className="text-[11px] text-content-muted">Cuentas</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-success">{totals.free}</p>
                  <p className="text-[11px] text-content-muted">Cupos libres</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-content">{formatMoney(totals.cost)}</p>
                  <p className="text-[11px] text-content-muted">Costo total</p>
                </div>
              </div>
              {expiring.length > 0 && (
                <section className="flex flex-col gap-2.5">
                  <h2 className="text-[11px] font-semibold tracking-wider text-content-subtle uppercase">
                    Vencen pronto
                  </h2>
                  {expiring.map(card)}
                </section>
              )}
              {others.length > 0 && (
                <section className="flex flex-col gap-2.5">
                  <h2 className="text-[11px] font-semibold tracking-wider text-content-subtle uppercase">
                    {expiring.length ? 'Otras' : 'Todas'} · {others.length}
                  </h2>
                  {others.map(card)}
                </section>
              )}
            </>
          )}
        </div>

        {/* Escritorio: tabla */}
        <div className="hidden md:block">
          <Table<IProviderAccount>
            rowKey="id"
            columns={columns}
            dataSource={list}
            loading={isLoading}
            size="middle"
            pagination={{ pageSize: 10, hideOnSinglePage: true }}
          />
        </div>
      </>
    );
  };

  return (
    <>
      <PageHeader
        title="Cuentas de proveedor"
        subtitle={hasAny ? `${totals.free} cupos libres para vender` : 'Las cuentas que compras y sus cupos'}
        action={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} className="!hidden md:!inline-flex">
            Nueva cuenta
          </Button>
        }
      />

      {renderContent()}

      {hasAny && <Fab label="Nueva cuenta" onClick={openCreate} />}

      <ProviderAccountFormModal open={formOpen} onClose={() => setFormOpen(false)} account={editing} />
      <CredentialsModal
        accountId={credentialsId}
        open={Boolean(credentialsId)}
        onClose={() => setCredentialsId(null)}
      />
      <SubscriptionFormModal
        open={Boolean(sellFrom)}
        onClose={() => setSellFrom(null)}
        preset={sellFrom ?? undefined}
      />
    </>
  );
}

export const ProviderAccountsPage = withErrorBoundary(ProviderAccountsPageComponent);
