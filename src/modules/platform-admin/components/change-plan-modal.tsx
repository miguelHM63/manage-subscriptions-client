import { DatePicker, Form, Segmented } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect } from 'react';

import { ResponsiveModal } from '@/components/panel/responsive-modal';
import { useFormErrorHandler } from '@/hooks/use-form-error-handler';
import {
  BILLING_CYCLE_LABEL,
  PLAN_LABEL,
  type BillingCycle,
  type Plan,
} from '@/modules/organization/hooks/use-my-organization';
import { useChangePlan, type IAdminOrganization } from '../hooks/use-admin-organizations';

interface FormValues {
  plan: Plan;
  billingCycle: BillingCycle;
  planValidUntil?: Dayjs | null;
}

interface Props {
  org: IAdminOrganization;
  open: boolean;
  onClose: () => void;
}

const PLANS: Plan[] = ['free', 'pro', 'business'];
const CYCLES: BillingCycle[] = ['monthly', 'semiannual', 'annual'];

/**
 * Ajuste directo sin registrar pago: cortesías, corregir una fecha o bajar a
 * Free. Para cobros usar "Registrar pago" (queda en el historial).
 */
export function ChangePlanModal({ org, open, onClose }: Props) {
  const [invalidateForm, form] = useFormErrorHandler();
  const { mutate, isPending } = useChangePlan(org.id, onClose);
  const plan = Form.useWatch('plan', form) as Plan | undefined;

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      plan: org.plan,
      billingCycle: org.billingCycle,
      planValidUntil: org.planValidUntil ? dayjs(org.planValidUntil) : null,
    });
  }, [open, org, form]);

  const onFinish = (values: FormValues) =>
    mutate(
      {
        plan: values.plan,
        billingCycle: values.billingCycle,
        // Fin del día: el plan vale todo el último día.
        planValidUntil:
          values.plan !== 'free' && values.planValidUntil
            ? values.planValidUntil.endOf('day').toISOString()
            : undefined,
      },
      { onError: invalidateForm },
    );

  return (
    <ResponsiveModal
      title={`Ajustar plan · ${org.name}`}
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Guardar"
      confirmLoading={isPending}
    >
      <p className="mb-4 text-sm text-content-muted">
        Cambia el plan sin registrar un pago (cortesías o correcciones). Para cobros usa “Registrar
        pago”.
      </p>
      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        disabled={isPending}
        requiredMark={false}
      >
        <Form.Item label="Plan" name="plan">
          <Segmented block options={PLANS.map(p => ({ label: PLAN_LABEL[p], value: p }))} />
        </Form.Item>
        {plan !== 'free' && (
          <>
            <Form.Item label="Ciclo" name="billingCycle">
              <Segmented
                block
                options={CYCLES.map(c => ({ label: BILLING_CYCLE_LABEL[c], value: c }))}
              />
            </Form.Item>
            <Form.Item label="Vence" name="planValidUntil" extra="Déjalo vacío para que no venza.">
              <DatePicker className="w-full" size="large" format="DD/MM/YYYY" allowClear />
            </Form.Item>
          </>
        )}
      </Form>
    </ResponsiveModal>
  );
}
