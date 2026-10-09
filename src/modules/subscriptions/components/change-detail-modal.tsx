import { ArrowDownOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import type { ReactNode } from 'react';

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
  /** Cualquiera de las dos: la cambiada o la que la reemplazó. */
  subscription: ISubscription | null;
  subscriptions: ISubscription[];
  open: boolean;
  onClose: () => void;
}

/** Antes → ahora de un cambio de servicio. */
export function ChangeDetailModal({ subscription, subscriptions, open, onClose }: Props) {
  const isMobile = useIsMobile();
  const { customerName, service } = useLookups();
  const { data: accounts } = useProviderAccounts();

  const before =
    subscription?.status === 'migrated'
      ? subscription
      : subscriptions.find(s => s.id === subscription?.replacesId);
  const after = before ? subscriptions.find(s => s.replacesId === before.id) : undefined;

  const side = (title: string, sub?: ISubscription): ReactNode => {
    if (!sub) {
      return (
        <div className="flex-1 rounded-xl border border-dashed border-border p-3 text-sm text-content-muted">
          No se encontró la suscripción.
        </div>
      );
    }
    const svc = service(sub.serviceId);
    const account = accounts?.find(a => a.id === sub.providerAccountId);
    return (
      <div className="flex min-w-0 flex-1 flex-col gap-2 rounded-xl border border-border bg-surface-muted p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold tracking-wider text-content-subtle uppercase">
            {title}
          </span>
          <StatusPill status={sub.status} />
        </div>
        <div className="flex min-w-0 items-center gap-2.5">
          <ServiceAvatar name={svc?.name ?? ''} iconUrl={svc?.iconUrl} size={32} />
          <span className="truncate font-semibold text-content">{svc?.name ?? 'Servicio'}</span>
        </div>
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-xs">
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
        </dl>
      </div>
    );
  };

  return (
    <ResponsiveModal
      title="Detalle del cambio"
      open={open}
      onCancel={onClose}
      footer={
        <Button block={isMobile} size={isMobile ? 'large' : 'middle'} onClick={onClose}>
          Cerrar
        </Button>
      }
    >
      {before && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-content-muted">
            <span className="font-semibold uppercase text-content">{customerName(before.customerId)}</span>
            {after?.createdAt && (
              <> cambió de servicio el {formatDate(after.createdAt, 'D MMM YYYY, HH:mm')}.</>
            )}
          </p>

          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            {side('Antes', before)}
            <span className="self-center text-content-subtle">
              {isMobile ? <ArrowDownOutlined /> : <ArrowRightOutlined />}
            </span>
            {side('Ahora', after)}
          </div>

          <p className="text-xs text-content-muted">
            Se conservó el vencimiento del {formatDate(before.endDate, 'DD/MM/YYYY')}. Los pagos
            anteriores siguen registrados en la suscripción original.
          </p>
        </div>
      )}
    </ResponsiveModal>
  );
}
