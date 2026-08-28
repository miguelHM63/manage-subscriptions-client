import { Form, Input, Modal } from 'antd';
import { useEffect } from 'react';

import { REQUIRED_TEXT } from '@/constants';
import { useFormErrorHandler } from '@/hooks/use-form-error-handler';
import {
  useCreateService,
  useUpdateService,
  type IService,
  type ServiceBody,
} from '../hooks/use-services';
import { LogoPicker } from './logo-picker';

interface ServiceFormModalProps {
  open: boolean;
  onClose: () => void;
  service?: IService | null;
}

export function ServiceFormModal({ open, onClose, service }: ServiceFormModalProps) {
  const [invalidateForm, form] = useFormErrorHandler();
  const isEdit = Boolean(service);

  const { mutate: createService, isPending: isCreating } = useCreateService(onClose);
  const { mutate: updateService, isPending: isUpdating } = useUpdateService(onClose);
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (open) {
      form.setFieldsValue({ name: service?.name, iconUrl: service?.iconUrl });
    }
  }, [open, service, form]);

  const onFinish = (values: ServiceBody) => {
    const body: ServiceBody = {
      name: values.name,
      iconUrl: values.iconUrl || undefined,
    };
    if (isEdit && service) {
      updateService({ id: service.id, body }, { onError: invalidateForm });
    } else {
      createService(body, { onError: invalidateForm });
    }
  };

  return (
    <Modal
      title={isEdit ? 'Editar servicio' : 'Nuevo servicio'}
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText={isEdit ? 'Guardar' : 'Crear'}
      cancelText="Cancelar"
      confirmLoading={isLoading}
    >
      <Form layout="vertical" form={form} onFinish={onFinish} disabled={isLoading}>
        <Form.Item label="Nombre" name="name" rules={REQUIRED_TEXT}>
          <Input placeholder="Netflix, Spotify, HBO Max..." />
        </Form.Item>
        <Form.Item label="Logo (opcional)" name="iconUrl">
          <LogoPicker />
        </Form.Item>
      </Form>
    </Modal>
  );
}
