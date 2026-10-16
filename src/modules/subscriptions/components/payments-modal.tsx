import { FileTextOutlined } from '@ant-design/icons';
import { Skeleton } from 'antd';

import { ResponsiveModal } from '@/components/panel/responsive-modal';
import { ServiceAvatar } from '@/components/panel/service-avatar';
import cn from '@/helpers/cn';
import { formatDate } from '@/helpers/dates';
import { formatMoney } from '@/helpers/money';
import { ReceiptActions } from '@/modules/organization/components/receipt-actions';
import {
  MY_ORGANIZATION_KEY,
  useMyOrganization,
} from '@/modules/organization/hooks/use-my-organization';
import { usePlanPaymentReceipt } from '@/modules/organization/hooks/use-plan-payment-receipt';
import {
  subscriptionPaymentsKey,
  useSubscriptionPayments,
  type ISubscription,
} from '../hooks/use-subscriptions';
import { useLookups } from '../hooks/use-lookups';
import { PAYMENT_METHOD_OPTIONS } from '../subscription-meta';

interface Props {
  subscription: ISubscription | null;
  open: boolean;
  onClose: () => void;
}

const methodLabel = (method: string) =>
  PAYMENT_METHOD_OPTIONS.find(o => o.value === method)?.label ?? 'Otro';

/**
 * Cobros de una suscripción (venta y renovaciones) con su comprobante. Subir
 * consume el cupo mensual del plan; ver siempre está permitido.
 */
export function PaymentsModal({ subscription, open, onClose }: Props) {
  const id = open ? subscription?.id : undefined;
  const { data: payments, isLoading } = useSubscriptionPayments(id);
  const { data: org } = useMyOrganization();
  const { customerName, service } = useLookups();
  const receipt = usePlanPaymentReceipt(`/subscriptions/${subscription?.id}/payments`, [
    subscriptionPaymentsKey(subscription?.id ?? ''),
    MY_ORGANIZATION_KEY,
  ]);

  const used = org?.usage.receipts ?? 0;
  const max = org?.limits.maxReceiptsPerMonth ?? 0;
  const full = max > 0 && used >= max;
  const svc = subscription ? service(subscription.serviceId) : undefined;

  return (
    <ResponsiveModal title="Cobros y comprobantes" open={open} onCancel={onClose} footer={null}>
      {subscription && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-muted p-3">
            <ServiceAvatar name={svc?.name ?? ''} iconUrl={svc?.iconUrl} size={40} />
            <div className="min-w-0">
              <p className="truncate font-semibold uppercase text-content">
                {customerName(subscription.customerId)}
              </p>
              <p className="truncate text-xs text-content-muted">{svc?.name ?? 'Servicio'}</p>
            </div>
          </div>

          {org && (
            <p
              className={cn('text-xs', full ? 'font-semibold text-warning' : 'text-content-muted')}
            >
              <FileTextOutlined /> Comprobantes este mes: {used} de {max}
              {org.effectivePlan === 'free' && ' · Con Pro subes hasta 300 al mes'}
            </p>
          )}

          {isLoading ? (
            <Skeleton active paragraph={{ rows: 2 }} />
          ) : !payments?.length ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-content-muted">
              Aún no hay cobros registrados. Se registran al vender y al renovar.
            </p>
          ) : (
            <div className="divide-y divide-border rounded-xl border border-border bg-surface">
              {payments.map(p => (
                <div key={p.id} className="flex items-start justify-between gap-3 px-3.5 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-content">
                      {p.kind === 'sale' ? 'Venta' : 'Renovación'} · {methodLabel(p.method)}
                    </p>
                    <p className="text-xs text-content-muted">{formatDate(p.date, 'D MMM YYYY')}</p>
                    <ReceiptActions payment={p} receipt={receipt} canUpload />
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-content">
                    {formatMoney(p.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </ResponsiveModal>
  );
}
