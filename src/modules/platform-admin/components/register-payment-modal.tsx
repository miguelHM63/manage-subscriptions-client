import { Form, Input, InputNumber, Segmented } from 'antd';
import { useEffect } from 'react';

import { ResponsiveModal } from '@/components/panel/responsive-modal';
import { formatDate } from '@/helpers/dates';
import { solesToCents } from '@/helpers/money';
import { useFormErrorHandler } from '@/hooks/use-form-error-handler';
import {
  BILLING_CYCLE_LABEL,
  PLAN_LABEL,
  type BillingCycle,
} from '@/modules/organization/hooks/use-my-organization';
import { PLAN_PRICES } from '@/modules/organization/plans';
import { useRegisterPlanPayment, type IAdminOrganization } from '../hooks/use-admin-organizations';
import { previewValidity } from '../plan-validity';

type PaidPlan = keyof typeof PLAN_PRICES;

interface FormValues {
  plan: PaidPlan;
  billingCycle: BillingCycle;
  amount: number;
  note?: string;
}

interface Props {
  org: IAdminOrganization;
  open: boolean;
  onClose: () => void;
}

const CYCLES: BillingCycle[] = ['monthly', 'semiannual', 'annual'];

/** Registra un pago manual (Yape/Plin…) y activa o renueva el plan. */
export function RegisterPaymentModal({ org, open, onClose }: Props) {
  const [invalidateForm, form] = useFormErrorHandler();
  const { mutate, isPending } = useRegisterPlanPayment(org.id, onClose);

  const plan = Form.useWatch('plan', form) as PaidPlan | undefined;
  const cycle = Form.useWatch('billingCycle', form) as BillingCycle | undefined;

  useEffect(() => {
    if (!open) return;
    // Por defecto, renovar lo que ya tiene (o pasar de Free a Pro).
    const initialPlan: PaidPlan = org.plan === 'free' ? 'pro' : org.plan;
    const initialCycle = org.plan === 'free' ? 'monthly' : org.billingCycle;
    form.setFieldsValue({
      plan: initialPlan,
      billingCycle: initialCycle,
      amount: PLAN_PRICES[initialPlan][initialCycle],
      note: undefined,
    });
  }, [open, org, form]);

  // El monto sugerido sigue al plan/ciclo elegido (se puede editar).
  const onValuesChange = (changed: Partial<FormValues>, all: FormValues) => {
    if (changed.plan || changed.billingCycle) {
      form.setFieldValue('amount', PLAN_PRICES[all.plan][all.billingCycle]);
    }
  };

  const preview = plan && cycle ? previewValidity(org, plan, cycle) : undefined;

  const onFinish = (values: FormValues) =>
    mutate(
      {
        plan: values.plan,
        billingCycle: values.billingCycle,
        amount: solesToCents(values.amount),
        note: values.note || undefined,
      },
      { onError: invalidateForm },
    );

  return (
    <ResponsiveModal
      title={`Registrar pago · ${org.name}`}
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Registrar y activar"
      confirmLoading={isPending}
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        onValuesChange={onValuesChange}
        disabled={isPending}
        requiredMark={false}
      >
        <Form.Item label="Plan" name="plan">
          <Segmented
            block
            options={(Object.keys(PLAN_PRICES) as PaidPlan[]).map(p => ({
              label: PLAN_LABEL[p],
              value: p,
            }))}
          />
        </Form.Item>
        <Form.Item label="Ciclo" name="billingCycle">
          <Segmented
            block
            options={CYCLES.map(c => ({ label: BILLING_CYCLE_LABEL[c], value: c }))}
          />
        </Form.Item>
        <Form.Item
          label="Monto recibido"
          name="amount"
          rules={[{ required: true, message: 'Ingresa el monto' }]}
        >
          <InputNumber
            className="!w-full"
            size="large"
            min={0}
            step={1}
            precision={2}
            prefix="S/"
          />
        </Form.Item>
        <Form.Item label="Nota (opcional)" name="note">
          <Input size="large" maxLength={200} placeholder="Yape op. 123456" />
        </Form.Item>
      </Form>
      {preview && (
        <p className="rounded-lg bg-surface-hover px-3 py-2.5 text-sm text-content">
          Vigente hasta el <strong>{formatDate(preview.until.toDate(), 'D MMM YYYY')}</strong>
          <span className="block text-xs text-content-muted">
            {preview.stacks
              ? `Se suma desde el vencimiento actual (${formatDate(preview.from.toDate(), 'D MMM')}).`
              : preview.creditDays > 0
                ? `Cuenta desde hoy e incluye ${preview.creditDays} días por lo que quedaba del plan ${PLAN_LABEL[org.plan]}.`
                : 'Cuenta desde hoy.'}
          </span>
        </p>
      )}
    </ResponsiveModal>
  );
}
