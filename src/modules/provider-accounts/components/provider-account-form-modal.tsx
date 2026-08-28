import { DatePicker, Form, Input, InputNumber, Modal, Select } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect } from 'react';

import { REQUIRED, REQUIRED_TEXT } from '@/constants';
import { ServiceAvatar } from '@/components/panel/service-avatar';
import { centsToSoles, formatMoney, solesToCents } from '@/helpers/money';
import { useFormErrorHandler } from '@/hooks/use-form-error-handler';
import { useServices } from '@/modules/services/hooks/use-services';
import {
  useCreateProviderAccount,
  useUpdateProviderAccount,
  type IProviderAccount,
  type ProviderAccountBody,
} from '../hooks/use-provider-accounts';

interface FormValues {
  serviceId: string;
  label?: string;
  username?: string;
  password?: string;
  notes?: string;
  capacity: number;
  cost?: number;
  expiresAt?: Dayjs;
}

interface Props {
  open: boolean;
  onClose: () => void;
  account?: IProviderAccount | null;
}

export function ProviderAccountFormModal({ open, onClose, account }: Props) {
  const [invalidateForm, form] = useFormErrorHandler();
  const isEdit = Boolean(account);
  const { data: services } = useServices();

  const { mutate: create, isPending: isCreating } = useCreateProviderAccount(onClose);
  const { mutate: update, isPending: isUpdating } = useUpdateProviderAccount(onClose);
  const isLoading = isCreating || isUpdating;

  // Costo por perfil derivado (costo total ÷ cupos) como ayuda visual.
  const watchedCost = Form.useWatch('cost', form);
  const watchedCapacity = Form.useWatch('capacity', form);
  const perProfile =
    watchedCost && watchedCapacity
      ? formatMoney(solesToCents(watchedCost) / watchedCapacity)
      : null;

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        serviceId: account?.serviceId,
        label: account?.label,
        capacity: account?.capacity ?? 1,
        cost: account ? centsToSoles(account.cost) : undefined,
        expiresAt: account?.expiresAt ? dayjs(account.expiresAt) : undefined,
        // Credenciales no se precargan (no se exponen en el listado).
        username: undefined,
        password: undefined,
        notes: undefined,
      });
    }
  }, [open, account, form]);

  const onFinish = (values: FormValues) => {
    const credentials = {
      username: values.username || undefined,
      password: values.password || undefined,
      notes: values.notes || undefined,
    };
    const hasCredentials = Object.values(credentials).some(Boolean);

    if (isEdit && account) {
      const body: ProviderAccountBody = {
        label: values.label || undefined,
        capacity: values.capacity,
        cost: solesToCents(values.cost),
        // null limpia la fecha si el usuario la borró.
        expiresAt: values.expiresAt ? values.expiresAt.toISOString() : null,
        ...(hasCredentials ? { credentials } : {}),
      };
      update({ id: account.id, body }, { onError: invalidateForm });
    } else {
      const body: ProviderAccountBody = {
        serviceId: values.serviceId,
        label: values.label || undefined,
        capacity: values.capacity,
        cost: solesToCents(values.cost),
        expiresAt: values.expiresAt ? values.expiresAt.toISOString() : undefined,
        credentials,
      };
      create(body, { onError: invalidateForm });
    }
  };

  return (
    <Modal
      title={isEdit ? 'Editar cuenta de proveedor' : 'Nueva cuenta de proveedor'}
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText={isEdit ? 'Guardar' : 'Crear'}
      cancelText="Cancelar"
      confirmLoading={isLoading}
    >
      <Form layout="vertical" form={form} onFinish={onFinish} disabled={isLoading}>
        <Form.Item label="Servicio" name="serviceId" rules={REQUIRED}>
          <Select
            placeholder="Selecciona un servicio"
            disabled={isEdit}
            options={services?.map(s => ({ value: s.id, label: s.name }))}
            optionRender={option => {
              const svc = services?.find(s => s.id === option.value);
              return (
                <span className="flex items-center gap-2">
                  <ServiceAvatar name={svc?.name ?? ''} iconUrl={svc?.iconUrl} size={20} />
                  {option.label}
                </span>
              );
            }}
          />
        </Form.Item>
        <Form.Item label="Etiqueta (opcional)" name="label">
          <Input placeholder="Cuenta Netflix #1" />
        </Form.Item>

        <div className="grid grid-cols-2 gap-3">
          <Form.Item label="Cupos" name="capacity" rules={REQUIRED}>
            <InputNumber min={1} className="w-full" placeholder="5" />
          </Form.Item>
          <Form.Item
            label="Costo de la cuenta (total, S/.)"
            name="cost"
            tooltip="Lo que pagas por toda la cuenta. El costo por perfil se calcula solo."
          >
            <InputNumber min={0} step={0.5} className="w-full" placeholder="0.00" />
          </Form.Item>
        </div>
        {perProfile && (
          <p className="-mt-1 mb-4 text-xs text-content-muted">
            ≈ {perProfile} por perfil ({watchedCapacity} cupos)
          </p>
        )}

        <Form.Item
          label="Vence (opcional)"
          name="expiresAt"
          tooltip="Vigencia de esta cuenta. Sirve de referencia al vender."
        >
          <DatePicker className="w-full" format="DD/MM/YYYY" />
        </Form.Item>

        <p className="mb-2 text-xs font-medium text-content-muted">
          Credenciales {isEdit && '(deja en blanco para no cambiarlas)'}
        </p>
        <Form.Item
          label="Usuario / Email"
          name="username"
          rules={isEdit ? undefined : REQUIRED_TEXT}
        >
          <Input placeholder="correo de la cuenta" autoComplete="off" />
        </Form.Item>
        <Form.Item
          label="Contraseña"
          name="password"
          rules={isEdit ? undefined : REQUIRED_TEXT}
        >
          <Input.Password placeholder="contraseña" autoComplete="new-password" />
        </Form.Item>
        <Form.Item label="Notas (opcional)" name="notes">
          <Input.TextArea rows={2} placeholder="PIN, perfil asignado, etc." />
        </Form.Item>
      </Form>
    </Modal>
  );
}
