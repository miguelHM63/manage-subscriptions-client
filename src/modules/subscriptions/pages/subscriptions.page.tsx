import {
  MoreOutlined,
  PlusOutlined,
  ReloadOutlined,
  WhatsAppOutlined,
} from '@ant-design/icons';
import { App, Button, Dropdown, Empty, Space, Table, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';

import { apiAxiosInstance } from '@/api/config';
import { PageHeader } from '@/components/panel/page-header';
import { ServiceAvatar } from '@/components/panel/service-avatar';
import { formatMoney } from '@/helpers/money';
import { withErrorBoundary } from '@/hoc/with-error-boundary';
import { useCustomers } from '@/modules/customers/hooks/use-customers';
import { useServices } from '@/modules/services/hooks/use-services';
import {
  useSubscriptionAction,
  useSubscriptions,
  type ISubscription,
} from '../hooks/use-subscriptions';
import { STATUS_META } from '../subscription-meta';
import { SubscriptionFormModal } from '../components/subscription-form-modal';
import { RenewModal } from '../components/renew-modal';

function SubscriptionsPageComponent() {
  const { modal, message } = App.useApp();
  const { data: subscriptions, isLoading, isError } = useSubscriptions();
  const { data: customers } = useCustomers();
  const { data: services } = useServices();
  const { mutate: runAction } = useSubscriptionAction();

  const [formOpen, setFormOpen] = useState(false);
  const [renewing, setRenewing] = useState<ISubscription | null>(null);

  const customerById = useMemo(() => {
    const map = new Map(customers?.map(c => [c.id, c]));
    return (id: string) => map.get(id);
  }, [customers]);
  const customerName = (id: string) => customerById(id)?.name ?? 'Cliente';

  const serviceById = useMemo(() => {
    const map = new Map(services?.map(s => [s.id, s]));
    return (id: string) => map.get(id);
  }, [services]);

  // Comparte por WhatsApp los datos de acceso de la suscripción. Obtiene las
  // credenciales (desencriptadas) bajo demanda y abre WhatsApp con el mensaje.
  const shareViaWhatsApp = async (sub: ISubscription) => {
    const customer = customerById(sub.customerId);
    const svc = serviceById(sub.serviceId);
    // Abrimos la ventana dentro del gesto del click para evitar bloqueo de popups.
    const win = window.open('', '_blank');
    try {
      const { data: cred } = await apiAxiosInstance.get<{
        username?: string;
        password?: string;
        notes?: string;
      }>(`/provider-accounts/${sub.providerAccountId}/credentials`);

      // Emojis vía escapes Unicode para evitar problemas de codificación del archivo.
      const wave = '\u{1F44B}';
      const userIcon = '\u{1F464}';
      const keyIcon = '\u{1F511}';
      const calendarIcon = '\u{1F4C5}';
      const noteIcon = '\u{1F4DD}';

      const lines = [
        `Hola${customer?.name ? ` ${customer.name}` : ''} ${wave}`,
        '',
        `Estos son los datos de tu suscripción a *${svc?.name ?? 'la plataforma'}*:`,
        `${userIcon} Usuario: ${cred.username ?? '-'}`,
        `${keyIcon} Contraseña: ${cred.password ?? '-'}`,
        `${calendarIcon} Vigencia hasta: ${dayjs(sub.endDate).format('DD/MM/YYYY')}`,
        ...(cred.notes ? ['', `${noteIcon} ${cred.notes}`] : []),
      ];
      const text = encodeURIComponent(lines.join('\n'));

      // Número en formato internacional (asume Perú +51 si son 9 dígitos).
      const digits = (customer?.phone ?? '').replace(/\D/g, '');
      const intl = digits ? (digits.length === 9 ? `51${digits}` : digits) : '';

      // Forzamos WhatsApp Web (navegador): la app de escritorio corrompe los
      // emojis de los enlaces wa.me en Windows.
      const url = intl
        ? `https://web.whatsapp.com/send?phone=${intl}&text=${text}`
        : `https://web.whatsapp.com/send?text=${text}`;

      if (win) win.location.href = url;
      else window.location.href = url;
    } catch {
      win?.close();
      message.error('No se pudieron obtener las credenciales');
    }
  };

  const confirmCancel = (sub: ISubscription) => {
    modal.confirm({
      title: 'Cancelar suscripción',
      content: 'Se liberará el cupo de la cuenta de proveedor. ¿Continuar?',
      okText: 'Cancelar suscripción',
      okButtonProps: { danger: true },
      cancelText: 'Volver',
      onOk: () => runAction({ id: sub.id, action: 'cancel' }),
    });
  };

  const columns: ColumnsType<ISubscription> = [
    {
      title: 'Cliente',
      dataIndex: 'customerId',
      render: (customerId: string) => (
        <span className="font-medium text-content">{customerName(customerId)}</span>
      ),
    },
    {
      title: 'Servicio',
      dataIndex: 'serviceId',
      render: (serviceId: string, sub) => {
        const svc = serviceById(serviceId);
        return (
          <span className="flex items-center gap-2">
            <ServiceAvatar name={svc?.name ?? ''} iconUrl={svc?.iconUrl} size={24} />
            <span className="text-content-muted">{svc?.name ?? 'Servicio'}</span>
            {sub.fullAccount && <Tag color="purple">Completa</Tag>}
          </span>
        );
      },
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      render: (status: ISubscription['status']) => {
        const meta = STATUS_META[status];
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      title: 'Vence',
      dataIndex: 'endDate',
      sorter: (a, b) => dayjs(a.endDate).valueOf() - dayjs(b.endDate).valueOf(),
      render: (endDate: string) => dayjs(endDate).format('DD/MM/YYYY'),
    },
    {
      title: 'Precio',
      dataIndex: 'price',
      align: 'right',
      render: (price: number) => formatMoney(price),
    },
    {
      title: 'Acciones',
      key: 'actions',
      align: 'right',
      render: (_, sub) => {
        if (sub.status === 'cancelled') {
          return <span className="text-content-subtle">—</span>;
        }
        const isPaused = sub.status === 'paused';
        return (
          <Space>
            <Tooltip title="Compartir por WhatsApp">
              <Button
                size="small"
                icon={<WhatsAppOutlined />}
                style={{ color: '#25D366', borderColor: '#25D366' }}
                onClick={() => shareViaWhatsApp(sub)}
              />
            </Tooltip>
            <Button
              size="small"
              type="primary"
              icon={<ReloadOutlined />}
              onClick={() => setRenewing(sub)}
            >
              Renovar
            </Button>
            <Dropdown
              trigger={['click']}
              menu={{
                items: [
                  isPaused
                    ? { key: 'resume', label: 'Reanudar' }
                    : { key: 'pause', label: 'Pausar' },
                  { key: 'cancel', label: 'Cancelar', danger: true },
                ],
                onClick: ({ key }) => {
                  if (key === 'cancel') confirmCancel(sub);
                  else runAction({ id: sub.id, action: key as 'pause' | 'resume' });
                },
              }}
            >
              <Button size="small" icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="Suscripciones"
        subtitle="Ventas activas y sus vencimientos"
        action={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>
            Nueva
          </Button>
        }
      />

      {isError ? (
        <Empty className="py-16" description="No se pudo cargar la información" />
      ) : (
        <Table<ISubscription>
          rowKey="id"
          columns={columns}
          dataSource={subscriptions}
          loading={isLoading}
          size="middle"
          scroll={{ x: 'max-content' }}
          pagination={{ pageSize: 10, hideOnSinglePage: true }}
          locale={{
            emptyText: (
              <Empty description="Aún no tienes suscripciones. Registra la primera venta." />
            ),
          }}
        />
      )}

      <SubscriptionFormModal open={formOpen} onClose={() => setFormOpen(false)} />
      <RenewModal
        subscription={renewing}
        open={Boolean(renewing)}
        onClose={() => setRenewing(null)}
      />
    </>
  );
}

export const SubscriptionsPage = withErrorBoundary(SubscriptionsPageComponent);
