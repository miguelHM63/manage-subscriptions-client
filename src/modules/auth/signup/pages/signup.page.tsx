import { useTranslation } from 'react-i18next';

import { BrandMark } from '@/components/brand-logo';
import { PublicLayout } from '@/components/layouts/public-layout';
import { SignupForm } from '../components/signup-form';

export function SignUpPage() {
  const { t } = useTranslation('auth');
  return (
    <PublicLayout>
      <div className="flex w-full max-w-sm flex-col">
        <div className="mb-7 flex flex-col gap-3">
          <BrandMark size={44} />
          <div>
            <h1 className="text-[26px] font-extrabold tracking-tight text-content">{t('signUp.title')}</h1>
            <p className="mt-1 text-sm text-content-muted">{t('signUp.description')}</p>
          </div>
        </div>
        <SignupForm />
      </div>
    </PublicLayout>
  );
}
