import { useAuth } from '@/hooks/use-auth';
import { Navigate } from 'react-router-dom';
import { DASHBOARD_ROUTE } from '../routes';
import { LandingPage } from '@/modules/landing';

export function RootRedirect() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to={DASHBOARD_ROUTE} replace />;
  }

  return <LandingPage />;
}
