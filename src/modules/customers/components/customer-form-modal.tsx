import { Form, Input, Modal } from 'antd';
import { useEffect } from 'react';

import { REQUIRED_TEXT } from '@/constants';
import { useFormErrorHandler } from '@/hooks/use-form-error-handler';
import {
  useCreateCustomer,
  useUpdateCustomer,
  type CustomerBody,
  type ICustomer,
} from '../hooks/use-customers';

interface CustomerFormModalProps {
  open: boolean;
  onClose: () => void;
  customer?: ICustomer | null;
}

export function CustomerFormModal({ open, onClose, customer }: CustomerFormModalProps) {
  const [invalidateForm, form] = useFormErrorHandler();
  const isEdit = Boolean(customer);

  const { mutate: createCustomer, isPending: isCreating } = useCreateCustomer(onClose);
  const { mutate: updateCustomer, isPending: isUpdating } = useUpdateCustomer(onClose);
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        name: customer?.name,
        email: customer?.email,
        phone: customer?.phone,
        notes: customer?.notes,
      });
    }
  }, [open, customer, form]);

  const onFinish = (values: CustomerBody) => {
    const body: CustomerBody = {
      name: values.name,
      email: values.email || undefined,
      phone: values.phone || undefined,
      notes: values.notes || undefined,
    };
    if (isEdit && customer) {
      updateCustomer({ id: customer.id, body }, { onError: invalidateForm });
    } else {
      createCustomer(body, { onError: invalidateForm });
    }
  };

  return (
    <Modal
      title={isEdit ? 'Editar cliente' : 'Nuevo cliente'}
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText={isEdit ? 'Guardar' : 'Crear'}
      cancelText="Cancelar"
      confirmLoading={isLoading}
    >
      <Form layout="vertical" form={form} onFinish={onFinish} disabled={isLoading}>
        <Form.Item label="Nombre" name="name" rules={REQUIRED_TEXT}>
          <Input placeholder="Nombre del cliente" />
        </Form.Item>
        <Form.Item label="Email (opcional)" name="email" rules={[{ type: 'email' }]}>
          <Input placeholder="cliente@email.com" />
        </Form.Item>
        <Form.Item label="Teléfono / WhatsApp (opcional)" name="phone">
          <Input placeholder="+51 999 999 999" />
        </Form.Item>
        <Form.Item label="Notas (opcional)" name="notes">
          <Input.TextArea rows={2} placeholder="Notas internas" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
