import { DatePicker, Form, InputNumber } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect } from 'react';

import { ResponsiveModal } from '@/components/panel/responsive-modal';
import { REQUIRED } from '@/constants';
import { formatDate } from '@/helpers/dates';
import { centsToSoles, formatMoney, solesToCents } from '@/helpers/money';
import { useFormErrorHandler } from '@/hooks/use-form-error-handler';
import { useRenewProviderAccount, type IProviderAccount } from '../hooks/use-provider-accounts';

interface FormValues {
  periodStart: Dayjs;
  expiresAt: Dayjs;
  cost: number;
}

interface Props {
  account: IProviderAccount | null;
  open: boolean;
  onClose: () => void;
}

/** Meses aproximados entre dos fechas (30 días = 1 mes). */
const monthsBetween = (from: Dayjs, to: Dayjs) => Math.max(to.diff(from, 'day') / 30, 1);

/**
 * Renueva la cuenta de proveedor: abre un periodo nuevo desde hoy (o la fecha
 * elegida) con su vencimiento y costo. El costo por cupo al mes, que usan los
 * precios de las promociones, se calcula sobre este periodo.
 */
export function RenewProviderAccountModal({ account, open, onClose }: Props) {
  const [invalidateForm, form] = useFormErrorHandler();
  const { mutate: renew, isPending } = useRenewProviderAccount(onClose);

  useEffect(() => {
    if (!open || !account) return;
    // Por defecto, el mismo largo y costo que el periodo anterior.
    const previousDays =
      account.expiresAt && account.periodStart
        ? dayjs(account.expiresAt).diff(dayjs(account.periodStart), 'day')
        : 30;
    form.setFieldsValue({
      periodStart: dayjs().startOf('day'),
      expiresAt: dayjs().add(Math.max(previousDays, 1), 'day'),
      cost: centsToSoles(account.cost) || undefined,
    });
  }, [open, account, form]);

  const periodStart = Form.useWatch('periodStart', form);
  const expiresAt = Form.useWatch('expiresAt', form);
  const cost = Form.useWatch('cost', form);
  const perSlotMonth =
    account && periodStart && expiresAt && cost && expiresAt.isAfter(periodStart)
      ? solesToCents(cost) / account.capacity / monthsBetween(periodStart, expiresAt)
      : null;

  const onFinish = (values: FormValues) => {
    if (!account) return;
    renew(
      {
        id: account.id,
        body: {
          periodStart: values.periodStart.toISOString(),
          expiresAt: values.expiresAt.endOf('day').toISOString(),
          cost: solesToCents(values.cost),
        },
      },
      { onError: invalidateForm },
    );
  };

  return (
    <ResponsiveModal
      title="Renovar cuenta"
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Renovar"
      confirmLoading={isPending}
    >
      <Form form={form} layout="vertical" onFinish={onFinish} disabled={isPending}>
        {account?.expiresAt && (
          <p className="mb-4 text-sm text-content-muted">
            Vence el {formatDate(account.expiresAt, 'D [de] MMMM')}. El nuevo periodo empieza en la
            fecha que elijas.
          </p>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Form.Item label="Inicio del periodo" name="periodStart" rules={REQUIRED}>
            <DatePicker className="w-full" format="DD/MM/YYYY" allowClear={false} />
          </Form.Item>
          <Form.Item
            label="Nuevo vencimiento"
            name="expiresAt"
            rules={[
              ...REQUIRED,
              {
                validator: (_, value?: Dayjs) =>
                  !value || !periodStart || value.isAfter(periodStart)
                    ? Promise.resolve()
                    : Promise.reject(new Error('Debe ser después del inicio')),
              },
            ]}
            dependencies={['periodStart']}
          >
            <DatePicker className="w-full" format="DD/MM/YYYY" allowClear={false} />
          </Form.Item>
        </div>
        <Form.Item
          label="Costo del periodo"
          name="cost"
          rules={REQUIRED}
          extra={perSlotMonth ? `${formatMoney(perSlotMonth)} por cupo al mes` : undefined}
          className="!mb-0"
        >
          <InputNumber
            min={0}
            step={0.5}
            precision={2}
            prefix="S/"
            className="!w-full"
            placeholder="0.00"
          />
        </Form.Item>
      </Form>
    </ResponsiveModal>
  );
}
