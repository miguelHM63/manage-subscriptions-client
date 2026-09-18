import { useTranslation } from 'react-i18next';

import { BrandMark } from '@/components/brand-logo';
import { PublicLayout } from '@/components/layouts/public-layout';
import { GOOGLE_CLIENT_ID } from '@/config';
import { GoogleSignInButton } from '../../components/google-sign-in-button';
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
        {GOOGLE_CLIENT_ID && (
          <>
            <GoogleSignInButton />
            <div className="mb-5 flex items-center gap-3 text-xs text-content-subtle">
              <span className="h-px flex-1 bg-border" />o con tu correo<span className="h-px flex-1 bg-border" />
            </div>
          </>
        )}
        <SignupForm />
      </div>
    </PublicLayout>
  );
}
