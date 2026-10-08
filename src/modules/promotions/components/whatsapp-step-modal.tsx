import { WhatsAppOutlined } from '@ant-design/icons';
import { Form, Input } from 'antd';

import { ResponsiveModal } from '@/components/panel/responsive-modal';
import { REQUIRED_TEXT } from '@/constants';

interface Props {
  open: boolean;
  saving?: boolean;
  onCancel: () => void;
  /** Guarda el número en el perfil y publica. */
  onSubmit: (phone: string) => void;
}

/** Paso obligatorio antes de publicar si el usuario no tiene WhatsApp. */
export function WhatsappStepModal({ open, saving, onCancel, onSubmit }: Props) {
  const [form] = Form.useForm<{ phone: string }>();

  return (
    <ResponsiveModal
      title="¿A qué WhatsApp te escriben?"
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Guardar y publicar"
      confirmLoading={saving}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 text-2xl text-green-700 dark:bg-green-500/15 dark:text-green-400">
            <WhatsAppOutlined />
          </span>
          <p className="text-sm text-content-muted">
            Quien abra el link de tu promo toca «Consultar» y te escribe a este número. Sin él no
            podemos publicarla.
          </p>
        </div>
        <Form form={form} layout="vertical" onFinish={values => onSubmit(values.phone.trim())}>
          <Form.Item
            label="Tu WhatsApp"
            name="phone"
            rules={REQUIRED_TEXT}
            extra="Se guarda en Mi cuenta; puedes cambiarlo cuando quieras."
            className="!mb-0"
          >
            <Input size="large" inputMode="tel" placeholder="+51 999 999 999" autoFocus />
          </Form.Item>
        </Form>
      </div>
    </ResponsiveModal>
  );
}
