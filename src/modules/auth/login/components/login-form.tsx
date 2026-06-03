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
    <Form name="login-form" onFinish={onFinish} className="mt-8 w-full lg:max-w-2/4">
      <Form.Item<ILoginForm> name="email" rules={REQUIRED_TEXT}>
        <Input placeholder="Email" />
      </Form.Item>

      <Form.Item<ILoginForm> name="password" rules={REQUIRED_TEXT}>
        <Input.Password placeholder="Password" />
      </Form.Item>
      <p className="text-center mt-3 text-xs font-bold text-slate-800">Forgot your password?</p>
      <div className="mt-6">
        <Button type="primary" htmlType="submit" className="w-full" loading={isLoggingIn}>
          Log in
        </Button>
      </div>
    </Form>
  );
}
