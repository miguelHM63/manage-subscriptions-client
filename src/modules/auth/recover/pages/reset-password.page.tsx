import { LockOutlined } from '@ant-design/icons';
import { App, Button, Form, Input } from 'antd';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { PublicLayout } from '@/components/layouts/public-layout';
import { REQUIRED_TEXT } from '@/constants';
import { LOGIN_ROUTE, RECOVER_PASSWORD_ROUTE } from '@/routes/routes';
import { PasswordHint, MIN_PASSWORD_LENGTH } from '../../signup/components/password-hint';
import { useResetPassword } from '../hooks/use-password-recovery';

interface FormValues {
  password: string;
  confirm: string;
}

/** Paso 2: el enlace del correo trae `?token=`; aquí se elige la nueva contraseña. */
export function ResetPasswordPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [form] = Form.useForm<FormValues>();
  const password = Form.useWatch('password', form) ?? '';
  const { mutate: reset, isPending } = useResetPassword();

  const onFinish = ({ password }: FormValues) =>
    reset(
      { token, password },
      {
        onSuccess: () => {
          message.success('Contraseña actualizada. Ya puedes iniciar sesión.');
          navigate(LOGIN_ROUTE, { replace: true });
        },
      },
    );

  return (
    <PublicLayout>
      <div className="flex w-full max-w-sm flex-col gap-6">
        {!token ? (
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-content">Enlace no válido</h1>
            <p className="text-sm text-content-muted">
              Este enlace está incompleto o ya venció. Pide uno nuevo para restablecer tu contraseña.
            </p>
            <Link to={RECOVER_PASSWORD_ROUTE} className="mt-2">
              <Button type="primary" size="large" block className="!h-12 !font-semibold">
                Pedir otro enlace
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-content">Crea una nueva contraseña</h1>
              <p className="mt-1.5 text-sm text-content-muted">La usarás para entrar a Plancito.</p>
            </div>
            <Form form={form} layout="vertical" size="large" requiredMark={false} onFinish={onFinish}>
              <Form.Item
                label="Nueva contraseña"
                name="password"
                rules={[...REQUIRED_TEXT, { min: MIN_PASSWORD_LENGTH, message: `Mínimo ${MIN_PASSWORD_LENGTH} caracteres` }]}
                validateTrigger="onBlur"
                extra={<PasswordHint value={password} />}
              >
                <Input.Password
                  autoComplete="new-password"
                  prefix={<LockOutlined className="text-content-subtle" />}
                  disabled={isPending}
                />
              </Form.Item>
              <Form.Item
                label="Confirmar contraseña"
                name="confirm"
                dependencies={['password']}
                rules={[
                  ...REQUIRED_TEXT,
                  ({ getFieldValue }) => ({
                    validator: (_, value) =>
                      !value || value === getFieldValue('password')
                        ? Promise.resolve()
                        : Promise.reject(new Error('Las contraseñas no coinciden')),
                  }),
                ]}
              >
                <Input.Password
                  autoComplete="new-password"
                  prefix={<LockOutlined className="text-content-subtle" />}
                  disabled={isPending}
                />
              </Form.Item>
              <Button type="primary" htmlType="submit" block loading={isPending} className="!h-12 !font-semibold">
                Guardar contraseña
              </Button>
            </Form>
          </>
        )}
      </div>
    </PublicLayout>
  );
}
