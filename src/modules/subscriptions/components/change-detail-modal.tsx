import { ArrowDownOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import dayjs from 'dayjs';

import cn from '@/helpers/cn';
import { ResponsiveModal } from '@/components/panel/responsive-modal';
import { ServiceAvatar } from '@/components/panel/service-avatar';
import { formatDate } from '@/helpers/dates';
import { formatMoney } from '@/helpers/money';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { useProviderAccounts } from '@/modules/provider-accounts/hooks/use-provider-accounts';
import type { ISubscription } from '../hooks/use-subscriptions';
import { useLookups } from '../hooks/use-lookups';
import { StatusPill } from './status-pill';

interface Props {
  /** Cualquier suscripción de la cadena de cambios; se resalta en la lista. */
  subscription: ISubscription | null;
  subscriptions: ISubscription[];
  open: boolean;
  onClose: () => void;
}

/**
 * Cadena completa de cambios de servicio: desde la suscripción original hasta
 * la actual, siguiendo `replacesId` en ambos sentidos.
 */
function changeChain(start: ISubscription, subscriptions: ISubscription[]): ISubscription[] {
  const chain = [start];
  const seen = new Set([start.id]);
  for (let prev = start; prev.replacesId; ) {
    const found = subscriptions.find(s => s.id === prev.replacesId);
    if (!found || seen.has(found.id)) break;
    chain.unshift(found);
    seen.add(found.id);
    prev = found;
  }
  for (let next = start; ; ) {
    const found = subscriptions.find(s => s.replacesId === next.id);
    if (!found || seen.has(found.id)) break;
    chain.push(found);
    seen.add(found.id);
    next = found;
  }
  return chain;
}

const plural = (n: number) => `${n} ${n === 1 ? 'día' : 'días'}`;

/** Historial de cambios de servicio de una suscripción. */
export function ChangeDetailModal({ subscription, subscriptions, open, onClose }: Props) {
  const isMobile = useIsMobile();
  const { customerName, service } = useLookups();
  const { data: accounts } = useProviderAccounts();

  const chain = subscription ? changeChain(subscription, subscriptions) : [];
  const changes = chain.length - 1;
  const last = chain[chain.length - 1];
  // Solo el último cambio (anterior → actual) se ve resaltado; lo previo queda atenuado.
  const isPast = (index: number) => index < chain.length - 2;

  const card = (sub: ISubscription, index: number) => {
    const svc = service(sub.serviceId);
    const account = accounts?.find(a => a.id === sub.providerAccountId);
    const title = index === 0 ? 'Original' : index === changes ? 'Actual' : `Cambio ${index}`;
    return (
      <div
        className={cn(
          'flex min-w-0 flex-col gap-2 rounded-xl border bg-surface-muted p-3',
          isPast(index) && 'opacity-50',
          sub.id === subscription?.id && changes > 1 ? 'border-brand-500' : 'border-border',
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <ServiceAvatar name={svc?.name ?? ''} iconUrl={svc?.iconUrl} size={32} />
            <div className="min-w-0">
              <span className="block text-[11px] font-semibold tracking-wider text-content-subtle uppercase">
                {title}
              </span>
              <span className="block truncate font-semibold text-content">
                {svc?.name ?? 'Servicio'}
              </span>
            </div>
          </div>
          <StatusPill status={sub.status} />
        </div>
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-xs sm:grid-cols-[auto_minmax(0,1fr)_auto_minmax(0,1fr)]">
          <dt className="text-content-subtle">Cuenta</dt>
          <dd className="truncate text-content">
            {account?.label || 'Cuenta'}
            {account?.username && (
              <span className="block truncate text-content-muted">{account.username}</span>
            )}
          </dd>
          <dt className="text-content-subtle">Tipo</dt>
          <dd className="text-content">
            {sub.fullAccount ? 'Cuenta completa' : `${sub.seats} cupo${sub.seats === 1 ? '' : 's'}`}
          </dd>
          <dt className="text-content-subtle">Precio</dt>
          <dd className="text-content tabular-nums">{formatMoney(sub.price)}</dd>
          <dt className="text-content-subtle">Vigencia</dt>
          <dd className="text-content tabular-nums">
            {formatDate(sub.startDate, 'DD/MM/YY')} → {formatDate(sub.endDate, 'DD/MM/YY')}
          </dd>
        </dl>
      </div>
    );
  };

  // Entre una suscripción y la que la reemplazó: cuándo y cómo quedó el vencimiento.
  const connector = (before: ISubscription, after: ISubscription, dimmed: boolean) => {
    // Vencimiento con el que nació la nueva (las renovaciones posteriores lo
    // mueven); los cambios previos a ese campo siempre conservaban el anterior.
    const afterEnd = after.initialEndDate ?? before.endDate;
    const shiftDays = dayjs(afterEnd)
      .startOf('day')
      .diff(dayjs(before.endDate).startOf('day'), 'day');
    return (
      <div className={cn('flex items-start gap-3 py-1 pl-4', dimmed && 'opacity-50')}>
        <ArrowDownOutlined className="mt-0.5 text-content-subtle" />
        <p className="text-xs text-content-muted">
          {after.createdAt && (
            <span className="font-medium text-content">
              {formatDate(after.createdAt, 'D MMM YYYY, HH:mm')}
            </span>
          )}
          {after.createdAt && ' · '}
          {shiftDays === 0 ? (
            <>conservó el vencimiento del {formatDate(before.endDate, 'DD/MM/YYYY')}</>
          ) : (
            <>
              <span
                className={cn(
                  'font-semibold',
                  shiftDays > 0 ? 'text-success-ink' : 'text-danger-ink',
                )}
              >
                {shiftDays > 0
                  ? `se regalaron ${plural(shiftDays)}`
                  : `se quitaron ${plural(-shiftDays)}`}
              </span>{' '}
              (del {formatDate(before.endDate, 'DD/MM/YYYY')} al{' '}
              {formatDate(afterEnd, 'DD/MM/YYYY')})
            </>
          )}
        </p>
      </div>
    );
  };

  return (
    <ResponsiveModal
      title={changes > 1 ? 'Historial de cambios' : 'Detalle del cambio'}
      open={open}
      onCancel={onClose}
      footer={
        <Button block={isMobile} size={isMobile ? 'large' : 'middle'} onClick={onClose}>
          Cerrar
        </Button>
      }
    >
      {last && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-content-muted">
            <span className="font-semibold uppercase text-content">
              {customerName(last.customerId)}
            </span>
            {changes > 1 ? (
              <> cambió de servicio {changes} veces.</>
            ) : (
              last.createdAt && (
                <> cambió de servicio el {formatDate(last.createdAt, 'D MMM YYYY, HH:mm')}.</>
              )
            )}
          </p>

          <div className="flex flex-col gap-1">
            {chain.map((sub, i) => (
              <div key={sub.id} className="flex flex-col gap-1">
                {i > 0 && connector(chain[i - 1], sub, isPast(i - 1))}
                {card(sub, i)}
              </div>
            ))}
          </div>

          <p className="text-xs text-content-muted">
            Los pagos de cada etapa siguen registrados en su suscripción.
          </p>
        </div>
      )}
    </ResponsiveModal>
  );
}
