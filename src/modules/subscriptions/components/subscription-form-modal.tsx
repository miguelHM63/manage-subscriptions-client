import { PlusOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Segmented,
  Select,
} from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useMemo, useState } from 'react';

import { REQUIRED } from '@/constants';
import { ServiceAvatar } from '@/components/panel/service-avatar';
import { solesToCents } from '@/helpers/money';
import { useFormErrorHandler } from '@/hooks/use-form-error-handler';
import { useCreateCustomer, useCustomers } from '@/modules/customers/hooks/use-customers';
import { useServices } from '@/modules/services/hooks/use-services';
import { useProviderAccounts } from '@/modules/provider-accounts/hooks/use-provider-accounts';
import {
  useCreateSubscription,
  type CreateSubscriptionBody,
} from '../hooks/use-subscriptions';
import { DURATION_OPTIONS } from '../subscription-meta';

interface FormValues {
  customerId: string;
  serviceId: string;
  providerAccountId: string;
  durationMonths: number;
  price: number;
  startDate?: Dayjs;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SubscriptionFormModal({ open, onClose }: Props) {
  const [invalidateForm, form] = useFormErrorHandler();
  const { data: customers } = useCustomers();
  const { data: services } = useServices();
  const { data: accounts } = useProviderAccounts();

  const { mutate: create, isPending } = useCreateSubscription(onClose);
  const { mutate: createCustomer, isPending: creatingCustomer } = useCreateCustomer();

  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [fullAccount, setFullAccount] = useState(false);

  const selectedServiceId = Form.useWatch('serviceId', form);

  useEffect(() => {
    if (open) {
      form.resetFields();
      setShowNewCustomer(false);
      setNewCustomerName('');
      setNewCustomerPhone('');
      setFullAccount(false);
    }
  }, [open, form]);

  // Crea un cliente con datos mínimos sin salir del modal y lo deja seleccionado.
  const handleQuickCreateCustomer = () => {
    const name = newCustomerName.trim();
    if (!name) return;
    createCustomer(
      { name, phone: newCustomerPhone.trim() || undefined },
      {
        onSuccess: created => {
          form.setFieldValue('customerId', created.id);
          form.validateFields(['customerId']);
          setShowNewCustomer(false);
          setNewCustomerName('');
          setNewCustomerPhone('');
        },
      },
    );
  };

  // Cuentas del servicio elegido. Para "cuenta completa" solo las totalmente
  // libres; para "por perfil" las que tengan al menos un cupo disponible.
  const availableAccounts = useMemo(
    () =>
      accounts?.filter(a => {
        if (a.serviceId !== selectedServiceId) return false;
        return fullAccount
          ? a.availableSlots === a.capacity
          : a.availableSlots > 0;
      }) ?? [],
    [accounts, selectedServiceId, fullAccount],
  );

  // Referencia de vigencia: avisa si la suscripción terminaría después de que
  // vence la cuenta de proveedor.
  const selectedAccountId = Form.useWatch('providerAccountId', form);
  const durationMonths = Form.useWatch('durationMonths', form);
  const startDate = Form.useWatch('startDate', form);
  const selectedAccount = accounts?.find(a => a.id === selectedAccountId);
  const accountExpiry = selectedAccount?.expiresAt
    ? dayjs(selectedAccount.expiresAt)
    : null;
  const projectedEnd = durationMonths
    ? (startDate ?? dayjs()).add(durationMonths, 'month')
    : null;
  const exceedsAccount =
    accountExpiry && projectedEnd && projectedEnd.isAfter(accountExpiry, 'day');
  const daysToExpiry = accountExpiry
    ? accountExpiry.startOf('day').diff(dayjs().startOf('day'), 'day')
    : null;
  const expiryFmt = accountExpiry?.format('DD/MM/YYYY') ?? '';
  // Frase de vencimiento: usa días cuando faltan ≤ 15 (o ya venció).
  const accountExpiryPhrase =
    daysToExpiry === null
      ? ''
      : daysToExpiry < 0
        ? `venció hace ${Math.abs(daysToExpiry)} ${
            Math.abs(daysToExpiry) === 1 ? 'día' : 'días'
          } (${expiryFmt})`
        : daysToExpiry === 0
          ? `vence hoy (${expiryFmt})`
          : daysToExpiry <= 15
            ? `vence en ${daysToExpiry} ${daysToExpiry === 1 ? 'día' : 'días'} (${expiryFmt})`
            : `vence el ${expiryFmt}`;

  const onFinish = (values: FormValues) => {
    const body: CreateSubscriptionBody = {
      customerId: values.customerId,
      serviceId: values.serviceId,
      providerAccountId: values.providerAccountId,
      durationMonths: values.durationMonths,
      price: solesToCents(values.price),
      fullAccount,
      startDate: values.startDate?.toISOString(),
    };
    create(body, { onError: invalidateForm });
  };

  return (
    <Modal
      title="Nueva suscripción"
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Crear"
      cancelText="Cancelar"
      confirmLoading={isPending}
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        disabled={isPending}
        initialValues={{ durationMonths: 1, startDate: dayjs() }}
      >
        <Form.Item label="Cliente" name="customerId" rules={REQUIRED} className="!mb-1">
          <Select
            placeholder="Selecciona un cliente"
            showSearch
            optionFilterProp="label"
            options={customers?.map(c => ({ value: c.id, label: c.name }))}
          />
        </Form.Item>

        {!showNewCustomer ? (
          <Button
            type="link"
            size="small"
            icon={<PlusOutlined />}
            className="!mb-3 !px-0"
            onClick={() => setShowNewCustomer(true)}
          >
            Nuevo cliente
          </Button>
        ) : (
          <div className="mb-4 rounded-lg border border-border bg-surface-muted p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-content-muted">Nuevo cliente</span>
              <Button
                type="text"
                size="small"
                onClick={() => setShowNewCustomer(false)}
              >
                Cancelar
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              <Input
                placeholder="Nombre"
                value={newCustomerName}
                onChange={e => setNewCustomerName(e.target.value)}
                onPressEnter={handleQuickCreateCustomer}
              />
              <Input
                placeholder="Teléfono / WhatsApp (opcional)"
                value={newCustomerPhone}
                onChange={e => setNewCustomerPhone(e.target.value)}
                onPressEnter={handleQuickCreateCustomer}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                loading={creatingCustomer}
                disabled={!newCustomerName.trim()}
                onClick={handleQuickCreateCustomer}
                block
              >
                Agregar y seleccionar
              </Button>
            </div>
          </div>
        )}
        <Form.Item label="Servicio" name="serviceId" rules={REQUIRED}>
          <Select
            placeholder="Selecciona un servicio"
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
            onChange={() => form.setFieldValue('providerAccountId', undefined)}
          />
        </Form.Item>
        <Form.Item label="Tipo de venta">
          <Segmented
            block
            value={fullAccount ? 'full' : 'profile'}
            onChange={value => {
              setFullAccount(value === 'full');
              form.setFieldValue('providerAccountId', undefined);
            }}
            options={[
              { label: 'Por perfil', value: 'profile' },
              { label: 'Cuenta completa', value: 'full' },
            ]}
          />
        </Form.Item>
        <Form.Item label="Cuenta de proveedor" name="providerAccountId" rules={REQUIRED}>
          <Select
            placeholder={
              selectedServiceId
                ? 'Selecciona una cuenta'
                : 'Primero elige un servicio'
            }
            disabled={!selectedServiceId}
            notFoundContent={
              fullAccount
                ? 'Sin cuentas completamente libres'
                : 'Sin cuentas con cupo disponible'
            }
            options={availableAccounts.map(a => ({
              value: a.id,
              label: fullAccount
                ? `${a.label || 'Cuenta'} · capacidad ${a.capacity}`
                : `${a.label || 'Cuenta'} · ${a.availableSlots} cupo(s)`,
            }))}
          />
        </Form.Item>

        {accountExpiry &&
          (exceedsAccount ? (
            <Alert
              className="!mb-4 !-mt-1"
              type="warning"
              showIcon
              message={`La cuenta ${accountExpiryPhrase} y esta suscripción terminaría el ${projectedEnd?.format(
                'DD/MM/YYYY',
              )}.`}
            />
          ) : (
            <p
              className={`-mt-1 mb-4 text-xs ${
                daysToExpiry !== null && daysToExpiry < 0
                  ? 'text-danger'
                  : daysToExpiry !== null && daysToExpiry <= 15
                    ? 'text-warning'
                    : 'text-content-muted'
              }`}
            >
              {daysToExpiry !== null && daysToExpiry > 15
                ? `Vigencia de la cuenta: ${expiryFmt}`
                : `La cuenta ${accountExpiryPhrase}`}
            </p>
          ))}

        <div className="grid grid-cols-2 gap-3">
          <Form.Item label="Duración" name="durationMonths" rules={REQUIRED}>
            <Select options={DURATION_OPTIONS} />
          </Form.Item>
          <Form.Item label="Precio (S/.)" name="price" rules={REQUIRED}>
            <InputNumber min={0} step={0.5} className="w-full" placeholder="0.00" />
          </Form.Item>
        </div>

        <Form.Item label="Inicio" name="startDate">
          <DatePicker className="w-full" format="DD/MM/YYYY" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
