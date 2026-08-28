import { useAuth } from '@/hooks/use-auth';
import { Button, Form, Input, type FormProps } from 'antd';
import type { ILoginForm } from '../login.interfaces';
import { REQUIRED_TEXT } from '@/constants';

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
      className="mt-8 w-full"
    >
      <Form.Item<ILoginForm> label="Email" name="email" rules={REQUIRED_TEXT}>
        <Input type="email" placeholder="tucorreo@email.com" disabled={isLoggingIn} />
      </Form.Item>

      <Form.Item<ILoginForm> label="Contraseña" name="password" rules={REQUIRED_TEXT}>
        <Input.Password placeholder="Tu contraseña" disabled={isLoggingIn} />
      </Form.Item>

      <Button
        type="primary"
        htmlType="submit"
        className="mt-2 w-full"
        loading={isLoggingIn}
      >
        Iniciar sesión
      </Button>
    </Form>
  );
}
