import { WhatsAppOutlined } from '@ant-design/icons';
import { Button } from 'antd';

import { formatDate } from '@/helpers/dates';
import { formatMoney } from '@/helpers/money';
import { PlanPaymentsList } from '@/modules/organization/components/plan-payments-list';
import { ReceiptActions } from '@/modules/organization/components/receipt-actions';
import { usePlanPaymentReceipt } from '@/modules/organization/hooks/use-plan-payment-receipt';
import { useSalesWhatsapp } from '@/modules/organization/hooks/use-sales-whatsapp';
import {
  PLAN_LABEL,
  useMyOrganization,
  useMyPlanPayments,
} from '@/modules/organization/hooks/use-my-organization';

/** Historial de pagos del plan del negocio (los registra el equipo al confirmar el pago). */
export function PaymentsTab() {
  const salesWhatsapp = useSalesWhatsapp();
  const { data: org } = useMyOrganization();
  const { data: payments, isLoading } = useMyPlanPayments();
  const receipt = usePlanPaymentReceipt('/organizations/me/plan-payments', [
    ['organizations', 'me', 'plan-payments'],
  ]);

  const total = (payments ?? []).reduce((sum, p) => sum + p.amount, 0);
  const helpUrl = salesWhatsapp('payments');
  const upgradeUrl = salesWhatsapp('upgrade');

  const stat = (value: string, label: string) => (
    <div className="flex flex-col gap-0.5">
      <span className="text-lg font-bold tracking-tight text-content">{value}</span>
      <span className="text-xs text-content-muted">{label}</span>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {Boolean(payments?.length) && (
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-surface p-4">
          {stat(
            formatMoney(total),
            `Total pagado · ${payments!.length} pago${payments!.length === 1 ? '' : 's'}`,
          )}
          {org?.planValidUntil
            ? stat(
                formatDate(org.planValidUntil, 'D MMM YYYY'),
                `Plan ${PLAN_LABEL[org.plan]} vigente hasta`,
              )
            : stat(PLAN_LABEL[org?.plan ?? 'free'], 'Plan actual')}
        </div>
      )}

      <PlanPaymentsList
        payments={payments}
        isLoading={isLoading}
        renderActions={p => (
          // El dueño sube el comprobante una sola vez; reemplazarlo lo hace el equipo.
          <ReceiptActions payment={p} receipt={receipt} canUpload={!p.hasReceipt} />
        )}
        empty={
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-4 py-10 text-center">
            <p className="text-sm font-semibold text-content">Aún no tienes pagos</p>
            <p className="max-w-xs text-sm text-content-muted">
              Cuando actives o renueves un plan de pago, verás aquí cada pago y el periodo que
              cubre.
            </p>
            {upgradeUrl && org?.plan === 'free' && (
              <Button type="primary" icon={<WhatsAppOutlined />} href={upgradeUrl} target="_blank">
                Mejorar plan
              </Button>
            )}
          </div>
        }
      />

      {helpUrl && Boolean(payments?.length) && (
        <p className="text-center text-xs text-content-muted">
          ¿Falta un pago o ves algo raro?{' '}
          <a href={helpUrl} target="_blank" rel="noreferrer" className="font-semibold">
            Escríbenos por WhatsApp
          </a>
        </p>
      )}
    </div>
  );
}
