import { useTranslation } from 'react-i18next';
import { PublicLayout } from '@/components/layouts/public-layout';
import { SignupForm } from '../components/signup-form';

export function SignUpPage() {
  const { t } = useTranslation('auth');
  return (
    <PublicLayout>
      <div className="flex flex-col items-center justify-center w-full max-w-md px-5 md:px-16">
        <span className="text-2xl font-black text-brand-primary">Plancito</span>
        <div className="mt-6 flex flex-col items-center justify-center gap-1 text-center">
          <h1 className="text-lg font-bold text-content">{t('signUp.title')}</h1>
          <p className="text-sm text-content-muted">{t('signUp.description')}</p>
        </div>
        <SignupForm />
      </div>
    </PublicLayout>
  );
}
