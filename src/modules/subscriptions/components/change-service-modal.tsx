import { DatePicker, Form, InputNumber, Segmented, Select } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useMemo, useState } from 'react';

import { ResponsiveModal } from '@/components/panel/responsive-modal';
import { ServiceAvatar } from '@/components/panel/service-avatar';
import { REQUIRED } from '@/constants';
import { formatDate } from '@/helpers/dates';
import { centsToSoles, formatMoney, solesToCents } from '@/helpers/money';
import { useFormErrorHandler } from '@/hooks/use-form-error-handler';
import { useProviderAccounts } from '@/modules/provider-accounts/hooks/use-provider-accounts';
import { useServices } from '@/modules/services/hooks/use-services';
import { useChangeService, type ISubscription } from '../hooks/use-subscriptions';
import { useLookups } from '../hooks/use-lookups';

interface FormValues {
  serviceId: string;
  providerAccountId: string;
  price: number;
  startDate: Dayjs;
  endDate: Dayjs;
}

interface Props {
  subscription: ISubscription | null;
  open: boolean;
  onClose: () => void;
}

/**
 * Pasa al cliente a otro servicio (o a otra cuenta del mismo). La suscripción
 * actual queda como "Cambiada" con sus pagos, y la nueva conserva el
 * vencimiento salvo que se ajusten las fechas (p. ej. días de regalo).
 */
export function ChangeServiceModal({ subscription, open, onClose }: Props) {
  const [invalidateForm, form] = useFormErrorHandler();
  const { data: services } = useServices();
  const { data: accounts } = useProviderAccounts();
  const { customerName, service } = useLookups();
  // null = usar el tipo de la suscripción actual. Se limpia al cerrar.
  const [fullOverride, setFullOverride] = useState<boolean | null>(null);
  const fullAccount = fullOverride ?? subscription?.fullAccount ?? false;
  const handleClose = () => {
    setFullOverride(null);
    onClose();
  };
  const { mutate: change, isPending } = useChangeService(handleClose);

  useEffect(() => {
    if (open && subscription) {
      form.resetFields();
      // Igual que el valor por defecto del backend: hoy, o el inicio actual si es futuro.
      const start = dayjs(subscription.startDate);
      form.setFieldsValue({
        price: centsToSoles(subscription.price),
        startDate: start.isAfter(dayjs()) ? start : dayjs(),
        endDate: dayjs(subscription.endDate),
      });
    }
  }, [open, subscription, form]);

  const selectedServiceId = Form.useWatch('serviceId', form);
  const startDate = Form.useWatch('startDate', form);
  const endDate = Form.useWatch('endDate', form);
  const keepsEnd = subscription && endDate?.isSame(subscription.endDate, 'day');

  // Igual que en "Nueva venta", sin la cuenta en la que ya está.
  const availableAccounts = useMemo(
    () =>
      accounts?.filter(a => {
        if (a.serviceId !== selectedServiceId) return false;
        if (a.id === subscription?.providerAccountId) return false;
        return fullAccount ? a.availableSlots === a.capacity : a.availableSlots > 0;
      }) ?? [],
    [accounts, selectedServiceId, fullAccount, subscription],
  );

  const onFinish = (values: FormValues) => {
    if (!subscription) return;
    change(
      {
        id: subscription.id,
        body: {
          serviceId: values.serviceId,
          providerAccountId: values.providerAccountId,
          fullAccount,
          price: solesToCents(values.price),
          startDate: values.startDate.toISOString(),
          endDate: values.endDate.toISOString(),
        },
      },
      { onError: invalidateForm },
    );
  };

  const current = subscription ? service(subscription.serviceId) : undefined;

  return (
    <ResponsiveModal
      title="Cambiar de servicio"
      open={open}
      onCancel={handleClose}
      onOk={() => form.submit()}
      okText="Cambiar servicio"
      cancelText="Cancelar"
      confirmLoading={isPending}
    >
      {subscription && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-border bg-surface-muted p-3">
          <ServiceAvatar name={current?.name ?? ''} iconUrl={current?.iconUrl} size={40} />
          <div className="min-w-0">
            <p className="truncate font-semibold text-content">
              {customerName(subscription.customerId)}
            </p>
            <p className="truncate text-xs text-content-muted">
              Actual: {current?.name ?? 'Servicio'} · {formatMoney(subscription.price)} · vence{' '}
              {formatDate(subscription.endDate, 'D MMM YYYY')}
            </p>
          </div>
        </div>
      )}

      <Form layout="vertical" form={form} onFinish={onFinish} disabled={isPending}>
        <Form.Item label="Nuevo servicio" name="serviceId" rules={REQUIRED}>
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
              setFullOverride(value === 'full');
              form.setFieldValue('providerAccountId', undefined);
            }}
            options={[
              { label: 'Por perfil', value: 'profile' },
              { label: 'Cuenta completa', value: 'full' },
            ]}
          />
        </Form.Item>
        <Form.Item label="Mis cuentas" name="providerAccountId" rules={REQUIRED}>
          <Select
            placeholder={selectedServiceId ? 'Selecciona una cuenta' : 'Primero elige un servicio'}
            disabled={!selectedServiceId}
            notFoundContent={
              fullAccount ? 'Sin cuentas completamente libres' : 'Sin cuentas con cupo disponible'
            }
            options={availableAccounts.map(a => ({
              value: a.id,
              label: fullAccount
                ? `${a.label || 'Cuenta'} · capacidad ${a.capacity}`
                : `${a.label || 'Cuenta'} · ${a.availableSlots} cupo(s)`,
            }))}
            optionRender={option => {
              const account = availableAccounts.find(a => a.id === option.value);
              return (
                <div className="flex flex-col leading-tight">
                  <span>{option.label}</span>
                  {account?.username && (
                    <span className="truncate text-xs text-content-muted">{account.username}</span>
                  )}
                </div>
              );
            }}
          />
        </Form.Item>
        <Form.Item
          label="Precio por periodo"
          name="price"
          rules={REQUIRED}
          extra="Se aplica desde la próxima renovación."
        >
          <InputNumber min={0} step={0.5} precision={2} prefix="S/" className="!w-full" placeholder="0.00" />
        </Form.Item>
        <div className="grid grid-cols-2 gap-3">
          <Form.Item label="Inicio" name="startDate" rules={REQUIRED}>
            <DatePicker
              className="w-full"
              format="DD/MM/YYYY"
              allowClear={false}
              inputReadOnly
              onChange={(value: Dayjs | null) => {
                // Mover el inicio desplaza el vencimiento: se conservan los días restantes.
                if (!value || !startDate || !endDate) return;
                form.setFieldValue('endDate', endDate.add(value.diff(startDate, 'day'), 'day'));
              }}
            />
          </Form.Item>
          <Form.Item
            label="Vencimiento"
            name="endDate"
            dependencies={['startDate']}
            rules={[
              ...REQUIRED,
              ({ getFieldValue }) => ({
                validator: (_, value?: Dayjs) => {
                  const start: Dayjs | undefined = getFieldValue('startDate');
                  return !value || !start || value.isAfter(start, 'day')
                    ? Promise.resolve()
                    : Promise.reject(new Error('Debe ser posterior al inicio'));
                },
              }),
            ]}
          >
            <DatePicker
              className="w-full"
              format="DD/MM/YYYY"
              allowClear={false}
              inputReadOnly
              disabledDate={d => !!startDate && !d.isAfter(startDate, 'day')}
            />
          </Form.Item>
        </div>
      </Form>

      {subscription && (
        <p className="text-xs text-content-muted">
          {keepsEnd
            ? `Mantiene el vencimiento del ${formatDate(subscription.endDate, 'DD/MM/YYYY')}.`
            : `El vencimiento pasa del ${formatDate(subscription.endDate, 'DD/MM/YYYY')} al ${
                endDate?.format('DD/MM/YYYY') ?? '—'
              }.`}{' '}
          La suscripción actual quedará como “Cambiada” con sus pagos y se liberará su cupo.
        </p>
      )}
    </ResponsiveModal>
  );
}
