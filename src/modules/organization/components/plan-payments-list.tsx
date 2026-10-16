import { Skeleton } from 'antd';
import type { ReactNode } from 'react';

import { formatDate } from '@/helpers/dates';
import { formatMoney } from '@/helpers/money';
import { BILLING_CYCLE_LABEL, PLAN_LABEL, type IPlanPayment } from '../hooks/use-my-organization';

interface Props {
  payments?: IPlanPayment[];
  isLoading?: boolean;
  /** Qué mostrar cuando no hay pagos. */
  empty?: ReactNode;
}

/** Pagos de un plan, del más reciente al más antiguo: periodo cubierto, nota y monto. */
export function PlanPaymentsList({ payments, isLoading, empty }: Props) {
  if (isLoading) return <Skeleton active paragraph={{ rows: 2 }} />;
  if (!payments?.length) {
    return (
      <>{empty ?? <p className="text-sm text-content-muted">Aún no hay pagos registrados.</p>}</>
    );
  }

  return (
    <div className="divide-y divide-border rounded-xl border border-border bg-surface shadow-sm">
      {payments.map(p => (
        <div key={p.id} className="flex items-start justify-between gap-3 px-3.5 py-2.5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-content">
              {PLAN_LABEL[p.plan]} · {BILLING_CYCLE_LABEL[p.billingCycle]}
            </p>
            <p className="text-xs break-words text-content-muted">
              {formatDate(p.validFrom, 'D MMM')} – {formatDate(p.validUntil, 'D MMM YYYY')}
              {p.creditDays > 0 && ` · +${p.creditDays} días del plan anterior`}
              {p.note && ` · ${p.note}`}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-sm font-semibold text-content">{formatMoney(p.amount)}</p>
            <p className="text-xs text-content-subtle">{formatDate(p.createdAt, 'D MMM YYYY')}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
