import { Button } from 'antd';
import { Link } from 'react-router-dom';

import { BrandMark } from '@/components/brand-logo';
import { APP_NAME } from '@/config';
import { PublicLayout } from '@/components/layouts/public-layout';
import { SIGNUP_ROUTE } from '@/routes/routes';
import LoginForm from '../components/login-form';

export function LoginPage() {
  return (
    <PublicLayout>
      <div className="flex w-full max-w-sm flex-col">
        <div className="mb-8 flex flex-col items-center gap-3.5 text-center">
          <BrandMark size={56} className="shadow-lg shadow-brand-600/25" />
          <div>
            <h1 className="text-[26px] font-black tracking-tight text-brand-ink">{APP_NAME}</h1>
            <p className="mt-1 text-sm text-content-muted">Controla tus planes y cobros</p>
          </div>
        </div>

        <LoginForm />

        <div className="my-5 flex items-center gap-3 text-xs text-content-subtle">
          <span className="h-px flex-1 bg-border" />o<span className="h-px flex-1 bg-border" />
        </div>

        <Link to={SIGNUP_ROUTE}>
          <Button size="large" block className="!h-12 !font-semibold">
            Crear cuenta
          </Button>
        </Link>
      </div>
    </PublicLayout>
  );
}
