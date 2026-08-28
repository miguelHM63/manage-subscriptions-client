import { Card, Empty, Progress, Spin, Tag } from 'antd';
import type { ReactNode } from 'react';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { PageHeader } from '@/components/panel/page-header';
import { ServiceAvatar } from '@/components/panel/service-avatar';
import { formatMoney } from '@/helpers/money';
import { withErrorBoundary } from '@/hoc/with-error-boundary';
import { useAuth } from '@/hooks/use-auth';
import {
  PROVIDER_ACCOUNTS_ROUTE,
  SUBSCRIPTIONS_ROUTE,
} from '@/routes/routes';
import { useCustomers } from '@/modules/customers/hooks/use-customers';
import { useServices } from '@/modules/services/hooks/use-services';
import { useProviderAccounts } from '@/modules/provider-accounts/hooks/use-provider-accounts';
import { useSubscriptions } from '@/modules/subscriptions/hooks/use-subscriptions';

const REMINDER_DAYS = 7;
const ACCOUNT_EXPIRY_WINDOW = 30;

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: ReactNode;
  accent?: string;
}) {
  return (
    <Card size="small" className="shadow-sm">
      <p className="text-xs text-content-muted">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${accent ?? 'text-content'}`}>{value}</p>
    </Card>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="mt-6 mb-3 text-base font-semibold text-content">{children}</h2>;
}

// Nota de días restantes/vencido para una fecha.
function daysNote(days: number): { text: string; className: string } {
  if (days < 0) {
    return {
      text: `venció hace ${Math.abs(days)} ${Math.abs(days) === 1 ? 'día' : 'días'}`,
      className: 'text-danger',
    };
  }
  if (days === 0) return { text: 'vence hoy', className: 'text-warning' };
  return {
    text: `en ${days} ${days === 1 ? 'día' : 'días'}`,
    className: days <= 15 ? 'text-warning' : 'text-content-subtle',
  };
}

function DashboardPageComponent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: subscriptions, isLoading } = useSubscriptions();
  const { data: customers } = useCustomers();
  const { data: services } = useServices();
  const { data: accounts } = useProviderAccounts();

  const serviceById = useMemo(() => {
    const map = new Map(services?.map(s => [s.id, s]));
    return (id: string) => map.get(id);
  }, [services]);
  const serviceName = (id: string) => serviceById(id)?.name ?? 'Servicio';

  const customerName = useMemo(() => {
    const map = new Map(customers?.map(c => [c.id, c.name]));
    return (id: string) => map.get(id) ?? 'Cliente';
  }, [customers]);

  const { stats, upcoming, mrr, due } = useMemo(() => {
    const now = dayjs();
    const active = (subscriptions ?? []).filter(s => s.status !== 'cancelled');

    const enriched = active.map(s => ({
      ...s,
      daysLeft: dayjs(s.endDate).startOf('day').diff(now.startOf('day'), 'day'),
    }));

    // MRR: aporte mensual de las suscripciones vigentes (precio ÷ duración).
    const mrrCents = enriched
      .filter(s => s.daysLeft >= 0)
      .reduce((sum, s) => sum + s.price / (s.durationMonths || 1), 0);

    // Por cobrar: vencidas no canceladas (requieren renovación).
    const dueCents = enriched
      .filter(s => s.daysLeft < 0)
      .reduce((sum, s) => sum + s.price, 0);

    return {
      stats: {
        customers: customers?.length ?? 0,
        active: active.length,
        soon: enriched.filter(s => s.daysLeft >= 0 && s.daysLeft <= REMINDER_DAYS).length,
        expired: enriched.filter(s => s.daysLeft < 0).length,
      },
      mrr: mrrCents,
      due: dueCents,
      upcoming: enriched
        .filter(s => s.daysLeft <= REMINDER_DAYS)
        .sort((a, b) => a.daysLeft - b.daysLeft),
    };
  }, [subscriptions, customers]);

  // Cupos libres por servicio (inventario / oportunidad de venta).
  const slotsByService = useMemo(() => {
    return (services ?? [])
      .map(svc => {
        const accs = (accounts ?? []).filter(a => a.serviceId === svc.id);
        const capacity = accs.reduce((sum, a) => sum + a.capacity, 0);
        const used = accs.reduce((sum, a) => sum + a.usedSlots, 0);
        return { svc, capacity, used, available: capacity - used };
      })
      .filter(x => x.capacity > 0)
      .sort((a, b) => b.available - a.available);
  }, [services, accounts]);

  // Cuentas de proveedor que vencen pronto.
  const expiringAccounts = useMemo(() => {
    const now = dayjs();
    return (accounts ?? [])
      .filter(a => a.expiresAt)
      .map(a => ({
        account: a,
        days: dayjs(a.expiresAt).startOf('day').diff(now.startOf('day'), 'day'),
      }))
      .filter(x => x.days <= ACCOUNT_EXPIRY_WINDOW)
      .sort((a, b) => a.days - b.days);
  }, [accounts]);

  // Distribución de suscripciones activas por servicio.
  const distribution = useMemo(() => {
    const active = (subscriptions ?? []).filter(s => s.status !== 'cancelled');
    const counts = (services ?? [])
      .map(svc => ({
        svc,
        count: active.filter(s => s.serviceId === svc.id).length,
      }))
      .filter(x => x.count > 0)
      .sort((a, b) => b.count - a.count);
    const max = counts.reduce((m, x) => Math.max(m, x.count), 0);
    return { counts, max };
  }, [subscriptions, services]);

  return (
    <>
      <PageHeader
        title={`Hola${user?.profile?.firstName ? `, ${user.profile.firstName}` : ''} 👋`}
        subtitle="Resumen de tu negocio"
      />

      {/* Conteos */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Clientes" value={stats.customers} />
        <StatCard label="Suscripciones" value={stats.active} />
        <StatCard label="Por vencer" value={stats.soon} accent="text-warning" />
        <StatCard label="Vencidas" value={stats.expired} accent="text-danger" />
      </div>

      {/* Finanzas */}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <StatCard label="Ingreso mensual estimado (MRR)" value={formatMoney(mrr)} />
        <StatCard
          label="Por cobrar (vencidas)"
          value={formatMoney(due)}
          accent={due > 0 ? 'text-danger' : 'text-content'}
        />
      </div>

      {/* Próximos vencimientos */}
      <SectionTitle>Próximos vencimientos</SectionTitle>
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spin />
        </div>
      ) : !upcoming.length ? (
        <Empty className="py-12" description="Nada por vencer en los próximos días 🎉" />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.map(sub => {
            const overdue = sub.daysLeft < 0;
            return (
              <Card
                key={sub.id}
                size="small"
                className="cursor-pointer shadow-sm transition-shadow hover:shadow-md"
                onClick={() => navigate(SUBSCRIPTIONS_ROUTE)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-start gap-2">
                    <ServiceAvatar
                      name={serviceName(sub.serviceId)}
                      iconUrl={serviceById(sub.serviceId)?.iconUrl}
                      size={32}
                    />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-content">
                        {customerName(sub.customerId)}
                      </p>
                      <p className="truncate text-xs text-content-muted">
                        {serviceName(sub.serviceId)} · {formatMoney(sub.price)}
                      </p>
                    </div>
                  </div>
                  <Tag color={overdue ? 'red' : 'gold'}>
                    {overdue
                      ? `Venció hace ${Math.abs(sub.daysLeft)}d`
                      : sub.daysLeft === 0
                        ? 'Vence hoy'
                        : `En ${sub.daysLeft}d`}
                  </Tag>
                </div>
                <p className="mt-2 text-xs text-content-subtle">
                  {dayjs(sub.endDate).format('DD/MM/YYYY')}
                </p>
              </Card>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 gap-x-6 lg:grid-cols-2">
        {/* Cupos libres por servicio */}
        <div>
          <SectionTitle>Cupos libres por servicio</SectionTitle>
          {!slotsByService.length ? (
            <Empty className="py-8" description="Sin cuentas de proveedor" />
          ) : (
            <Card size="small" className="shadow-sm">
              <div className="space-y-3">
                {slotsByService.map(({ svc, capacity, used, available }) => (
                  <div key={svc.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-2">
                        <ServiceAvatar name={svc.name} iconUrl={svc.iconUrl} size={22} />
                        <span className="truncate text-sm text-content">{svc.name}</span>
                      </span>
                      <span className="shrink-0 text-xs text-content-muted">
                        {available} libres de {capacity}
                      </span>
                    </div>
                    <Progress
                      percent={capacity ? Math.round((used / capacity) * 100) : 0}
                      showInfo={false}
                      size="small"
                    />
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Distribución por servicio */}
        <div>
          <SectionTitle>Suscripciones por servicio</SectionTitle>
          {!distribution.counts.length ? (
            <Empty className="py-8" description="Sin suscripciones activas" />
          ) : (
            <Card size="small" className="shadow-sm">
              <div className="space-y-3">
                {distribution.counts.map(({ svc, count }) => (
                  <div key={svc.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-2">
                        <ServiceAvatar name={svc.name} iconUrl={svc.iconUrl} size={22} />
                        <span className="truncate text-sm text-content">{svc.name}</span>
                      </span>
                      <span className="shrink-0 text-xs font-medium text-content">{count}</span>
                    </div>
                    <Progress
                      percent={distribution.max ? Math.round((count / distribution.max) * 100) : 0}
                      showInfo={false}
                      size="small"
                    />
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Cuentas de proveedor por vencer */}
      <SectionTitle>Cuentas de proveedor por vencer</SectionTitle>
      {!expiringAccounts.length ? (
        <Empty className="py-8" description="Ninguna cuenta vence en los próximos 30 días 🎉" />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {expiringAccounts.map(({ account, days }) => {
            const note = daysNote(days);
            return (
              <Card
                key={account.id}
                size="small"
                className="cursor-pointer shadow-sm transition-shadow hover:shadow-md"
                onClick={() => navigate(PROVIDER_ACCOUNTS_ROUTE)}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2">
                    <ServiceAvatar
                      name={serviceName(account.serviceId)}
                      iconUrl={serviceById(account.serviceId)?.iconUrl}
                      size={28}
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-content">
                        {account.label || serviceName(account.serviceId)}
                      </span>
                      <span className="block text-xs text-content-subtle">
                        {account.usedSlots}/{account.capacity} cupos usados
                      </span>
                    </span>
                  </span>
                  <span className={`shrink-0 text-xs font-medium ${note.className}`}>
                    {note.text}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

export const DashboardPage = withErrorBoundary(DashboardPageComponent);
