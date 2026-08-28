import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { App, Button, Empty, Space, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';

import { PageHeader } from '@/components/panel/page-header';
import { withErrorBoundary } from '@/hoc/with-error-boundary';
import {
  useCustomers,
  useDeleteCustomer,
  type ICustomer,
} from '../hooks/use-customers';
import { CustomerFormModal } from '../components/customer-form-modal';
import { CustomerDetailDrawer } from '../components/customer-detail-drawer';

function CustomersPageComponent() {
  const { modal } = App.useApp();
  const { data: customers, isLoading, isError } = useCustomers();
  const { mutate: deleteCustomer } = useDeleteCustomer();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ICustomer | null>(null);
  const [detail, setDetail] = useState<ICustomer | null>(null);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (customer: ICustomer) => {
    setEditing(customer);
    setModalOpen(true);
  };

  const confirmDelete = (customer: ICustomer) => {
    modal.confirm({
      title: `Eliminar a "${customer.name}"`,
      content: 'Esta acción no se puede deshacer.',
      okText: 'Eliminar',
      okButtonProps: { danger: true },
      cancelText: 'Cancelar',
      onOk: () => deleteCustomer(customer.id),
    });
  };

  const count = customers?.length ?? 0;

  const columns: ColumnsType<ICustomer> = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string) => <span className="font-medium text-content">{name}</span>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      render: (email?: string) => email || <span className="text-content-subtle">—</span>,
    },
    {
      title: 'Teléfono',
      dataIndex: 'phone',
      render: (phone?: string) => phone || <span className="text-content-subtle">—</span>,
    },
    {
      title: 'Acciones',
      key: 'actions',
      align: 'right',
      render: (_, customer) => (
        <Space onClick={e => e.stopPropagation()}>
          <Tooltip title="Ver historial">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setDetail(customer)}
            />
          </Tooltip>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(customer)}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => confirmDelete(customer)}
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Clientes"
        subtitle={count ? `${count} cliente${count === 1 ? '' : 's'}` : 'Tus clientes'}
        action={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Nuevo
          </Button>
        }
      />

      {isError ? (
        <Empty className="py-16" description="No se pudo cargar la información" />
      ) : (
        <Table<ICustomer>
          rowKey="id"
          columns={columns}
          dataSource={customers}
          loading={isLoading}
          size="middle"
          scroll={{ x: 'max-content' }}
          pagination={{ pageSize: 10, hideOnSinglePage: true }}
          onRow={customer => ({
            onClick: () => setDetail(customer),
            className: 'cursor-pointer',
          })}
          locale={{
            emptyText: <Empty description="Aún no tienes clientes. Agrega el primero." />,
          }}
        />
      )}

      <CustomerFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        customer={editing}
      />
      <CustomerDetailDrawer
        customer={detail}
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
      />
    </>
  );
}

export const CustomersPage = withErrorBoundary(CustomersPageComponent);
