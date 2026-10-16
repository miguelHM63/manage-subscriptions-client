import { ArrowRightOutlined, DeleteOutlined, PaperClipOutlined } from '@ant-design/icons';
import { App, Button, DatePicker, Form, InputNumber, Upload } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';

import { ResponsiveModal } from '@/components/panel/responsive-modal';
import { ServiceAvatar } from '@/components/panel/service-avatar';
import { REQUIRED } from '@/constants';
import type { HttpError } from '@/api/config';
import cn from '@/helpers/cn';
import { formatDate } from '@/helpers/dates';
import { centsToSoles, solesToCents } from '@/helpers/money';
import { useFormErrorHandler } from '@/hooks/use-form-error-handler';
import { MY_ORGANIZATION_KEY } from '@/modules/organization/hooks/use-my-organization';
import {
  RECEIPT_ACCEPT,
  receiptFileError,
  usePlanPaymentReceipt,
} from '@/modules/organization/hooks/use-plan-payment-receipt';
import {
  subscriptionPaymentsKey,
  useRenewSubscription,
  type ISubscription,
  type PaymentMethod,
} from '../hooks/use-subscriptions';
import { MethodChips } from './method-chips';
import { useLookups } from '../hooks/use-lookups';

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

export function RenewModal({ subscription, open, onClose }: Props) {
  const [invalidateForm, form] = useFormErrorHandler();
  const { message } = App.useApp();
  const { mutateAsync: renew, isPending } = useRenewSubscription();
  const receipt = usePlanPaymentReceipt(`/subscriptions/${subscription?.id}/payments`, [
    subscriptionPaymentsKey(subscription?.id ?? ''),
    MY_ORGANIZATION_KEY,
  ]);
  const [file, setFile] = useState<File | null>(null);
  const saving = isPending || receipt.upload.isPending;
  const { customerName, service } = useLookups();

  // El archivo elegido se descarta al cerrar.
  const close = () => {
    setFile(null);
    onClose();
  };

  const onPick = (picked: File) => {
    const error = receiptFileError(picked);
    if (error) message.error(error);
    else setFile(picked);
    return Upload.LIST_IGNORE;
  };

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        amount: subscription ? centsToSoles(subscription.price) : undefined,
        method: 'cash',
        date: dayjs(),
      });
    }
  }, [open, subscription, form]);

  const onFinish = async (values: FormValues) => {
    if (!subscription) return;
    let paymentId: string;
    try {
      ({
        payment: { id: paymentId },
      } = await renew({
        id: subscription.id,
        body: {
          amount: solesToCents(values.amount),
          method: values.method,
          date: values.date?.toISOString(),
        },
      }));
    } catch (error) {
      invalidateForm(error as HttpError);
      return;
    }
    if (file) {
      try {
        await receipt.upload.mutateAsync({ paymentId, file });
      } catch {
        // La renovación ya quedó registrada; si fue por el cupo del plan, la
        // hoja de planes ya se mostró.
        message.warning('Renovación registrada, pero el comprobante no se subió.');
      }
    }
    close();
  };

  const svc = subscription ? service(subscription.serviceId) : undefined;
  const expired = subscription ? dayjs(subscription.endDate).isBefore(dayjs()) : false;

  return (
    <ResponsiveModal
      title="Renovar suscripción"
      open={open}
      onCancel={close}
      onOk={() => form.submit()}
      okText="Registrar pago"
      confirmLoading={saving}
    >
      {subscription && (
        <div className="mb-5 flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-muted p-3">
            <ServiceAvatar name={svc?.name ?? ''} iconUrl={svc?.iconUrl} size={40} />
            <div className="min-w-0">
              <p className="truncate font-semibold uppercase text-content">
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

      <Form layout="vertical" form={form} onFinish={onFinish} disabled={saving}>
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
        <Form.Item label="Fecha del pago" name="date">
          <DatePicker size="large" className="w-full" format="DD/MM/YYYY" inputReadOnly />
        </Form.Item>
        <Form.Item
          label="Comprobante (opcional)"
          extra="Imagen o PDF, máximo 2 MB."
          className="!mb-0"
        >
          {file ? (
            <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
              <PaperClipOutlined className="text-content-subtle" />
              <span className="min-w-0 flex-1 truncate text-content">{file.name}</span>
              <Button
                type="text"
                size="small"
                aria-label="Quitar archivo"
                icon={<DeleteOutlined />}
                onClick={() => setFile(null)}
              />
            </div>
          ) : (
            <Upload accept={RECEIPT_ACCEPT} showUploadList={false} beforeUpload={onPick}>
              <Button icon={<PaperClipOutlined />}>Adjuntar comprobante</Button>
            </Upload>
          )}
        </Form.Item>
      </Form>
    </ResponsiveModal>
  );
}
