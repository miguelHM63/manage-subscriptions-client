import { ReloadOutlined, RightOutlined, WhatsAppOutlined } from '@ant-design/icons';
import { Button, Skeleton } from 'antd';
import dayjs from 'dayjs';
import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

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
  useSubscriptions,
  type ISubscription,
} from '@/modules/subscriptions/hooks/use-subscriptions';
import { useLookups } from '@/modules/subscriptions/hooks/use-lookups';
import { useShareSubscription } from '@/modules/subscriptions/hooks/use-share-subscription';
import { RenewModal } from '@/modules/subscriptions/components/renew-modal';
import { SetupWelcome } from '../components/setup-checklist';

// Cuántas ventas de "Requiere atención" se muestran antes de "Ver las N".
const ATTENTION_LIMIT = 5;
const ACCOUNT_EXPIRY_WINDOW = 30;

function Section({
  title,
  subtitle,
  link,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  link?: { to: string; label: string };
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-content">{title}</h2>
          {subtitle && <p className="text-xs text-content-muted">{subtitle}</p>}
        </div>
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

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/**
 * Venta que pide acción hoy: a quién, de qué, cuándo venció y las dos acciones
 * del día (renovar y avisar). El detalle completo vive en Suscripciones.
 */
function AttentionRow({
  sub,
  customer,
  service,
  onRenew,
  onShare,
}: {
  sub: ISubscription;
  customer: string;
  service?: { name: string; iconUrl?: string };
  onRenew: () => void;
  onShare: () => void;
}) {
  const days = daysUntil(sub.endDate);
  return (
    <li className="flex gap-3 p-3 md:items-center">
      <ServiceAvatar name={service?.name ?? ''} iconUrl={service?.iconUrl} size={40} />
      <div className="flex min-w-0 flex-1 flex-col gap-2.5 md:flex-row md:items-center md:gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold uppercase text-content">{customer}</p>
          <p className="truncate text-xs text-content-subtle">
            <span
              className={cn('font-semibold', days < 0 ? 'text-danger-ink' : 'text-warning-ink')}
            >
              {dueLabel(days)}
            </span>
            {' · '}
            {service?.name ?? 'Servicio'} · {formatMoney(sub.price)}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            className="!h-9 flex-1 md:!px-4"
            onClick={onRenew}
          >
            Renovar
          </Button>
          <Button
            aria-label={`Escribir a ${customer} por WhatsApp`}
            icon={<WhatsAppOutlined />}
            className="!h-9 !w-11 !border-[#25D366] !text-[#25D366]"
            onClick={onShare}
          />
        </div>
      </div>
    </li>
  );
}

function DashboardPageComponent() {
  const { user } = useAuth();
  const { data: subscriptions, isLoading } = useSubscriptions();
  const { data: customers, isLoading: loadingCustomers } = useCustomers();
  const { data: services } = useServices();
  const { data: accounts } = useProviderAccounts();
  const { customerName, service } = useLookups();
  const share = useShareSubscription();
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
        <SetupWelcome
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

      {/* Hoy primero: lo que pide acción manda; dinero y cupos acompañan al lado. */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Section
          title="Requiere atención"
          subtitle={
            summary.attention.length
              ? [
                  summary.expired && plural(summary.expired, 'vencida', 'vencidas'),
                  summary.expiring && plural(summary.expiring, 'por vencer', 'por vencer'),
                ]
                  .filter(Boolean)
                  .join(' · ')
              : undefined
          }
          link={
            summary.attention.length > ATTENTION_LIMIT
              ? { to: SUBSCRIPTIONS_ROUTE, label: `Ver las ${summary.attention.length}` }
              : undefined
          }
        >
          {summary.attention.length ? (
            <ul className="flex flex-col divide-y divide-border rounded-xl border border-border bg-surface">
              {summary.attention.slice(0, ATTENTION_LIMIT).map(sub => (
                <AttentionRow
                  key={sub.id}
                  sub={sub}
                  customer={customerName(sub.customerId)}
                  service={service(sub.serviceId)}
                  onRenew={() => setRenewing(sub)}
                  onShare={() => share(sub)}
                />
              ))}
            </ul>
          ) : (
            <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-content-muted">
              Todo al día: nada vencido ni por vencer.
            </p>
          )}
        </Section>

        <div className="flex flex-col gap-6">
          <div className="rounded-2xl bg-brand-600 p-4 text-white">
            <p className="text-[11px] font-semibold tracking-wider uppercase opacity-80">
              Ingreso mensual
            </p>
            <p className="mt-1 text-3xl font-extrabold tracking-tight">
              {formatMoney(summary.mrr)}
            </p>
            <p className="mt-0.5 text-xs opacity-80">
              {plural(summary.running, 'suscripción vigente', 'suscripciones vigentes')}
            </p>
            {summary.due > 0 && (
              <div className="mt-3.5 border-t border-white/20 pt-3">
                <p className="text-xs opacity-80">Por cobrar</p>
                <p className="text-base font-bold">
                  {formatMoney(summary.due)} · {plural(summary.dueCustomers, 'cliente', 'clientes')}
                </p>
              </div>
            )}
          </div>

          {slotsByService.length > 0 && (
            <Section
              title="Cupos libres"
              link={{ to: PROVIDER_ACCOUNTS_ROUTE, label: `${freeSlots} disponibles` }}
            >
              <div className="flex flex-col gap-3.5 rounded-xl border border-border bg-surface p-3.5">
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
                          capacity > used ? 'text-success-ink' : 'text-content-subtle',
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
              <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-surface">
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
                          days < 0
                            ? 'text-danger-ink'
                            : days <= 15
                              ? 'text-warning-ink'
                              : 'text-content-muted',
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
