import { PublicLayout } from '@/components/layouts/public-layout';
import LoginForm from '../components/login-form';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import { SIGNUP_ROUTE } from '@/routes/routes';

export function LoginPage() {
  return (
    <PublicLayout>
      [Logo here]
      <div className="text-center mt-9">
        <h1 className="text-neutral-600 font-bold text-xl">Demo app</h1>
        <p className="my-6 text-sm text-slate-500">Tagline demo app</p>
      </div>
      <LoginForm />
      <div className="mt-20 text-center">
        <p className="text-slate-700 font-bold text-xs">Not registered yet?</p>
        <Link to={SIGNUP_ROUTE}>
          <Button className="font-bold text-xs" type="link">
            Create an account
          </Button>
        </Link>
      </div>
    </PublicLayout>
  );
}
