import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Button, Form, Input, type FormProps } from 'antd';

import { REQUIRED_TEXT } from '@/constants';
import { useAuth } from '@/hooks/use-auth';
import type { ILoginForm } from '../login.interfaces';

export default function LoginForm() {
  const { login, isLoggingIn } = useAuth();

  const onFinish: FormProps<ILoginForm>['onFinish'] = values => {
    login?.(values);
  };

  return (
    <Form
      layout="vertical"
      size="large"
      name="login-form"
      onFinish={onFinish}
      requiredMark={false}
      className="w-full"
    >
      <Form.Item<ILoginForm> label="Correo" name="email" rules={REQUIRED_TEXT}>
        <Input
          type="email"
          inputMode="email"
          autoComplete="email"
          prefix={<MailOutlined className="text-content-subtle" />}
          placeholder="tucorreo@email.com"
          disabled={isLoggingIn}
        />
      </Form.Item>

      {/* TODO: mostrar el enlace "¿La olvidaste?" (RECOVER_PASSWORD_ROUTE) cuando exista la recuperación de contraseña */}
      <Form.Item<ILoginForm> label="Contraseña" name="password" rules={REQUIRED_TEXT}>
        <Input.Password
          autoComplete="current-password"
          prefix={<LockOutlined className="text-content-subtle" />}
          placeholder="Tu contraseña"
          disabled={isLoggingIn}
        />
      </Form.Item>

      <Button type="primary" htmlType="submit" block className="!mt-1 !h-12 !font-semibold" loading={isLoggingIn}>
        Iniciar sesión
      </Button>
    </Form>
  );
}
