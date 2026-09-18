import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  RightOutlined,
  SearchOutlined,
  TeamOutlined,
  WhatsAppOutlined,
} from '@ant-design/icons';
import { App, Button, Input, Skeleton, Space, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useMemo, useState } from 'react';

import { EmptyState } from '@/components/panel/empty-state';
import { Fab } from '@/components/panel/fab';
import { LoadError } from '@/components/panel/load-error';
import { PageHeader } from '@/components/panel/page-header';
import { nameInitials } from '@/components/panel/user-avatar';
import { formatMoney } from '@/helpers/money';
import { whatsappUrl } from '@/helpers/whatsapp';
import { withErrorBoundary } from '@/hoc/with-error-boundary';
import { useOpenFromQuery } from '@/hooks/use-open-from-query';
import { useSubscriptions } from '@/modules/subscriptions/hooks/use-subscriptions';
import { StatusPill } from '@/modules/subscriptions/components/status-pill';
import { SubscriptionFormModal } from '@/modules/subscriptions/components/subscription-form-modal';
import { useCustomers, useDeleteCustomer, type ICustomer } from '../hooks/use-customers';
import { summarizeByCustomer, type CustomerSummary } from '../customer-summary';
import { CustomerFormModal } from '../components/customer-form-modal';
import { CustomerDetailDrawer } from '../components/customer-detail-drawer';

const normalize = (text: string) =>
  text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

function Initials({ name, tone = 'brand' }: { name: string; tone?: 'brand' | 'danger' }) {
  return (
    <span
      aria-hidden
      className={
        tone === 'danger'
          ? 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-700 dark:bg-red-500/15 dark:text-red-300'
          : 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-ink dark:bg-brand-400/15'
      }
    >
      {nameInitials(name)}
    </span>
  );
}

const countLabel = (n: number) => `${n} suscripci${n === 1 ? 'ón' : 'ones'}`;

function CustomersPageComponent() {
  const { modal } = App.useApp();
  const { data: customers, isLoading, isError, refetch, isRefetching } = useCustomers();
  const { data: subscriptions } = useSubscriptions();
  const { mutate: deleteCustomer } = useDeleteCustomer();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ICustomer | null>(null);
  const [detail, setDetail] = useState<ICustomer | null>(null);
  const [saleFor, setSaleFor] = useState<{ customerId: string } | null>(null);
  const [search, setSearch] = useState('');

  const openCreate = useCallback(() => {
    setEditing(null);
    setModalOpen(true);
  }, []);
  useOpenFromQuery(openCreate);

  const openEdit = (customer: ICustomer) => {
    setEditing(customer);
    setModalOpen(true);
  };

  const confirmDelete = (customer: ICustomer) => {
    modal.confirm({
      title: `Eliminar a "${customer.name}"`,
      content: 'Esta acción no se puede deshacer.',
      okText: 'Eliminar',
      okButtonProps: { danger: true },
      cancelText: 'Cancelar',
      onOk: () => deleteCustomer(customer.id),
    });
  };

  const summaries = useMemo(() => summarizeByCustomer(subscriptions ?? []), [subscriptions]);
  const summaryOf = (id: string): CustomerSummary | undefined => summaries.get(id);

  const filtered = useMemo(() => {
    const term = normalize(search.trim());
    const digits = search.replace(/\D/g, '');
    return [...(customers ?? [])]
      .filter(
        c =>
          !term ||
          normalize(c.name).includes(term) ||
          (digits.length > 2 && (c.phone ?? '').replace(/\D/g, '').includes(digits)),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [customers, search]);

  // Con pago pendiente: tienen al menos una suscripción vencida.
  const pending = filtered.filter(c => (summaryOf(c.id)?.due ?? 0) > 0);
  const pendingTotal = pending.reduce((sum, c) => sum + (summaryOf(c.id)?.due ?? 0), 0);

  const subtitleFor = (c: ICustomer) => {
    const summary = summaryOf(c.id);
    return summary?.current.length ? countLabel(summary.current.length) : 'Sin suscripciones';
  };

  const columns: ColumnsType<ICustomer> = [
    {
      title: 'Cliente',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, c) => (
        <span className="flex items-center gap-3">
          <Initials name={name} />
          <span className="min-w-0">
            <span className="block truncate font-semibold text-content">{name}</span>
            <span className="block truncate text-xs text-content-subtle">
              {[c.phone, c.email].filter(Boolean).join(' · ') || '—'}
            </span>
          </span>
        </span>
      ),
    },
    {
      title: 'Estado',
      key: 'status',
      render: (_, c) => {
        const status = summaryOf(c.id)?.status;
        return status ? <StatusPill status={status} /> : <span className="text-content-subtle">—</span>;
      },
    },
    {
      title: 'Suscripciones',
      key: 'subs',
      render: (_, c) => <span className="text-content-muted">{summaryOf(c.id)?.current.length ?? 0}</span>,
    },
    {
      title: 'Debe',
      key: 'due',
      align: 'right',
      render: (_, c) => {
        const due = summaryOf(c.id)?.due ?? 0;
        return due ? <span className="font-semibold text-danger">{formatMoney(due)}</span> : <span className="text-content-subtle">—</span>;
      },
    },
    {
      title: '',
      key: 'actions',
      align: 'right',
      render: (_, customer) => (
        <Space onClick={e => e.stopPropagation()}>
          <Tooltip title="Editar">
            <Button type="text" aria-label="Editar" icon={<EditOutlined />} onClick={() => openEdit(customer)} />
          </Tooltip>
          <Tooltip title="Eliminar">
            <Button
              type="text"
              danger
              aria-label="Eliminar"
              icon={<DeleteOutlined />}
              onClick={() => confirmDelete(customer)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const hasAny = Boolean(customers?.length);

  const row = (c: ICustomer, variant: 'pending' | 'all') => {
    const summary = summaryOf(c.id);
    return (
      <div key={c.id} className="flex items-center gap-3 px-3 py-2.5">
        <button
          type="button"
          onClick={() => setDetail(c)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <Initials name={c.name} tone={variant === 'pending' ? 'danger' : 'brand'} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[15px] font-semibold text-content">{c.name}</span>
            <span className="mt-0.5 flex min-w-0 items-center gap-1.5">
              {variant === 'all' && summary?.status && <StatusPill status={summary.status} />}
              <span className="truncate text-xs text-content-muted">
                {variant === 'pending' ? `Debe ${formatMoney(summary?.due ?? 0)}` : subtitleFor(c)}
              </span>
            </span>
          </span>
        </button>
        {variant === 'pending' && c.phone ? (
          <Button
            href={whatsappUrl(c.phone)}
            target="_blank"
            aria-label={`Escribir a ${c.name} por WhatsApp`}
            icon={<WhatsAppOutlined />}
            className="!h-10 !w-11 !border-[#25D366] !text-[#25D366]"
          />
        ) : (
          <RightOutlined className="text-xs text-content-subtle" />
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (isError) {
      return <LoadError what="tus clientes" onRetry={() => refetch()} retrying={isRefetching} />;
    }
    if (!isLoading && !hasAny) {
      return (
        <EmptyState
          icon={<TeamOutlined />}
          title="Aún no tienes clientes"
          description="Agrégalos aquí o créalos al vuelo cuando registres una venta."
          actions={
            <>
              <Button type="primary" size="large" block icon={<PlusOutlined />} onClick={openCreate}>
                Agregar cliente
              </Button>
              <Button type="link" onClick={() => setSaleFor({ customerId: '' })}>
                Registrar una venta
              </Button>
            </>
          }
        />
      );
    }

    const noResults = (
      <p className="py-12 text-center text-sm text-content-muted">
        Sin resultados para “{search}”. Prueba con otro nombre o con el teléfono.
      </p>
    );

    return (
      <>
        {/* Móvil: lista agrupada */}
        <div className="flex flex-col gap-5 md:hidden">
          {isLoading ? (
            <div className="rounded-xl border border-border bg-surface p-3">
              <Skeleton avatar active paragraph={{ rows: 3 }} />
            </div>
          ) : !filtered.length ? (
            noResults
          ) : (
            <>
              {pending.length > 0 && (
                <section>
                  <div className="mb-2 flex items-center justify-between">
                    <h2 className="text-[11px] font-semibold tracking-wider text-content-subtle uppercase">
                      Con pago pendiente
                    </h2>
                    <span className="text-xs font-bold text-danger">{formatMoney(pendingTotal)}</span>
                  </div>
                  <div className="divide-y divide-border rounded-xl border border-border bg-surface shadow-sm">
                    {pending.map(c => row(c, 'pending'))}
                  </div>
                </section>
              )}
              <section>
                <h2 className="mb-2 text-[11px] font-semibold tracking-wider text-content-subtle uppercase">
                  Todos · {filtered.length}
                </h2>
                <div className="divide-y divide-border rounded-xl border border-border bg-surface shadow-sm">
                  {filtered.map(c => row(c, 'all'))}
                </div>
              </section>
            </>
          )}
        </div>

        {/* Escritorio: tabla */}
        <div className="hidden md:block">
          <Table<ICustomer>
            rowKey="id"
            columns={columns}
            dataSource={filtered}
            loading={isLoading}
            size="middle"
            pagination={{ pageSize: 10, hideOnSinglePage: true }}
            onRow={customer => ({
              onClick: () => setDetail(customer),
              className: 'cursor-pointer',
            })}
            locale={{ emptyText: noResults }}
          />
        </div>
      </>
    );
  };

  const count = customers?.length ?? 0;

  return (
    <>
      <PageHeader
        title="Clientes"
        subtitle={count ? `${count} cliente${count === 1 ? '' : 's'}` : 'Tus clientes'}
        action={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} className="!hidden md:!inline-flex">
            Nuevo cliente
          </Button>
        }
      />

      {hasAny && !isError && (
        <Input
          allowClear
          size="large"
          prefix={<SearchOutlined className="text-content-subtle" />}
          placeholder="Buscar por nombre o teléfono"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="!mb-4 md:!w-80"
        />
      )}

      {renderContent()}

      {hasAny && <Fab label="Nuevo cliente" onClick={openCreate} />}

      <CustomerFormModal open={modalOpen} onClose={() => setModalOpen(false)} customer={editing} />
      <CustomerDetailDrawer
        customer={detail}
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        onEdit={customer => {
          setDetail(null);
          openEdit(customer);
        }}
        onNewSale={customer => setSaleFor({ customerId: customer.id })}
      />
      <SubscriptionFormModal
        open={Boolean(saleFor)}
        onClose={() => setSaleFor(null)}
        preset={saleFor?.customerId ? saleFor : undefined}
      />
    </>
  );
}

export const CustomersPage = withErrorBoundary(CustomersPageComponent);
