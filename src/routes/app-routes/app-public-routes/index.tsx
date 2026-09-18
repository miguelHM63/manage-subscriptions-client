import { LoginPage } from '@/modules/auth/login';
import { PrivacyPage } from '@/modules/legal/pages/privacy.page';
import { TermsPage } from '@/modules/legal/pages/terms.page';
import { SignUpPage } from '@/modules/auth/signup/pages/signup.page';
import { PublicRoute } from '@/routes/components/public-route';
import { RootRedirect } from '@/routes/components/root-route';
import {
  HOME_ROUTE,
  LOGIN_ROUTE,
  PRIVACY_ROUTE,
  RECOVER_PASSWORD_ROUTE,
  RESET_PASSWORD_ROUTE,
  SIGNUP_ROUTE,
  TERMS_ROUTE,
} from '@/routes/routes';
import { RecoverPasswordPage } from '@/modules/auth/recover/pages/recover-password.page';
import { ResetPasswordPage } from '@/modules/auth/recover/pages/reset-password.page';

export const AppPublicRoutes = [
  // Páginas legales: públicas y sin PublicRoute, para verse también con sesión iniciada.
  { path: PRIVACY_ROUTE, element: <PrivacyPage /> },
  { path: TERMS_ROUTE, element: <TermsPage /> },
  {
    path: HOME_ROUTE,
    element: <RootRedirect />,
  },
  {
    path: LOGIN_ROUTE,
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: SIGNUP_ROUTE,
    element: (
      <PublicRoute>
        <SignUpPage />
      </PublicRoute>
    ),
  },
  {
    path: RECOVER_PASSWORD_ROUTE,
    element: (
      <PublicRoute>
        <RecoverPasswordPage />
      </PublicRoute>
    ),
  },
  {
    path: RESET_PASSWORD_ROUTE,
    element: (
      <PublicRoute>
        <ResetPasswordPage />
      </PublicRoute>
    ),
  },
];
