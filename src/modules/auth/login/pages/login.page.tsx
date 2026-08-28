import { PublicLayout } from '@/components/layouts/public-layout';
import LoginForm from '../components/login-form';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import { SIGNUP_ROUTE } from '@/routes/routes';

export function LoginPage() {
  return (
    <PublicLayout>
      <div className="flex w-full max-w-md flex-col items-center px-5 md:px-16">
        <span className="text-2xl font-black text-brand-primary">Plancito</span>
        <div className="mt-6 text-center">
          <h1 className="text-lg font-bold text-content">Inicia sesión</h1>
          <p className="text-sm text-content-muted">Bienvenido de vuelta 👋</p>
        </div>

        <LoginForm />

        <div className="mt-8 text-center text-sm">
          <span className="text-content-muted">¿No tienes cuenta?</span>
          <Link to={SIGNUP_ROUTE}>
            <Button type="link" className="!px-1 font-semibold">
              Crear cuenta
            </Button>
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
