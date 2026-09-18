import { ArrowLeftOutlined, MailOutlined } from '@ant-design/icons';
import { Button, Form, Input } from 'antd';
import { Link } from 'react-router-dom';

import { PublicLayout } from '@/components/layouts/public-layout';
import { REQUIRED_TEXT } from '@/constants';
import { LOGIN_ROUTE } from '@/routes/routes';
import { useRecoverPassword } from '../hooks/use-password-recovery';

/** Paso 1: pedir el enlace de recuperación por correo. */
export function RecoverPasswordPage() {
  const { mutate: recover, isPending, isSuccess, variables } = useRecoverPassword();

  return (
    <PublicLayout>
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link to={LOGIN_ROUTE} className="flex items-center gap-2 !text-sm !font-semibold !text-content-muted">
          <ArrowLeftOutlined /> Volver
        </Link>

        {isSuccess ? (
          <div className="flex flex-col gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-2xl text-green-700 dark:bg-green-500/15 dark:text-green-300">
              <MailOutlined />
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-content">Revisa tu correo</h1>
            <p className="text-sm text-content-muted">
              Si <strong className="text-content">{variables?.email}</strong> tiene una cuenta, te
              enviamos un enlace para crear una nueva contraseña. Revisa también la carpeta de spam.
            </p>
            <Link to={LOGIN_ROUTE} className="mt-3">
              <Button size="large" block className="!h-12 !font-semibold">
                Volver a iniciar sesión
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-content">¿Olvidaste tu contraseña?</h1>
              <p className="mt-1.5 text-sm text-content-muted">
                Escribe tu correo y te enviamos un enlace para crear una nueva.
              </p>
            </div>
            <Form layout="vertical" size="large" requiredMark={false} onFinish={recover}>
              <Form.Item label="Correo" name="email" rules={[...REQUIRED_TEXT, { type: 'email' }]}>
                <Input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  prefix={<MailOutlined className="text-content-subtle" />}
                  placeholder="tucorreo@email.com"
                  disabled={isPending}
                />
              </Form.Item>
              <Button type="primary" htmlType="submit" block loading={isPending} className="!h-12 !font-semibold">
                Enviar enlace
              </Button>
            </Form>
          </>
        )}
      </div>
    </PublicLayout>
  );
}
