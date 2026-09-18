import { EditOutlined, PlusOutlined, WhatsAppOutlined } from '@ant-design/icons';
import { Button, Drawer, Skeleton } from 'antd';
import dayjs from 'dayjs';
import { useMemo } from 'react';

import { ServiceAvatar } from '@/components/panel/service-avatar';
import { nameInitials } from '@/components/panel/user-avatar';
import { formatDate, shortDate } from '@/helpers/dates';
import { formatMoney } from '@/helpers/money';
import { whatsappUrl } from '@/helpers/whatsapp';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { useLookups } from '@/modules/subscriptions/hooks/use-lookups';
import { StatusPill } from '@/modules/subscriptions/components/status-pill';
import { useCustomerSubscriptions } from '../hooks/use-customer-subscriptions';
import type { ICustomer } from '../hooks/use-customers';
import { summarizeByCustomer } from '../customer-summary';

interface Props {
  customer: ICustomer | null;
  open: boolean;
  onClose: () => void;
  onEdit: (customer: ICustomer) => void;
  onNewSale: (customer: ICustomer) => void;
}

/** Detalle del cliente: pantalla completa en móvil, panel lateral en escritorio. */
export function CustomerDetailDrawer({ customer, open, onClose, onEdit, onNewSale }: Props) {
  const isMobile = useIsMobile();
  const { service } = useLookups();
  const { data: subscriptions, isLoading } = useCustomerSubscriptions(
    open ? customer?.id : undefined,
  );

  // Vigentes primero (por vencimiento), luego el historial cancelado.
  const sorted = useMemo(
    () =>
      [...(subscriptions ?? [])].sort(
        (a, b) =>
          Number(a.status === 'cancelled') - Number(b.status === 'cancelled') ||
          dayjs(a.endDate).valueOf() - dayjs(b.endDate).valueOf(),
      ),
    [subscriptions],
  );
  const summary = customer
    ? summarizeByCustomer(sorted).get(customer.id)
    : undefined;

  const stat = (value: string, label: string) => (
    <div className="flex flex-col items-center gap-0.5 px-1 text-center">
      <span className="text-base font-bold text-content">{value}</span>
      <span className="text-[11px] text-content-muted">{label}</span>
    </div>
  );

  return (
    <Drawer
      open={open}
      onClose={onClose}
      size={isMobile ? '100%' : 460}
      title={null}
      extra={
        customer && (
          <Button type="text" icon={<EditOutlined />} onClick={() => onEdit(customer)}>
            Editar
          </Button>
        )
      }
    >
      {customer && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col items-center gap-2.5 text-center">
            <span className="flex h-17 w-17 items-center justify-center rounded-full bg-brand-50 text-2xl font-bold text-brand-ink dark:bg-brand-400/15">
              {nameInitials(customer.name)}
            </span>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-content">{customer.name}</h2>
              <p className="mt-0.5 text-sm text-content-muted">
                {[customer.phone, customer.email].filter(Boolean).join(' · ') || 'Sin datos de contacto'}
              </p>
            </div>
          </div>

          <div className="flex gap-2.5">
            {customer.phone && (
              <Button
                href={whatsappUrl(customer.phone)}
                target="_blank"
                icon={<WhatsAppOutlined />}
                className="!h-11 flex-1 !border-[#25D366] !font-semibold !text-[#25D366]"
              >
                WhatsApp
              </Button>
            )}
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="!h-11 flex-1"
              onClick={() => onNewSale(customer)}
            >
              Nueva venta
            </Button>
          </div>

          <div className="grid grid-cols-3 divide-x divide-border rounded-xl border border-border py-3">
            {stat(String(summary?.current.length ?? 0), 'Suscripciones')}
            {stat(formatMoney(summary?.monthly ?? 0), 'Al mes')}
            {stat(customer.createdAt ? formatDate(customer.createdAt, 'MMM YYYY') : '—', 'Cliente desde')}
          </div>

          <section>
            <h3 className="mb-2 text-[11px] font-semibold tracking-wider text-content-subtle uppercase">
              Suscripciones
            </h3>
            {isLoading ? (
              <Skeleton active avatar paragraph={{ rows: 2 }} />
            ) : !sorted.length ? (
              <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-content-muted">
                Todavía no tiene suscripciones.
              </p>
            ) : (
              <div className="divide-y divide-border rounded-xl border border-border">
                {sorted.map(sub => {
                  const svc = service(sub.serviceId);
                  const detail = [
                    sub.fullAccount ? 'Cuenta completa' : `${sub.seats} cupo${sub.seats === 1 ? '' : 's'}`,
                    formatMoney(sub.price),
                    sub.status === 'cancelled' ? null : `vence ${shortDate(sub.endDate)}`,
                  ]
                    .filter(Boolean)
                    .join(' · ');
                  return (
                    <div key={sub.id} className="flex items-center gap-3 px-3.5 py-3">
                      <ServiceAvatar name={svc?.name ?? ''} iconUrl={svc?.iconUrl} size={36} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-content">{svc?.name ?? 'Servicio'}</p>
                        <p className="truncate text-xs text-content-muted">{detail}</p>
                      </div>
                      <StatusPill status={sub.status} />
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {customer.notes && (
            <section>
              <h3 className="mb-2 text-[11px] font-semibold tracking-wider text-content-subtle uppercase">
                Notas
              </h3>
              <p className="rounded-xl border border-border px-3.5 py-3 text-sm whitespace-pre-line text-content-muted">
                {customer.notes}
              </p>
            </section>
          )}
        </div>
      )}
    </Drawer>
  );
}
