import { ArrowRightOutlined } from '@ant-design/icons';
import { DatePicker, Form, InputNumber } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect } from 'react';

import { ResponsiveModal } from '@/components/panel/responsive-modal';
import { ServiceAvatar } from '@/components/panel/service-avatar';
import { REQUIRED } from '@/constants';
import cn from '@/helpers/cn';
import { formatDate } from '@/helpers/dates';
import { centsToSoles, solesToCents } from '@/helpers/money';
import { useFormErrorHandler } from '@/hooks/use-form-error-handler';
import {
  useRenewSubscription,
  type ISubscription,
  type PaymentMethod,
} from '../hooks/use-subscriptions';
import { useLookups } from '../hooks/use-lookups';
import { PAYMENT_METHOD_OPTIONS } from '../subscription-meta';

interface FormValues {
  amount: number;
  method?: PaymentMethod;
  date?: Dayjs;
}

interface Props {
  subscription: ISubscription | null;
  open: boolean;
  onClose: () => void;
}

/**
 * Nuevo vencimiento tras renovar. Misma regla que el backend
 * (renew-subscription.handler): si aún no vence se extiende desde su fin; si
 * ya venció, desde hoy.
 */
export const nextEndDate = (sub: ISubscription): Dayjs => {
  const end = dayjs(sub.endDate);
  const base = end.isAfter(dayjs()) ? end : dayjs();
  return base.add(sub.durationMonths, 'month');
};

// Chips de método de pago, controlados por Form.Item (value/onChange).
function MethodChips({
  value,
  onChange,
}: {
  value?: PaymentMethod;
  onChange?: (value: PaymentMethod) => void;
}) {
  return (
    <div role="radiogroup" className="flex flex-wrap gap-2">
      {PAYMENT_METHOD_OPTIONS.map(option => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange?.(option.value)}
            className={cn(
              'h-10 rounded-lg px-3.5 text-sm font-semibold transition-colors',
              selected
                ? 'border-[1.5px] border-brand-500 bg-brand-50 text-brand-ink dark:bg-brand-400/15'
                : 'border border-border bg-surface text-content',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function RenewModal({ subscription, open, onClose }: Props) {
  const [invalidateForm, form] = useFormErrorHandler();
  const { mutate: renew, isPending } = useRenewSubscription(onClose);
  const { customerName, service } = useLookups();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        amount: subscription ? centsToSoles(subscription.price) : undefined,
        method: 'cash',
        date: dayjs(),
      });
    }
  }, [open, subscription, form]);

  const onFinish = (values: FormValues) => {
    if (!subscription) return;
    renew(
      {
        id: subscription.id,
        body: {
          amount: solesToCents(values.amount),
          method: values.method,
          date: values.date?.toISOString(),
        },
      },
      { onError: invalidateForm },
    );
  };

  const svc = subscription ? service(subscription.serviceId) : undefined;
  const expired = subscription ? dayjs(subscription.endDate).isBefore(dayjs()) : false;

  return (
    <ResponsiveModal
      title="Renovar suscripción"
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Registrar pago"
      confirmLoading={isPending}
    >
      {subscription && (
        <div className="mb-5 flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-muted p-3">
            <ServiceAvatar name={svc?.name ?? ''} iconUrl={svc?.iconUrl} size={40} />
            <div className="min-w-0">
              <p className="truncate font-semibold text-content">
                {customerName(subscription.customerId)}
              </p>
              <p className="truncate text-xs text-content-muted">
                {svc?.name ?? 'Servicio'} · {subscription.durationMonths}{' '}
                {subscription.durationMonths === 1 ? 'mes' : 'meses'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div>
              <p className="text-xs text-content-subtle">{expired ? 'Venció' : 'Vence'}</p>
              <p className={cn('font-semibold', expired ? 'text-danger' : 'text-content')}>
                {formatDate(subscription.endDate, 'D MMM YYYY')}
              </p>
            </div>
            <div className="flex flex-1 items-center gap-1 text-content-subtle">
              <span className="h-px flex-1 border-t-[1.5px] border-dashed border-border" />
              <ArrowRightOutlined />
            </div>
            <div className="text-right">
              <p className="text-xs text-content-subtle">Nuevo vencimiento</p>
              <p className="font-semibold text-success">
                {formatDate(nextEndDate(subscription).toDate(), 'D MMM YYYY')}
              </p>
            </div>
          </div>
          {expired && (
            <p className="-mt-2 text-xs text-content-muted">
              Como ya venció, el nuevo periodo se cuenta desde hoy.
            </p>
          )}
        </div>
      )}

      <Form layout="vertical" form={form} onFinish={onFinish} disabled={isPending}>
        <Form.Item label="Monto cobrado" name="amount" rules={REQUIRED}>
          <InputNumber
            min={0}
            step={0.5}
            precision={2}
            size="large"
            prefix="S/"
            className="!w-full"
            placeholder="0.00"
          />
        </Form.Item>
        <Form.Item label="Método de pago" name="method">
          <MethodChips />
        </Form.Item>
        <Form.Item label="Fecha del pago" name="date" className="!mb-0">
          <DatePicker size="large" className="w-full" format="DD/MM/YYYY" inputReadOnly />
        </Form.Item>
      </Form>
    </ResponsiveModal>
  );
}
