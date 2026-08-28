import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { App, Button, Empty, Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';

import { PageHeader } from '@/components/panel/page-header';
import { ServiceAvatar } from '@/components/panel/service-avatar';
import { withErrorBoundary } from '@/hoc/with-error-boundary';
import {
  useDeleteService,
  useServices,
  type IService,
} from '../hooks/use-services';
import { ServiceFormModal } from '../components/service-form-modal';

function ServicesPageComponent() {
  const { modal } = App.useApp();
  const { data: services, isLoading, isError } = useServices();
  const { mutate: deleteService } = useDeleteService();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IService | null>(null);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (service: IService) => {
    setEditing(service);
    setModalOpen(true);
  };

  const confirmDelete = (service: IService) => {
    modal.confirm({
      title: `Eliminar "${service.name}"`,
      content: 'Esta acción no se puede deshacer.',
      okText: 'Eliminar',
      okButtonProps: { danger: true },
      cancelText: 'Cancelar',
      onOk: () => deleteService(service.id),
    });
  };

  const columns: ColumnsType<IService> = [
    {
      title: 'Servicio',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, service) => (
        <span className="flex items-center gap-2">
          <ServiceAvatar name={name} iconUrl={service.iconUrl} size={28} />
          <span className="font-medium text-content">{name}</span>
        </span>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      align: 'right',
      render: (_, service) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(service)}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => confirmDelete(service)}
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Servicios"
        subtitle="Catálogo de plataformas que ofreces"
        action={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Nuevo
          </Button>
        }
      />

      {isError ? (
        <Empty className="py-16" description="No se pudo cargar la información" />
      ) : (
        <Table<IService>
          rowKey="id"
          columns={columns}
          dataSource={services}
          loading={isLoading}
          size="middle"
          scroll={{ x: 'max-content' }}
          pagination={{ pageSize: 10, hideOnSinglePage: true }}
          locale={{
            emptyText: <Empty description="Aún no tienes servicios. Crea el primero." />,
          }}
        />
      )}

      <ServiceFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        service={editing}
      />
    </>
  );
}

export const ServicesPage = withErrorBoundary(ServicesPageComponent);
