import { DatePicker, Form, InputNumber, Modal, Select } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect } from 'react';

import { REQUIRED } from '@/constants';
import { centsToSoles, solesToCents } from '@/helpers/money';
import { useFormErrorHandler } from '@/hooks/use-form-error-handler';
import {
  useRenewSubscription,
  type ISubscription,
  type PaymentMethod,
} from '../hooks/use-subscriptions';
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

export function RenewModal({ subscription, open, onClose }: Props) {
  const [invalidateForm, form] = useFormErrorHandler();
  const { mutate: renew, isPending } = useRenewSubscription(onClose);

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

  return (
    <Modal
      title="Renovar suscripción"
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Registrar pago"
      cancelText="Cancelar"
      confirmLoading={isPending}
    >
      <Form layout="vertical" form={form} onFinish={onFinish} disabled={isPending}>
        <Form.Item label="Monto cobrado (S/.)" name="amount" rules={REQUIRED}>
          <InputNumber min={0} step={0.5} className="w-full" placeholder="0.00" />
        </Form.Item>
        <Form.Item label="Método de pago" name="method">
          <Select options={PAYMENT_METHOD_OPTIONS} />
        </Form.Item>
        <Form.Item label="Fecha del pago" name="date">
          <DatePicker className="w-full" format="DD/MM/YYYY" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
