import { LoginPage } from '@/modules/auth/login';
import { SignUpPage } from '@/modules/auth/signup/pages/signup.page';
import { PublicRoute } from '@/routes/components/public-route';
import { RootRedirect } from '@/routes/components/root-route';
import { HOME_ROUTE, LOGIN_ROUTE, SIGNUP_ROUTE } from '@/routes/routes';

export const AppPublicRoutes = [
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
];
