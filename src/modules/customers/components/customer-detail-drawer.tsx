import { MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { Card, Drawer, Empty, Spin, Tag } from 'antd';
import dayjs from 'dayjs';
import { useMemo } from 'react';

import { ServiceAvatar } from '@/components/panel/service-avatar';
import { formatMoney } from '@/helpers/money';
import { useServices } from '@/modules/services/hooks/use-services';
import { STATUS_META } from '@/modules/subscriptions/subscription-meta';
import { useCustomerSubscriptions } from '../hooks/use-customer-subscriptions';
import type { ICustomer } from '../hooks/use-customers';

interface Props {
  customer: ICustomer | null;
  open: boolean;
  onClose: () => void;
}

export function CustomerDetailDrawer({ customer, open, onClose }: Props) {
  const { data: subscriptions, isLoading } = useCustomerSubscriptions(
    open ? customer?.id : undefined,
  );
  const { data: services } = useServices();

  const serviceById = useMemo(() => {
    const map = new Map(services?.map(s => [s.id, s]));
    return (id: string) => map.get(id);
  }, [services]);

  const sorted = useMemo(
    () =>
      [...(subscriptions ?? [])].sort(
        (a, b) => dayjs(b.startDate).valueOf() - dayjs(a.startDate).valueOf(),
      ),
    [subscriptions],
  );

  const activeCount = sorted.filter(s => s.status !== 'cancelled').length;

  return (
    <Drawer
      title={customer?.name ?? 'Cliente'}
      open={open}
      onClose={onClose}
      width="min(460px, 100vw)"
    >
      {/* Contacto */}
      <div className="mb-4 space-y-1 text-sm text-content-muted">
        {customer?.email && (
          <p className="flex items-center gap-2">
            <MailOutlined /> {customer.email}
          </p>
        )}
        {customer?.phone && (
          <p className="flex items-center gap-2">
            <PhoneOutlined /> {customer.phone}
          </p>
        )}
        {customer?.notes && <p className="italic">{customer.notes}</p>}
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-content">
          Historial de suscripciones
        </h3>
        <span className="text-xs text-content-muted">
          {sorted.length} en total · {activeCount} activas
        </span>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spin />
        </div>
      ) : !sorted.length ? (
        <Empty className="py-12" description="Sin suscripciones registradas" />
      ) : (
        <div className="space-y-2">
          {sorted.map(sub => {
            const svc = serviceById(sub.serviceId);
            const meta = STATUS_META[sub.status];
            return (
              <Card key={sub.id} size="small">
                <div className="flex items-start justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2">
                    <ServiceAvatar name={svc?.name ?? ''} iconUrl={svc?.iconUrl} size={28} />
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-content">
                        {svc?.name ?? 'Servicio'}
                        {sub.fullAccount && (
                          <Tag color="purple" className="ml-2">
                            Completa
                          </Tag>
                        )}
                      </span>
                      <span className="block text-xs text-content-muted">
                        {dayjs(sub.startDate).format('DD/MM/YYYY')} →{' '}
                        {dayjs(sub.endDate).format('DD/MM/YYYY')}
                      </span>
                    </span>
                  </span>
                  <Tag color={meta.color}>{meta.label}</Tag>
                </div>
                <div className="mt-2 flex justify-between text-xs text-content-muted">
                  <span>{sub.durationMonths} mes(es)</span>
                  <span className="font-medium">{formatMoney(sub.price)}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Drawer>
  );
}
