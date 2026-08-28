import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { App, Button, Empty, Progress, Space, Table, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';

import { PageHeader } from '@/components/panel/page-header';
import { ServiceAvatar } from '@/components/panel/service-avatar';
import { formatMoney } from '@/helpers/money';
import { withErrorBoundary } from '@/hoc/with-error-boundary';
import { useServices } from '@/modules/services/hooks/use-services';
import {
  useDeleteProviderAccount,
  useProviderAccounts,
  type IProviderAccount,
} from '../hooks/use-provider-accounts';
import { ProviderAccountFormModal } from '../components/provider-account-form-modal';
import { CredentialsModal } from '../components/credentials-modal';

function ProviderAccountsPageComponent() {
  const { modal } = App.useApp();
  const { data: accounts, isLoading, isError } = useProviderAccounts();
  const { data: services } = useServices();
  const { mutate: deleteAccount } = useDeleteProviderAccount();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<IProviderAccount | null>(null);
  const [credentialsId, setCredentialsId] = useState<string | null>(null);

  const serviceById = useMemo(() => {
    const map = new Map(services?.map(s => [s.id, s]));
    return (id: string) => map.get(id);
  }, [services]);
  const serviceName = (id: string) => serviceById(id)?.name ?? 'Servicio';

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (account: IProviderAccount) => {
    setEditing(account);
    setFormOpen(true);
  };

  const confirmDelete = (account: IProviderAccount) => {
    modal.confirm({
      title: 'Eliminar cuenta de proveedor',
      content: 'Solo puedes eliminarla si no tiene suscripciones activas.',
      okText: 'Eliminar',
      okButtonProps: { danger: true },
      cancelText: 'Cancelar',
      onOk: () => deleteAccount(account.id),
    });
  };

  const columns: ColumnsType<IProviderAccount> = [
    {
      title: 'Cuenta',
      key: 'account',
      render: (_, account) => {
        const svc = serviceById(account.serviceId);
        return (
          <span className="flex items-center gap-2">
            <ServiceAvatar name={svc?.name ?? ''} iconUrl={svc?.iconUrl} size={28} />
            <span className="min-w-0">
              <span className="block truncate font-medium text-content">
                {account.label || serviceName(account.serviceId)}
              </span>
              <Tag className="mt-0.5">{serviceName(account.serviceId)}</Tag>
            </span>
          </span>
        );
      },
      //align: 'center',
    },
    {
      title: 'Cupos',
      key: 'slots',
      width: 180,
      render: (_, account) => {
        const percent = account.capacity
          ? Math.round((account.usedSlots / account.capacity) * 100)
          : 0;
        return (
          <div>
            <div className="flex justify-between text-xs text-content-muted">
              <span>
                {account.usedSlots}/{account.capacity}
              </span>
              <span>{account.availableSlots} libres</span>
            </div>
            <Progress percent={percent} showInfo={false} size="small" />
          </div>
        );
      },
      align: 'center',
    },
    {
      title: 'Costo',
      key: 'cost',
      align: 'center',
      render: (_, account) => (
        <div>
          <div>{formatMoney(account.cost)}</div>
          {account.capacity > 0 && account.cost > 0 && (
            <div className="text-xs text-content-subtle">
              {formatMoney(account.cost / account.capacity)} c/u
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Vence',
      dataIndex: 'expiresAt',
      render: (expiresAt?: string) => {
        if (!expiresAt) return <span className="text-content-subtle">—</span>;
        const date = dayjs(expiresAt);
        const days = date.startOf('day').diff(dayjs().startOf('day'), 'day');
        const expired = days < 0;

        // Nota de días cuando falta menos de un mes (o ya venció).
        let note: string | null = null;
        if (expired) {
          note = `venció hace ${Math.abs(days)} ${Math.abs(days) === 1 ? 'día' : 'días'}`;
        } else if (days === 0) {
          note = 'vence hoy';
        } else if (days <= 30) {
          note = `en ${days} ${days === 1 ? 'día' : 'días'}`;
        }
        const noteClass = expired
          ? 'text-danger'
          : days <= 15
            ? 'text-warning'
            : 'text-content-subtle';

        return (
          <div>
            <div className={expired ? 'text-danger' : undefined}>{date.format('DD/MM/YYYY')}</div>
            {note && <div className={`text-xs ${noteClass}`}>{note}</div>}
          </div>
        );
      },
      align: 'center',
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, account) => (
        <Space>
          <Tooltip title="Ver credenciales">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setCredentialsId(account.id)}
            />
          </Tooltip>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(account)}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => confirmDelete(account)}
          />
        </Space>
      ),
      align: 'center',
    },
  ];

  return (
    <>
      <PageHeader
        title="Cuentas de proveedor"
        subtitle="Tus cuentas de proveedor y sus cupos"
        action={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Nueva
          </Button>
        }
      />

      {isError ? (
        <Empty className="py-16" description="No se pudo cargar la información" />
      ) : (
        <Table<IProviderAccount>
          rowKey="id"
          columns={columns}
          dataSource={accounts}
          loading={isLoading}
          size="middle"
          scroll={{ x: 'max-content' }}
          pagination={{ pageSize: 10, hideOnSinglePage: true }}
          locale={{
            emptyText: <Empty description="Aún no tienes cuentas de proveedor. Crea la primera." />,
          }}
        />
      )}

      <ProviderAccountFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        account={editing}
      />
      <CredentialsModal
        accountId={credentialsId}
        open={Boolean(credentialsId)}
        onClose={() => setCredentialsId(null)}
      />
    </>
  );
}

export const ProviderAccountsPage = withErrorBoundary(ProviderAccountsPageComponent);
