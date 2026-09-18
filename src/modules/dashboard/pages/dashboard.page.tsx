import { RightOutlined } from '@ant-design/icons';
import { Button, Skeleton, type MenuProps } from 'antd';
import dayjs from 'dayjs';
import { useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { APP_NAME } from '@/config';
import { ServiceAvatar } from '@/components/panel/service-avatar';
import { SlotBar } from '@/components/panel/slot-bar';
import cn from '@/helpers/cn';
import { daysUntil, dueLabel, formatDate } from '@/helpers/dates';
import { formatMoney } from '@/helpers/money';
import { withErrorBoundary } from '@/hoc/with-error-boundary';
import { useAuth } from '@/hooks/use-auth';
import { PROVIDER_ACCOUNTS_ROUTE, SUBSCRIPTIONS_ROUTE } from '@/routes/routes';
import { useCustomers } from '@/modules/customers/hooks/use-customers';
import { useServices } from '@/modules/services/hooks/use-services';
import { useProviderAccounts } from '@/modules/provider-accounts/hooks/use-provider-accounts';
import {
  useSubscriptionAction,
  useSubscriptions,
  type ISubscription,
} from '@/modules/subscriptions/hooks/use-subscriptions';
import { useLookups } from '@/modules/subscriptions/hooks/use-lookups';
import { useShareSubscription } from '@/modules/subscriptions/hooks/use-share-subscription';
import { SubscriptionCard } from '@/modules/subscriptions/components/subscription-card';
import { RenewModal } from '@/modules/subscriptions/components/renew-modal';
import { SetupChecklist } from '../components/setup-checklist';

// Cuántas tarjetas de "Requiere atención" se muestran antes de "Ver todas".
const ATTENTION_LIMIT = 5;
const ACCOUNT_EXPIRY_WINDOW = 30;

function Section({
  title,
  count,
  link,
  children,
}: {
  title: string;
  count?: number;
  link?: { to: string; label: string };
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-base font-bold text-content">
          {title}
          {Boolean(count) && (
            <span className="min-w-5 rounded-full bg-red-100 px-1.5 text-center text-[11px] leading-5 font-bold text-red-700 dark:bg-red-500/15 dark:text-red-300">
              {count}
            </span>
          )}
        </h2>
        {link && (
          <Link to={link.to} className="!text-sm !font-semibold !text-brand-ink">
            {link.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function Metric({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 md:items-start md:justify-center md:rounded-xl md:border md:border-border md:bg-surface md:px-4 md:py-3 md:shadow-sm">
      <span className={cn('text-xl font-bold tracking-tight md:text-2xl', tone ?? 'text-content')}>
        {value}
      </span>
      <span className="text-[11px] text-content-muted md:text-xs">{label}</span>
    </div>
  );
}

function DashboardPageComponent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: subscriptions, isLoading } = useSubscriptions();
  const { data: customers, isLoading: loadingCustomers } = useCustomers();
  const { data: services } = useServices();
  const { data: accounts } = useProviderAccounts();
  const { customerName, service } = useLookups();
  const share = useShareSubscription();
  const { mutate: runAction } = useSubscriptionAction();
  const [renewing, setRenewing] = useState<ISubscription | null>(null);

  const summary = useMemo(() => {
    const subs = subscriptions ?? [];
    const running = subs.filter(s => ['active', 'expiring_soon'].includes(s.status));
    const expired = subs.filter(s => s.status === 'expired');
    return {
      // Ingreso mensual: aporte mensual de lo vigente (precio ÷ duración).
      mrr: running.reduce((sum, s) => sum + s.price / (s.durationMonths || 1), 0),
      running: running.length,
      due: expired.reduce((sum, s) => sum + s.price, 0),
      dueCustomers: new Set(expired.map(s => s.customerId)).size,
      expiring: subs.filter(s => s.status === 'expiring_soon').length,
      expired: expired.length,
      attention: subs
        .filter(s => s.status === 'expired' || s.status === 'expiring_soon')
        .sort((a, b) => dayjs(a.endDate).valueOf() - dayjs(b.endDate).valueOf()),
    };
  }, [subscriptions]);

  // Cupos por servicio, con más libres primero (oportunidad de venta).
  const slotsByService = useMemo(
    () =>
      (services ?? [])
        .map(svc => {
          const accs = (accounts ?? []).filter(a => a.serviceId === svc.id);
          return {
            svc,
            capacity: accs.reduce((sum, a) => sum + a.capacity, 0),
            used: accs.reduce((sum, a) => sum + a.usedSlots, 0),
          };
        })
        .filter(x => x.capacity > 0)
        .sort((a, b) => b.capacity - b.used - (a.capacity - a.used)),
    [services, accounts],
  );
  const freeSlots = slotsByService.reduce((sum, x) => sum + x.capacity - x.used, 0);

  const expiringAccounts = useMemo(
    () =>
      (accounts ?? [])
        .filter(a => a.expiresAt)
        .map(a => ({ account: a, days: daysUntil(a.expiresAt!) }))
        .filter(x => x.days <= ACCOUNT_EXPIRY_WINDOW)
        .sort((a, b) => a.days - b.days),
    [accounts],
  );

  const menuFor = (sub: ISubscription): MenuProps => ({
    items: [
      { key: 'pause', label: 'Pausar' },
      { key: 'open', label: 'Ver en suscripciones' },
    ],
    onClick: ({ key }) => {
      if (key === 'pause') runAction({ id: sub.id, action: 'pause' });
      else navigate(SUBSCRIPTIONS_ROUTE);
    },
  });

  const firstName = user?.profile?.firstName;
  const greeting = (
    <div className="mb-4">
      <h1 className="text-[22px] font-bold tracking-tight text-content md:text-2xl">
        Hola{firstName ? `, ${firstName}` : ''}
      </h1>
      <p className="mt-0.5 text-sm text-content-muted first-letter:uppercase">
        {formatDate(new Date(), 'dddd D [de] MMMM')}
      </p>
    </div>
  );

  if (isLoading || loadingCustomers) {
    return (
      <>
        {greeting}
        <Skeleton active paragraph={{ rows: 6 }} />
      </>
    );
  }

  // Primer uso: sin ventas todavía, el inicio es el checklist de configuración.
  if (!subscriptions?.length) {
    return (
      <>
        <div className="mb-4">
          <h1 className="text-[22px] font-bold tracking-tight text-content md:text-2xl">
            Bienvenido a {APP_NAME}
          </h1>
          <p className="mt-1 text-sm text-content-muted">
            Configura tu negocio en 4 pasos. Solo lo haces una vez.
          </p>
        </div>
        <SetupChecklist
          hasServices={Boolean(services?.length)}
          hasAccounts={Boolean(accounts?.length)}
          hasCustomers={Boolean(customers?.length)}
        />
      </>
    );
  }

  return (
    <>
      {greeting}

      <div className="grid gap-3 md:grid-cols-[minmax(0,1.3fr)_minmax(0,2fr)] md:gap-4">
        {/* Dinero: lo más importante manda */}
        <div className="rounded-2xl bg-brand-600 p-4 text-white shadow-lg shadow-brand-600/25">
          <p className="text-[11px] font-semibold tracking-wider uppercase opacity-80">
            Ingreso mensual
          </p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight">{formatMoney(summary.mrr)}</p>
          <p className="mt-0.5 text-xs opacity-80">
            {summary.running} suscripcion{summary.running === 1 ? '' : 'es'} vigente
            {summary.running === 1 ? '' : 's'}
          </p>
          <div className="mt-3.5 flex items-center justify-between gap-3 border-t border-white/20 pt-3">
            <div>
              <p className="text-xs opacity-80">Por cobrar</p>
              <p className="text-base font-bold">
                {formatMoney(summary.due)}
                {summary.dueCustomers > 0 &&
                  ` · ${summary.dueCustomers} cliente${summary.dueCustomers === 1 ? '' : 's'}`}
              </p>
            </div>
            {summary.expired > 0 && (
              <Button
                shape="round"
                className="!h-9 !border-white !bg-white !font-bold !text-brand-700"
                onClick={() => navigate(`${SUBSCRIPTIONS_ROUTE}?estado=expired`)}
              >
                Cobrar
              </Button>
            )}
          </div>
        </div>

        {/* Conteos compactos */}
        <div className="grid grid-cols-4 divide-x divide-border rounded-xl border border-border bg-surface py-3 shadow-sm md:grid-cols-2 md:gap-3 md:divide-x-0 md:border-0 md:bg-transparent md:py-0 md:shadow-none">
          <Metric label="Clientes" value={customers?.length ?? 0} />
          <Metric label="Vigentes" value={summary.running} />
          <Metric label="Por vencer" value={summary.expiring} tone="text-warning" />
          <Metric label="Vencidas" value={summary.expired} tone="text-danger" />
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Section
          title="Requiere atención"
          count={summary.attention.length}
          link={summary.attention.length ? { to: SUBSCRIPTIONS_ROUTE, label: 'Ver todas' } : undefined}
        >
          {summary.attention.length ? (
            <div className="grid gap-2.5 lg:grid-cols-2">
              {summary.attention.slice(0, ATTENTION_LIMIT).map(sub => (
                <SubscriptionCard
                  key={sub.id}
                  subscription={sub}
                  customerName={customerName(sub.customerId)}
                  service={service(sub.serviceId)}
                  menu={menuFor(sub)}
                  onRenew={() => setRenewing(sub)}
                  onShare={() => share(sub)}
                />
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-content-muted">
              Todo al día: nada vencido ni por vencer.
            </p>
          )}
        </Section>

        <div className="flex flex-col gap-6">
          {slotsByService.length > 0 && (
            <Section
              title="Cupos libres"
              link={{ to: PROVIDER_ACCOUNTS_ROUTE, label: `${freeSlots} disponibles` }}
            >
              <div className="flex flex-col gap-3.5 rounded-xl border border-border bg-surface p-3.5 shadow-sm">
                {slotsByService.map(({ svc, capacity, used }) => (
                  <div key={svc.id} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-content">
                        <ServiceAvatar name={svc.name} iconUrl={svc.iconUrl} size={22} />
                        <span className="truncate">{svc.name}</span>
                      </span>
                      <span
                        className={cn(
                          'shrink-0 text-xs font-semibold',
                          capacity > used ? 'text-success' : 'text-content-subtle',
                        )}
                      >
                        {capacity > used ? `${capacity - used} de ${capacity} libres` : 'Llena'}
                      </span>
                    </div>
                    <SlotBar capacity={capacity} used={used} />
                  </div>
                ))}
              </div>
            </Section>
          )}

          {expiringAccounts.length > 0 && (
            <Section title="Cuentas por renovar">
              <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-surface shadow-sm">
                {expiringAccounts.map(({ account, days }) => {
                  const svc = service(account.serviceId);
                  return (
                    <Link
                      key={account.id}
                      to={PROVIDER_ACCOUNTS_ROUTE}
                      className="flex items-center gap-2.5 p-3 !text-content"
                    >
                      <ServiceAvatar name={svc?.name ?? ''} iconUrl={svc?.iconUrl} size={30} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">
                          {account.label || svc?.name}
                        </span>
                        <span className="block text-xs text-content-subtle">
                          {account.usedSlots}/{account.capacity} cupos
                        </span>
                      </span>
                      <span
                        className={cn(
                          'shrink-0 text-xs font-semibold',
                          days < 0 ? 'text-danger' : days <= 15 ? 'text-warning' : 'text-content-muted',
                        )}
                      >
                        {dueLabel(days)}
                      </span>
                      <RightOutlined className="text-xs text-content-subtle" />
                    </Link>
                  );
                })}
              </div>
            </Section>
          )}
        </div>
      </div>

      <RenewModal
        subscription={renewing}
        open={Boolean(renewing)}
        onClose={() => setRenewing(null)}
      />
    </>
  );
}

export const DashboardPage = withErrorBoundary(DashboardPageComponent);
