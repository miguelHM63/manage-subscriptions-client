import { RightOutlined, SearchOutlined, ShopOutlined } from '@ant-design/icons';
import { Input, Skeleton, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';

import { EmptyState } from '@/components/panel/empty-state';
import { FilterChips, type FilterChip } from '@/components/panel/filter-chips';
import { LoadError } from '@/components/panel/load-error';
import { PageHeader } from '@/components/panel/page-header';
import { formatDate, shortDate } from '@/helpers/dates';
import { formatMoney, solesToCents } from '@/helpers/money';
import { withErrorBoundary } from '@/hoc/with-error-boundary';
import { planHealth, type PlanHealth } from '@/modules/organization/plan-status';
import { PLAN_PRICES } from '@/modules/organization/plans';
import {
  ownerName,
  useAdminOrganizations,
  type IAdminOrganization,
} from '../hooks/use-admin-organizations';
import { OrganizationDrawer } from '../components/organization-drawer';
import { PlanPill } from '../components/plan-pill';
import { CYCLE_MONTHS } from '../plan-validity';

type Filter = 'all' | 'paid' | 'attention' | 'expired' | 'free';

const FILTERS: Record<Filter, (health: PlanHealth) => boolean> = {
  all: () => true,
  paid: h => h === 'active' || h === 'expiring' || h === 'grace',
  attention: h => h === 'expiring' || h === 'grace',
  expired: h => h === 'expired',
  free: h => h === 'free',
};

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

/**
 * Ingreso mensual equivalente de un plan vigente (según la lista de precios).
 * Sin fecha de vencimiento es una cortesía: no cuenta como ingreso.
 */
const monthlyValue = (org: IAdminOrganization) =>
  org.plan === 'free' || !org.planValidUntil
    ? 0
    : PLAN_PRICES[org.plan][org.billingCycle] / CYCLE_MONTHS[org.billingCycle];

/** Panel del dueño de la plataforma: todos los negocios, sus planes y pagos. */
function PlatformAdminPageComponent() {
  const { data: orgs, isLoading, isError, refetch, isRefetching } = useAdminOrganizations();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  // Se guarda el id (no el objeto) para que la ficha refleje los cambios al refrescar.
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const withHealth = useMemo(
    () => (orgs ?? []).map(org => ({ org, health: planHealth(org).health })),
    [orgs],
  );

  const filtered = useMemo(() => {
    const term = normalize(search.trim());
    const digits = search.replace(/\D/g, '');
    return withHealth
      .filter(({ health }) => FILTERS[filter](health))
      .filter(
        ({ org }) =>
          !term ||
          normalize([org.name, ownerName(org), org.owner?.email ?? ''].join(' ')).includes(term) ||
          (digits.length > 2 && (org.owner?.phone ?? '').replace(/\D/g, '').includes(digits)),
      )
      .map(({ org }) => org);
  }, [withHealth, filter, search]);

  const count = (f: Filter) => withHealth.filter(({ health }) => FILTERS[f](health)).length;
  const chips: FilterChip<Filter>[] = [
    { value: 'all', label: 'Todos', count: count('all') },
    { value: 'paid', label: 'De pago', count: count('paid'), tone: 'success' },
    { value: 'attention', label: 'Por vencer', count: count('attention'), tone: 'warning' },
    { value: 'expired', label: 'Vencidos', count: count('expired'), tone: 'danger' },
    { value: 'free', label: 'Free', count: count('free') },
  ];

  const mrr = withHealth
    .filter(({ health }) => FILTERS.paid(health))
    .reduce((sum, { org }) => sum + monthlyValue(org), 0);

  const selected = orgs?.find(o => o.id === selectedId) ?? null;

  const columns: ColumnsType<IAdminOrganization> = [
    {
      title: 'Negocio',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, org) => (
        <span className="block min-w-0">
          <span className="block truncate font-semibold text-content">{name}</span>
          <span className="block truncate text-xs text-content-subtle">
            {[ownerName(org), org.owner?.email].filter(Boolean).join(' · ') || '—'}
          </span>
        </span>
      ),
    },
    {
      title: 'Plan',
      key: 'plan',
      render: (_, org) => <PlanPill org={org} />,
    },
    {
      title: 'Vence',
      dataIndex: 'planValidUntil',
      sorter: (a, b) => (a.planValidUntil ?? '').localeCompare(b.planValidUntil ?? ''),
      render: (date?: string) =>
        date ? (
          <span className="text-content-muted">{formatDate(date, 'D MMM YYYY')}</span>
        ) : (
          <span className="text-content-subtle">—</span>
        ),
    },
    {
      title: 'Clientes',
      key: 'customers',
      sorter: (a, b) => a.usage.customers - b.usage.customers,
      render: (_, org) => (
        <span className="text-content-muted">
          {org.usage.customers}
          {org.limits.maxCustomers !== -1 && ` / ${org.limits.maxCustomers}`}
        </span>
      ),
    },
    {
      title: 'Registro',
      dataIndex: 'createdAt',
      defaultSortOrder: 'descend',
      sorter: (a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''),
      render: (date?: string) => (
        <span className="text-content-muted">{date ? shortDate(date) : '—'}</span>
      ),
    },
  ];

  const stat = (value: string, label: string) => (
    <div className="rounded-xl border border-border bg-surface px-3.5 py-3 shadow-sm">
      <p className="text-xl font-bold tracking-tight text-content">{value}</p>
      <p className="text-xs text-content-muted">{label}</p>
    </div>
  );

  const renderContent = () => {
    if (isError) {
      return <LoadError what="los negocios" onRetry={() => refetch()} retrying={isRefetching} />;
    }
    if (!isLoading && !orgs?.length) {
      return (
        <EmptyState
          icon={<ShopOutlined />}
          title="Aún no hay negocios"
          description="Cuando alguien se registre aparecerá aquí con su plan."
        />
      );
    }

    const noResults = (
      <p className="py-12 text-center text-sm text-content-muted">Sin resultados.</p>
    );

    return (
      <>
        {/* Móvil: lista */}
        <div className="md:hidden">
          {isLoading ? (
            <div className="rounded-xl border border-border bg-surface p-3">
              <Skeleton active paragraph={{ rows: 4 }} />
            </div>
          ) : !filtered.length ? (
            noResults
          ) : (
            <div className="divide-y divide-border rounded-xl border border-border bg-surface shadow-sm">
              {filtered.map(org => (
                <button
                  key={org.id}
                  type="button"
                  onClick={() => setSelectedId(org.id)}
                  className="flex w-full items-center gap-3 px-3.5 py-3 text-left"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold text-content">
                      {org.name}
                    </span>
                    <span className="mt-1 flex min-w-0 items-center gap-1.5">
                      <PlanPill org={org} />
                      <span className="truncate text-xs text-content-muted">
                        {org.usage.customers} clientes
                        {org.owner?.email && ` · ${org.owner.email}`}
                      </span>
                    </span>
                  </span>
                  <RightOutlined className="text-xs text-content-subtle" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Escritorio: tabla */}
        <div className="hidden md:block">
          <Table<IAdminOrganization>
            rowKey="id"
            columns={columns}
            dataSource={filtered}
            loading={isLoading}
            size="middle"
            pagination={{ pageSize: 20, hideOnSinglePage: true }}
            onRow={org => ({ onClick: () => setSelectedId(org.id), className: 'cursor-pointer' })}
            locale={{ emptyText: noResults }}
          />
        </div>
      </>
    );
  };

  return (
    <>
      <PageHeader
        title="Administración"
        subtitle={
          orgs
            ? `${orgs.length} negocio${orgs.length === 1 ? '' : 's'} registrados`
            : 'Negocios y planes'
        }
      />

      {Boolean(orgs?.length) && (
        <div className="mb-4 grid grid-cols-2 gap-2.5 md:grid-cols-4">
          {stat(String(count('all')), 'Negocios')}
          {stat(String(count('paid')), 'De pago vigentes')}
          {stat(String(count('attention')), 'Por vencer')}
          {stat(formatMoney(solesToCents(mrr)), 'Ingreso mensual estimado')}
        </div>
      )}

      {Boolean(orgs?.length) && !isError && (
        <div className="mb-4 flex flex-col gap-3">
          <Input
            size="large"
            allowClear
            prefix={<SearchOutlined className="text-content-subtle" />}
            placeholder="Buscar por negocio, nombre, correo o teléfono"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="md:max-w-md"
          />
          <FilterChips chips={chips} value={filter} onChange={setFilter} />
        </div>
      )}

      {renderContent()}

      <OrganizationDrawer
        org={selected}
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
}

export const PlatformAdminPage = withErrorBoundary(PlatformAdminPageComponent);
