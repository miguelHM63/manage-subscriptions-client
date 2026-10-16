import { DollarOutlined, EditOutlined, MailOutlined, WhatsAppOutlined } from '@ant-design/icons';
import { Button, Drawer } from 'antd';
import { useState } from 'react';

import { dueLabel, formatDate } from '@/helpers/dates';
import { formatPhone } from '@/helpers/phone';
import { whatsappUrl } from '@/helpers/whatsapp';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { BILLING_CYCLE_LABEL, PLAN_LABEL } from '@/modules/organization/hooks/use-my-organization';
import { PlanPaymentsList } from '@/modules/organization/components/plan-payments-list';
import { planHealth } from '@/modules/organization/plan-status';
import {
  ownerName,
  usePlanPayments,
  type IAdminOrganization,
} from '../hooks/use-admin-organizations';
import { ChangePlanModal } from './change-plan-modal';
import { PlanPill } from './plan-pill';
import { RegisterPaymentModal } from './register-payment-modal';

interface Props {
  org: IAdminOrganization | null;
  open: boolean;
  onClose: () => void;
}

/** Ficha de un negocio: contacto del dueño, plan, uso, acciones e historial de pagos. */
export function OrganizationDrawer({ org, open, onClose }: Props) {
  const isMobile = useIsMobile();
  const [paying, setPaying] = useState(false);
  const [changing, setChanging] = useState(false);
  const { data: payments, isLoading } = usePlanPayments(open ? org?.id : undefined);

  if (!org) return <Drawer open={false} />;

  const { health, days } = planHealth(org);
  const max = org.limits.maxCustomers;

  const stat = (value: string, label: string) => (
    <div className="flex flex-col items-center gap-0.5 px-1 text-center">
      <span className="text-base font-bold text-content">{value}</span>
      <span className="text-[11px] text-content-muted">{label}</span>
    </div>
  );

  const validity =
    org.plan === 'free'
      ? 'Sin plan de pago'
      : org.planValidUntil
        ? `${BILLING_CYCLE_LABEL[org.billingCycle]} · ${
            (days ?? 0) < 0 ? 'Venció' : 'Vence'
          } el ${formatDate(org.planValidUntil, 'D MMM YYYY')}${
            health === 'expiring' ? ` (${dueLabel(days ?? 0).toLowerCase()})` : ''
          }`
        : `${BILLING_CYCLE_LABEL[org.billingCycle]} · Sin vencimiento`;

  return (
    <Drawer open={open} onClose={onClose} size={isMobile ? '100%' : 460} title={null}>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <PlanPill org={org} className="self-start" />
          <h2 className="mt-1.5 text-xl font-bold tracking-tight text-content">{org.name}</h2>
          <p className="text-sm text-content-muted">
            {ownerName(org) || 'Sin nombre'}
            {org.createdAt && ` · desde ${formatDate(org.createdAt, 'D MMM YYYY')}`}
          </p>
        </div>

        <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-3.5 text-sm">
          {org.owner?.email ? (
            <a
              href={`mailto:${org.owner.email}`}
              className="flex items-center gap-2.5 !text-content"
            >
              <MailOutlined className="text-content-subtle" />
              <span className="truncate">{org.owner.email}</span>
            </a>
          ) : (
            <span className="text-content-muted">Sin correo</span>
          )}
          {org.owner?.phone ? (
            <a
              href={whatsappUrl(org.owner.phone)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 !text-content"
            >
              <WhatsAppOutlined className="!text-[#25D366]" />
              <span>{formatPhone(org.owner.phone)}</span>
            </a>
          ) : (
            <span className="text-content-muted">Sin WhatsApp registrado</span>
          )}
        </div>

        <div className="grid grid-cols-3 divide-x divide-border rounded-xl border border-border bg-surface py-3">
          {stat(
            max === -1 ? String(org.usage.customers) : `${org.usage.customers}/${max}`,
            'Clientes',
          )}
          {stat(String(org.members), org.members === 1 ? 'Usuario' : 'Usuarios')}
          {stat(PLAN_LABEL[org.effectivePlan], 'Límites')}
        </div>

        <section className="flex flex-col gap-2.5">
          <h3 className="text-[11px] font-semibold tracking-wider text-content-subtle uppercase">
            Plan
          </h3>
          <p className="text-sm text-content">{validity}</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="primary"
              size="large"
              icon={<DollarOutlined />}
              onClick={() => setPaying(true)}
            >
              Registrar pago
            </Button>
            <Button size="large" icon={<EditOutlined />} onClick={() => setChanging(true)}>
              Ajustar plan
            </Button>
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="text-[11px] font-semibold tracking-wider text-content-subtle uppercase">
            Pagos{payments?.length ? ` · ${payments.length}` : ''}
          </h3>
          <PlanPaymentsList payments={payments} isLoading={isLoading} />
        </section>
      </div>

      <RegisterPaymentModal org={org} open={paying} onClose={() => setPaying(false)} />
      <ChangePlanModal org={org} open={changing} onClose={() => setChanging(false)} />
    </Drawer>
  );
}
